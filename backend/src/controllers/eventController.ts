import type { Request, Response } from "express"
import pool from "@/config/database"
import type { AuthenticatedRequest, ApiResponse, CreateEventRequest } from "@/types"
import { EmailService } from "@/services/emailService"

export class EventController {
  static async getEvents(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { event_type, search, sort = "new", limit = "20", offset = "0" } = req.query
      const userId = (req as AuthenticatedRequest).user?.id

      console.log("[v0] Fetching events - userId:", userId, "filters:", { event_type, search, sort })

      let query = `
        SELECT 
          e.*,
          u.name as organizer_name,
          COALESCE(interested.count, 0) as interested_count,
          COALESCE(not_interested.count, 0) as not_interested_count,
          user_interests.interest_type as user_interest
          ${userId ? ", CASE WHEN user_subscriptions.id IS NOT NULL THEN true ELSE false END as is_subscribed" : ", false as is_subscribed"}
        FROM events e
        JOIN users u ON e.user_id = u.id
        LEFT JOIN (
          SELECT event_id, COUNT(*) as count 
          FROM event_interests 
          WHERE interest_type = 'interested' 
          GROUP BY event_id
        ) interested ON e.id = interested.event_id
        LEFT JOIN (
          SELECT event_id, COUNT(*) as count 
          FROM event_interests 
          WHERE interest_type = 'not_interested' 
          GROUP BY event_id
        ) not_interested ON e.id = not_interested.event_id
        LEFT JOIN event_interests user_interests ON e.id = user_interests.event_id AND user_interests.user_id = $1
        ${userId ? "LEFT JOIN event_subscriptions user_subscriptions ON e.id = user_subscriptions.event_id AND user_subscriptions.user_id = $1" : ""}
      `

      const conditions: string[] = ["e.is_active = true"]
      const values: any[] = [userId || null]
      let paramCount = 1

      if (event_type && event_type !== "all") {
        paramCount++
        conditions.push(`e.event_type = $${paramCount}`)
        values.push(event_type)
      }

      if (search) {
        paramCount++
        conditions.push(
          `(e.event_name ILIKE $${paramCount} OR e.event_description ILIKE $${paramCount} OR e.event_location ILIKE $${paramCount})`,
        )
        values.push(`%${search}%`)
      }

      query += ` WHERE ${conditions.join(" AND ")}`

      // Add sorting
      if (sort === "popular") {
        query += ` ORDER BY COALESCE(interested.count, 0) DESC, e.event_time ASC`
      } else if (sort === "upcoming") {
        query += ` ORDER BY e.event_time ASC`
      } else {
        query += ` ORDER BY e.created_at DESC`
      }

      query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
      values.push(Number.parseInt(limit as string), Number.parseInt(offset as string))

      console.log("[v0] Executing query with", values.length, "parameters")
      const result = await pool.query(query, values)
      console.log("[v0] Query successful - found", result.rows.length, "events")

      res.json({
        success: true,
        message: "Events retrieved successfully",
        data: {
          events: result.rows,
          total: result.rows.length,
        },
      })
    } catch (error) {
      console.error("[v0] Get events error:", error)
      console.error("[v0] Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      })
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  static async createEvent(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id
      const { event_name, event_place, event_time, event_type, event_description, event_location, image_url } =
        req.body as CreateEventRequest

      // Manual validation to ensure event time is in the future
      const eventDate = new Date(event_time)
      const now = new Date()

      if (eventDate <= now) {
        res.status(400).json({
          success: false,
          message: "Event time must be in the future",
        })
        return
      }

      const result = await pool.query(
        `INSERT INTO events (
          user_id, event_name, event_place, event_time, event_type, 
          event_description, event_location, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *`,
        [userId, event_name, event_place, event_time, event_type, event_description, event_location, image_url],
      )

      const event = result.rows[0]

      res.status(201).json({
        success: true,
        message: "Event created successfully",
        data: { event },
      })
    } catch (error) {
      console.error("Create event error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async markInterest(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const { interest_type } = req.body
      const userId = req.user!.id

      if (!["interested", "not_interested"].includes(interest_type)) {
        res.status(400).json({
          success: false,
          message: "Invalid interest type",
        })
        return
      }

      // Check if event exists
      const eventResult = await pool.query("SELECT id FROM events WHERE id = $1", [id])
      if (eventResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Event not found",
        })
        return
      }

      // Insert or update interest (upsert)
      await pool.query(
        `INSERT INTO event_interests (event_id, user_id, interest_type) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (event_id, user_id) 
         DO UPDATE SET interest_type = $3, created_at = CURRENT_TIMESTAMP`,
        [id, userId, interest_type],
      )

      res.json({
        success: true,
        message: "Interest recorded successfully",
      })
    } catch (error) {
      console.error("Mark interest error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async deleteEvent(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user!.id
      const userRole = req.user!.role

      // Get event details
      const eventResult = await pool.query(
        `SELECT e.*, u.name as organizer_name 
         FROM events e 
         JOIN users u ON e.user_id = u.id 
         WHERE e.id = $1`,
        [id],
      )

      if (eventResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Event not found",
        })
        return
      }

      const event = eventResult.rows[0]

      // Check if user can delete this event (own event or admin)
      if (event.user_id !== userId && userRole !== "admin") {
        res.status(403).json({
          success: false,
          message: "You can only delete your own events",
        })
        return
      }

      // Delete event (interests will be deleted automatically due to CASCADE)
      await pool.query("DELETE FROM events WHERE id = $1", [id])

      res.json({
        success: true,
        message: `Event "${event.title}" deleted successfully`,
      })
    } catch (error) {
      console.error("Delete event error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async subscribeToEvent(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user!.id
      const userEmail = req.user!.email

      console.log("[v0] Subscribe request - eventId:", id, "userId:", userId)

      // Check if event exists
      const eventResult = await pool.query(
        `SELECT e.*, u.name as organizer_name 
         FROM events e 
         JOIN users u ON e.user_id = u.id 
         WHERE e.id = $1 AND e.is_active = true`,
        [id],
      )

      if (eventResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Event not found",
        })
        return
      }

      const event = eventResult.rows[0]

      // Check if already subscribed
      const existingSubscription = await pool.query(
        "SELECT id FROM event_subscriptions WHERE event_id = $1 AND user_id = $2",
        [id, userId],
      )

      if (existingSubscription.rows.length > 0) {
        res.status(400).json({
          success: false,
          message: "You are already subscribed to this event",
        })
        return
      }

      // Create subscription
      await pool.query("INSERT INTO event_subscriptions (event_id, user_id) VALUES ($1, $2)", [id, userId])

      // Get user details for email
      const userResult = await pool.query("SELECT name, email FROM users WHERE id = $1", [userId])
      const user = userResult.rows[0]

      // Send subscription email with calendar link
      try {
        await EmailService.sendEventSubscriptionEmail(user.email, user.name, {
          event_name: event.event_name,
          event_time: event.event_time,
          event_place: event.event_place,
          event_location: event.event_location,
          event_description: event.event_description,
          event_type: event.event_type,
        })

        console.log(`[v0] Subscription email sent successfully to ${user.email} for event ${event.event_name}`)
      } catch (emailError) {
        console.error("[v0] Failed to send subscription email:", emailError)
        // Don't fail the subscription if email fails
      }

      res.status(201).json({
        success: true,
        message: "Successfully subscribed to event! Check your email for event details and calendar link.",
      })
    } catch (error) {
      console.error("[v0] Subscribe to event error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async unsubscribeFromEvent(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user!.id

      console.log("[v0] Unsubscribe request - eventId:", id, "userId:", userId)

      // Check if subscribed
      const existingSubscription = await pool.query(
        "SELECT id FROM event_subscriptions WHERE event_id = $1 AND user_id = $2",
        [id, userId],
      )

      if (existingSubscription.rows.length === 0) {
        res.status(400).json({
          success: false,
          message: "You are not subscribed to this event",
        })
        return
      }

      // Delete subscription
      await pool.query("DELETE FROM event_subscriptions WHERE event_id = $1 AND user_id = $2", [id, userId])

      res.json({
        success: true,
        message: "Successfully unsubscribed from event",
      })
    } catch (error) {
      console.error("[v0] Unsubscribe from event error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }
}

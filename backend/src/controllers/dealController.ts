import type { Request, Response } from "express"
import pool from "@/config/database"
import type { AuthenticatedRequest, ApiResponse, CreateDealRequest } from "@/types"

export class DealController {
  static async getDeals(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { category, search, sort = "new", limit = "20", offset = "0" } = req.query
      const userId = (req as AuthenticatedRequest).user?.id

      let query = `
        SELECT 
          d.*,
          u.name as uploader_name,
          COALESCE(upvotes.count, 0) as upvotes,
          COALESCE(downvotes.count, 0) as downvotes,
          user_votes.vote_type as user_vote
        FROM deals d
        JOIN users u ON d.user_id = u.id
        LEFT JOIN (
          SELECT deal_id, COUNT(*) as count 
          FROM deal_votes 
          WHERE vote_type = 'up' 
          GROUP BY deal_id
        ) upvotes ON d.id = upvotes.deal_id
        LEFT JOIN (
          SELECT deal_id, COUNT(*) as count 
          FROM deal_votes 
          WHERE vote_type = 'down' 
          GROUP BY deal_id
        ) downvotes ON d.id = downvotes.deal_id
        LEFT JOIN deal_votes user_votes ON d.id = user_votes.deal_id AND user_votes.user_id = $1
      `

      const conditions: string[] = ["d.is_active = true"]
      const values: any[] = [userId || null]
      let paramCount = 1

      if (category && category !== "all") {
        paramCount++
        conditions.push(`d.category = $${paramCount}`)
        values.push(category)
      }

      if (search) {
        paramCount++
        conditions.push(`(d.title ILIKE $${paramCount} OR d.description ILIKE $${paramCount})`)
        values.push(`%${search}%`)
      }

      query += ` WHERE ${conditions.join(" AND ")}`

      // Add sorting
      if (sort === "hot") {
        query += ` ORDER BY (COALESCE(upvotes.count, 0) - COALESCE(downvotes.count, 0)) DESC, d.created_at DESC`
      } else if (sort === "top") {
        query += ` ORDER BY COALESCE(upvotes.count, 0) DESC, d.created_at DESC`
      } else {
        query += ` ORDER BY d.created_at DESC`
      }

      query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
      values.push(Number.parseInt(limit as string), Number.parseInt(offset as string))

      const result = await pool.query(query, values)

      res.json({
        success: true,
        message: "Deals retrieved successfully",
        data: {
          deals: result.rows,
          total: result.rows.length,
        },
      })
    } catch (error) {
      console.error("Get deals error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async createDeal(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id
      const {
        title,
        description,
        original_price,
        deal_price,
        website_url,
        website_name,
        category = "general",
        image_url,
        expires_at,
      } = req.body as CreateDealRequest

      // Calculate discount percentage if both prices provided
      let discount_percentage = null
      if (original_price && deal_price && original_price > deal_price) {
        discount_percentage = Math.round(((original_price - deal_price) / original_price) * 100)
      }

      const result = await pool.query(
        `INSERT INTO deals (
          user_id, title, description, original_price, deal_price, 
          discount_percentage, website_url, website_name, category, 
          image_url, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *`,
        [
          userId,
          title,
          description,
          original_price,
          deal_price,
          discount_percentage,
          website_url,
          website_name,
          category,
          image_url,
          expires_at,
        ],
      )

      const deal = result.rows[0]

      res.status(201).json({
        success: true,
        message: "Deal posted successfully",
        data: { deal },
      })
    } catch (error) {
      console.error("Create deal error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async voteDeal(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const { vote_type } = req.body
      const userId = req.user!.id

      if (!["up", "down"].includes(vote_type)) {
        res.status(400).json({
          success: false,
          message: "Invalid vote type",
        })
        return
      }

      // Check if deal exists
      const dealResult = await pool.query("SELECT id FROM deals WHERE id = $1", [id])
      if (dealResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Deal not found",
        })
        return
      }

      // Insert or update vote (upsert)
      await pool.query(
        `INSERT INTO deal_votes (deal_id, user_id, vote_type) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (deal_id, user_id) 
         DO UPDATE SET vote_type = $3, created_at = CURRENT_TIMESTAMP`,
        [id, userId, vote_type],
      )

      res.json({
        success: true,
        message: "Vote recorded successfully",
      })
    } catch (error) {
      console.error("Vote deal error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async deleteDeal(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user!.id
      const userRole = req.user!.role

      // Get deal details
      const dealResult = await pool.query(
        `SELECT d.*, u.name as uploader_name 
         FROM deals d 
         JOIN users u ON d.user_id = u.id 
         WHERE d.id = $1`,
        [id],
      )

      if (dealResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Deal not found",
        })
        return
      }

      const deal = dealResult.rows[0]

      // Check if user can delete this deal (own deal or admin)
      if (deal.user_id !== userId && userRole !== "admin") {
        res.status(403).json({
          success: false,
          message: "You can only delete your own deals",
        })
        return
      }

      // Delete deal (votes will be deleted automatically due to CASCADE)
      await pool.query("DELETE FROM deals WHERE id = $1", [id])

      res.json({
        success: true,
        message: `Deal "${deal.title}" deleted successfully`,
      })
    } catch (error) {
      console.error("Delete deal error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }
}

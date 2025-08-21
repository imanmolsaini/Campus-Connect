import type { Request, Response } from "express"
import pool from "@/config/database"
import type { AuthenticatedRequest, ApiResponse, CreateLecturerRequest } from "@/types"

export class LecturerController {
  static async getLecturers(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { search } = req.query

      let query = `
        SELECT 
          l.id,
          l.name,
          l.profile_image_url,
          l.description,
          l.created_at,
          l.updated_at,
          COUNT(DISTINCT lf.id) as feedback_count,
          ROUND(AVG(lf.rating), 2) as avg_feedback_rating,
          COUNT(DISTINCT q.id) as quote_count
        FROM lecturers l
        LEFT JOIN lecturer_feedback lf ON l.id = lf.lecturer_id
        LEFT JOIN quotes q ON l.id = q.lecturer_id
      `

      const values: any[] = []
      let paramCount = 0

      if (search) {
        paramCount++
        query += ` WHERE l.name ILIKE $${paramCount}`
        values.push(`%${search}%`)
      }

      query += ` GROUP BY l.id, l.name, l.profile_image_url, l.description, l.created_at, l.updated_at ORDER BY l.name`

      const result = await pool.query(query, values)

      res.json({
        success: true,
        message: "Lecturers retrieved successfully",
        data: {
          lecturers: result.rows,
          total: result.rows.length,
        },
      })
    } catch (error) {
      console.error("Get lecturers error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async getLecturer(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params

      const lecturerResult = await pool.query(
        `SELECT 
          l.id,
          l.name,
          l.profile_image_url,
          l.description,
          l.created_at,
          l.updated_at,
          COUNT(DISTINCT lf.id) as feedback_count,
          ROUND(AVG(lf.rating), 2) as avg_feedback_rating,
          COUNT(DISTINCT q.id) as quote_count
        FROM lecturers l
        LEFT JOIN lecturer_feedback lf ON l.id = lf.lecturer_id
        LEFT JOIN quotes q ON l.id = q.lecturer_id
        WHERE l.id = $1
        GROUP BY l.id, l.name, l.profile_image_url, l.description, l.created_at, l.updated_at`,
        [id],
      )

      if (lecturerResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Lecturer not found",
        })
        return
      }

      const lecturer = lecturerResult.rows[0]

      // Get recent feedback for this lecturer
      const feedbackResult = await pool.query(
        `SELECT 
          lf.*,
          CASE 
            WHEN lf.anonymous = true THEN 'Anonymous'
            ELSE u.name
          END as reviewer_name,
          c.code as course_code,
          c.name as course_name
        FROM lecturer_feedback lf
        JOIN users u ON lf.user_id = u.id
        LEFT JOIN courses c ON lf.course_id = c.id
        WHERE lf.lecturer_id = $1
        ORDER BY lf.created_at DESC
        LIMIT 5`,
        [id],
      )

      // Get quotes for this lecturer
      const quotesResult = await pool.query(
        `SELECT 
          q.*,
          u.name as uploader_name
        FROM quotes q
        JOIN users u ON q.user_id = u.id
        WHERE q.lecturer_id = $1
        ORDER BY q.created_at DESC
        LIMIT 5`,
        [id],
      )

      res.json({
        success: true,
        message: "Lecturer retrieved successfully",
        data: {
          lecturer,
          recent_feedback: feedbackResult.rows,
          recent_quotes: quotesResult.rows,
        },
      })
    } catch (error) {
      console.error("Get lecturer error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async createLecturer(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        })
        return
      }

      // Check if user is admin
      if (req.user.role !== "admin") {
        res.status(403).json({
          success: false,
          message: "Admin access required to create lecturers",
        })
        return
      }

      const { name, profile_image_url, description } = req.body as CreateLecturerRequest

      // Validate required fields
      if (!name || name.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Lecturer name is required",
        })
        return
      }

      // Check if lecturer already exists (case-insensitive)
      const existingLecturer = await pool.query("SELECT id, name FROM lecturers WHERE LOWER(name) = LOWER($1)", [
        name.trim(),
      ])

      if (existingLecturer.rows.length > 0) {
        res.status(400).json({
          success: false,
          message: `Lecturer with name "${existingLecturer.rows[0].name}" already exists`,
        })
        return
      }

      const defaultImageUrl = profile_image_url || "/default-profile.png"

      // Create new lecturer
      const result = await pool.query(
        `INSERT INTO lecturers (name, profile_image_url, description) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [name.trim(), defaultImageUrl, description?.trim() || null],
      )

      const lecturer = result.rows[0]

      console.log("Lecturer created successfully:", lecturer)

      res.status(201).json({
        success: true,
        message: "Lecturer created successfully",
        data: { lecturer },
      })
    } catch (error) {
      console.error("Create lecturer error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined,
      })
    }
  }

  static async updateLecturer(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      // Check if user is authenticated and is admin
      if (!req.user || req.user.role !== "admin") {
        res.status(403).json({
          success: false,
          message: "Admin access required",
        })
        return
      }

      const { id } = req.params
      const { name, profile_image_url, description } = req.body as CreateLecturerRequest

      // Validate required fields
      if (!name || name.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Lecturer name is required",
        })
        return
      }

      // Check if lecturer exists
      const existingLecturer = await pool.query("SELECT id FROM lecturers WHERE id = $1", [id])
      if (existingLecturer.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Lecturer not found",
        })
        return
      }

      // Check if another lecturer with the same name exists (excluding current one)
      const duplicateLecturer = await pool.query(
        "SELECT id, name FROM lecturers WHERE LOWER(name) = LOWER($1) AND id != $2",
        [name.trim(), id],
      )

      if (duplicateLecturer.rows.length > 0) {
        res.status(400).json({
          success: false,
          message: `Another lecturer with name "${duplicateLecturer.rows[0].name}" already exists`,
        })
        return
      }

      // Update lecturer
      const result = await pool.query(
        `UPDATE lecturers 
         SET name = $1, profile_image_url = $2, description = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 
         RETURNING *`,
        [name.trim(), profile_image_url || "/default-profile.png", description?.trim() || null, id],
      )

      const lecturer = result.rows[0]

      res.json({
        success: true,
        message: "Lecturer updated successfully",
        data: { lecturer },
      })
    } catch (error) {
      console.error("Update lecturer error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async deleteLecturer(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      // Check if user is authenticated and is admin
      if (!req.user || req.user.role !== "admin") {
        res.status(403).json({
          success: false,
          message: "Admin access required",
        })
        return
      }

      const { id } = req.params

      // Check if lecturer exists
      const existingLecturer = await pool.query("SELECT id, name FROM lecturers WHERE id = $1", [id])
      if (existingLecturer.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Lecturer not found",
        })
        return
      }

      // Delete lecturer (this will cascade delete related feedback and quotes)
      await pool.query("DELETE FROM lecturers WHERE id = $1", [id])

      res.json({
        success: true,
        message: `Lecturer "${existingLecturer.rows[0].name}" deleted successfully`,
      })
    } catch (error) {
      console.error("Delete lecturer error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }
}

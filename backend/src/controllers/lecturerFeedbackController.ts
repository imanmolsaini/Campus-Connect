import type { Request, Response } from "express"
import pool from "@/config/database"
import type { AuthenticatedRequest, ApiResponse, CreateLecturerFeedbackRequest } from "@/types"

export class LecturerFeedbackController {
  static async getLecturerFeedback(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { lecturer_id, course_id, limit = "10", offset = "0" } = req.query

      let query = `
        SELECT 
          lf.*,
          l.name as lecturer_name_from_table, -- Get name from lecturers table
          CASE 
            WHEN lf.anonymous = true THEN 'Anonymous'
            ELSE u.name
          END as reviewer_name,
          c.name as course_name,
          c.code as course_code
        FROM lecturer_feedback lf
        JOIN users u ON lf.user_id = u.id
        LEFT JOIN lecturers l ON lf.lecturer_id = l.id -- Join with lecturers table
        LEFT JOIN courses c ON lf.course_id = c.id
      `

      const conditions: string[] = []
      const values: any[] = []
      let paramCount = 0

      if (lecturer_id) {
        paramCount++
        conditions.push(`lf.lecturer_id = $${paramCount}`)
        values.push(lecturer_id)
      }

      if (course_id) {
        paramCount++
        conditions.push(`lf.course_id = $${paramCount}`)
        values.push(course_id)
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`
      }

      query += ` ORDER BY lf.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
      values.push(Number.parseInt(limit as string), Number.parseInt(offset as string))

      const result = await pool.query(query, values)

      // Map lecturer_name_from_table to lecturer_name if lecturer_id is present
      const feedbackData = result.rows.map((row) => ({
        ...row,
        lecturer_name: row.lecturer_name_from_table || row.lecturer_name, // Prefer name from lecturers table
      }))

      res.json({
        success: true,
        message: "Lecturer feedback retrieved successfully",
        data: {
          feedback: feedbackData,
          total: result.rows.length,
        },
      })
    } catch (error) {
      console.error("Get lecturer feedback error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async createLecturerFeedback(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id
      const {
        lecturer_id,
        lecturer_name, // Kept for initial seeding/fallback
        course_id,
        rating,
        comment,
        anonymous = false,
        teaching_quality,
        communication_rating,
        availability_rating,
      } = req.body as CreateLecturerFeedbackRequest

      let finalLecturerId = lecturer_id
      let finalLecturerName = lecturer_name

      // If lecturer_id is not provided, try to find or create lecturer by name
      if (!finalLecturerId && finalLecturerName) {
        const lecturerResult = await pool.query("SELECT id FROM lecturers WHERE name = $1", [finalLecturerName])
        if (lecturerResult.rows.length === 0) {
          // If lecturer doesn't exist, create a new one (only if user is admin, or allow non-admin to create basic entry)
          // For simplicity, let's allow any verified user to create a basic lecturer entry if it doesn't exist
          const newLecturerResult = await pool.query(`INSERT INTO lecturers (name) VALUES ($1) RETURNING id`, [
            finalLecturerName,
          ])
          finalLecturerId = newLecturerResult.rows[0].id
        } else {
          finalLecturerId = lecturerResult.rows[0].id
        }
      } else if (finalLecturerId) {
        // If ID is provided, fetch name for consistency/display
        const lecturerResult = await pool.query("SELECT name FROM lecturers WHERE id = $1", [finalLecturerId])
        if (lecturerResult.rows.length > 0) {
          finalLecturerName = lecturerResult.rows[0].name
        } else {
          res.status(400).json({
            success: false,
            message: "Invalid lecturer ID provided",
          })
          return
        }
      } else {
        res.status(400).json({
          success: false,
          message: "Lecturer ID or Name is required",
        })
        return
      }

      // Verify course exists if provided
      if (course_id) {
        const courseResult = await pool.query("SELECT id FROM courses WHERE id = $1", [course_id])
        if (courseResult.rows.length === 0) {
          res.status(400).json({
            success: false,
            message: "Invalid course ID",
          })
          return
        }
      }

      // Create feedback
      const result = await pool.query(
        `INSERT INTO lecturer_feedback (
          lecturer_id, lecturer_name, course_id, user_id, rating, comment, anonymous, 
          teaching_quality, communication_rating, availability_rating
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING *`,
        [
          finalLecturerId,
          finalLecturerName,
          course_id,
          userId,
          rating,
          comment,
          anonymous,
          teaching_quality,
          communication_rating,
          availability_rating,
        ],
      )

      const feedback = result.rows[0]

      res.status(201).json({
        success: true,
        message: "Lecturer feedback created successfully",
        data: { feedback },
      })
    } catch (error) {
      console.error("Create lecturer feedback error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async getUserLecturerFeedback(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id

      const result = await pool.query(
        `SELECT 
          lf.*,
          l.name as lecturer_name_from_table,
          c.name as course_name,
          c.code as course_code
        FROM lecturer_feedback lf
        LEFT JOIN lecturers l ON lf.lecturer_id = l.id
        LEFT JOIN courses c ON lf.course_id = c.id
        WHERE lf.user_id = $1
        ORDER BY lf.created_at DESC`,
        [userId],
      )

      const feedbackData = result.rows.map((row) => ({
        ...row,
        lecturer_name: row.lecturer_name_from_table || row.lecturer_name,
      }))

      res.json({
        success: true,
        message: "User lecturer feedback retrieved successfully",
        data: {
          feedback: feedbackData,
          total: result.rows.length,
        },
      })
    } catch (error) {
      console.error("Get user lecturer feedback error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async deleteLecturerFeedback(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user!.id
      const userRole = req.user!.role

      // Get feedback details
      const feedbackResult = await pool.query(
        `SELECT lf.*, l.name as lecturer_name, u.name as reviewer_name 
         FROM lecturer_feedback lf 
         LEFT JOIN lecturers l ON lf.lecturer_id = l.id 
         JOIN users u ON lf.user_id = u.id 
         WHERE lf.id = $1`,
        [id],
      )

      if (feedbackResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Feedback not found",
        })
        return
      }

      const feedback = feedbackResult.rows[0]

      // Check if user can delete this feedback (own feedback or admin)
      if (feedback.user_id !== userId && userRole !== "admin") {
        res.status(403).json({
          success: false,
          message: "You can only delete your own feedback",
        })
        return
      }

      // Delete feedback
      await pool.query("DELETE FROM lecturer_feedback WHERE id = $1", [id])

      res.json({
        success: true,
        message: `Feedback for ${feedback.lecturer_name || "lecturer"} deleted successfully`,
      })
    } catch (error) {
      console.error("Delete lecturer feedback error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }
}

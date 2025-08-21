import type { Request, Response } from "express"
import pool from "@/config/database"
import type { AuthenticatedRequest, ApiResponse, CreateReviewRequest } from "@/types"

export class ReviewController {
  static async getReviews(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { course_id, limit = "10", offset = "0" } = req.query

      let query = `
        SELECT 
          r.*,
          c.name as course_name,
          c.code as course_code,
          CASE 
            WHEN r.anonymous = true THEN 'Anonymous'
            ELSE u.name
          END as reviewer_name
        FROM reviews r
        JOIN courses c ON r.course_id = c.id
        JOIN users u ON r.user_id = u.id
      `

      const values: any[] = []
      let paramCount = 0

      if (course_id) {
        paramCount++
        query += ` WHERE r.course_id = $${paramCount}`
        values.push(course_id)
      }

      query += ` ORDER BY r.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
      values.push(Number.parseInt(limit as string), Number.parseInt(offset as string))

      const result = await pool.query(query, values)

      res.json({
        success: true,
        message: "Reviews retrieved successfully",
        data: {
          reviews: result.rows,
          total: result.rows.length,
        },
      })
    } catch (error) {
      console.error("Get reviews error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async createReview(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id
      const {
        course_id,
        rating,
        comment,
        anonymous = false,
        difficulty_rating,
        workload_rating,
        would_recommend,
      } = req.body as CreateReviewRequest

      // Check if user already reviewed this course
      const existingReview = await pool.query("SELECT id FROM reviews WHERE course_id = $1 AND user_id = $2", [
        course_id,
        userId,
      ])

      if (existingReview.rows.length > 0) {
        res.status(400).json({
          success: false,
          message: "You have already reviewed this course",
        })
        return
      }

      // Verify course exists
      const courseResult = await pool.query("SELECT id FROM courses WHERE id = $1", [course_id])
      if (courseResult.rows.length === 0) {
        res.status(400).json({
          success: false,
          message: "Invalid course ID",
        })
        return
      }

      // Create review
      const result = await pool.query(
        `INSERT INTO reviews (
          course_id, user_id, rating, comment, anonymous, 
          difficulty_rating, workload_rating, would_recommend
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *`,
        [course_id, userId, rating, comment, anonymous, difficulty_rating, workload_rating, would_recommend],
      )

      const review = result.rows[0]

      res.status(201).json({
        success: true,
        message: "Review created successfully",
        data: { review },
      })
    } catch (error) {
      console.error("Create review error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async deleteReview(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user!.id
      const userRole = req.user!.role

      // Get review details
      const reviewResult = await pool.query(
        `SELECT r.*, u.name as reviewer_name, c.name as course_name 
         FROM reviews r 
         JOIN users u ON r.user_id = u.id 
         JOIN courses c ON r.course_id = c.id 
         WHERE r.id = $1`,
        [id],
      )

      if (reviewResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Review not found",
        })
        return
      }

      const review = reviewResult.rows[0]

      // Check if user can delete this review (own review or admin)
      if (review.user_id !== userId && userRole !== "admin") {
        res.status(403).json({
          success: false,
          message: "You can only delete your own reviews",
        })
        return
      }

      // Delete review
      await pool.query("DELETE FROM reviews WHERE id = $1", [id])

      res.json({
        success: true,
        message: `Review for ${review.course_name} deleted successfully`,
      })
    } catch (error) {
      console.error("Delete review error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async getUserReviews(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id

      const result = await pool.query(
        `SELECT 
          r.*,
          c.name as course_name,
          c.code as course_code
        FROM reviews r
        JOIN courses c ON r.course_id = c.id
        WHERE r.user_id = $1
        ORDER BY r.created_at DESC`,
        [userId],
      )

      res.json({
        success: true,
        message: "User reviews retrieved successfully",
        data: {
          reviews: result.rows,
          total: result.rows.length,
        },
      })
    } catch (error) {
      console.error("Get user reviews error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }
}

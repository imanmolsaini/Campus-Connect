import type { Request, Response } from "express"
import pool from "@/config/database"
import type { AuthenticatedRequest, ApiResponse, CreateQuoteRequest } from "@/types"

export class QuoteController {
  static async getQuotes(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { lecturer_id, search, limit = "10", offset = "0" } = req.query

      let query = `
        SELECT 
          q.*,
          l.name as lecturer_name,
          l.profile_image_url,
          u.name as uploader_name
        FROM quotes q
        JOIN lecturers l ON q.lecturer_id = l.id
        JOIN users u ON q.user_id = u.id
      `

      const conditions: string[] = []
      const values: any[] = []
      let paramCount = 0

      if (lecturer_id) {
        paramCount++
        conditions.push(`q.lecturer_id = $${paramCount}`)
        values.push(lecturer_id)
      }

      if (search) {
        paramCount++
        conditions.push(`(q.quote_text ILIKE $${paramCount} OR q.context ILIKE $${paramCount})`)
        values.push(`%${search}%`)
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`
      }

      query += ` ORDER BY q.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
      values.push(Number.parseInt(limit as string), Number.parseInt(offset as string))

      const result = await pool.query(query, values)

      res.json({
        success: true,
        message: "Quotes retrieved successfully",
        data: {
          quotes: result.rows,
          total: result.rows.length,
        },
      })
    } catch (error) {
      console.error("Get quotes error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async createQuote(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id
      const { lecturer_id, quote_text, context } = req.body as CreateQuoteRequest

      // Verify lecturer exists
      const lecturerResult = await pool.query("SELECT id FROM lecturers WHERE id = $1", [lecturer_id])
      if (lecturerResult.rows.length === 0) {
        res.status(400).json({
          success: false,
          message: "Invalid lecturer ID",
        })
        return
      }

      const result = await pool.query(
        `INSERT INTO quotes (lecturer_id, user_id, quote_text, context) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [lecturer_id, userId, quote_text, context],
      )

      const quote = result.rows[0]

      res.status(201).json({
        success: true,
        message: "Quote added successfully",
        data: { quote },
      })
    } catch (error) {
      console.error("Create quote error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async deleteQuote(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user!.id
      const userRole = req.user!.role

      // Get quote details
      const quoteResult = await pool.query(
        `SELECT q.*, l.name as lecturer_name, u.name as uploader_name 
         FROM quotes q 
         JOIN lecturers l ON q.lecturer_id = l.id 
         JOIN users u ON q.user_id = u.id 
         WHERE q.id = $1`,
        [id],
      )

      if (quoteResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Quote not found",
        })
        return
      }

      const quote = quoteResult.rows[0]

      // Check if user can delete this quote (own quote or admin)
      if (quote.user_id !== userId && userRole !== "admin") {
        res.status(403).json({
          success: false,
          message: "You can only delete your own quotes",
        })
        return
      }

      // Delete quote
      await pool.query("DELETE FROM quotes WHERE id = $1", [id])

      res.json({
        success: true,
        message: `Quote from ${quote.lecturer_name} deleted successfully`,
      })
    } catch (error) {
      console.error("Delete quote error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }
}

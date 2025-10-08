import type { Request, Response } from "express"
import pool from "@/config/database"
import type { AuthenticatedRequest, ApiResponse } from "@/types"

export class CommunityController {
  static async getQuestions(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { search, resolved, sort = "new", limit = "20", offset = "0" } = req.query

      const client = await pool.connect()
      try {
        await client.query("BEGIN")

        let query = `
          SELECT 
            cq.*,
            u.name as author_name,
            COALESCE(replies.count, 0) as reply_count
          FROM community_questions cq
          JOIN users u ON cq.user_id = u.id
          LEFT JOIN (
            SELECT question_id, COUNT(*) as count 
            FROM community_replies 
            GROUP BY question_id
          ) replies ON cq.id = replies.question_id
        `

        const conditions: string[] = []
        const values: any[] = []
        let paramCount = 0

        if (search) {
          paramCount++
          conditions.push(`(cq.title ILIKE $${paramCount} OR cq.content ILIKE $${paramCount})`)
          values.push(`%${search}%`)
        }

        if (resolved === "true") {
          conditions.push("cq.is_resolved = true")
        } else if (resolved === "false") {
          conditions.push("cq.is_resolved = false")
        }

        if (conditions.length > 0) {
          query += ` WHERE ${conditions.join(" AND ")}`
        }

        // Add sorting
        if (sort === "popular") {
          query += ` ORDER BY COALESCE(replies.count, 0) DESC, cq.created_at DESC`
        } else if (sort === "unanswered") {
          query += ` ORDER BY COALESCE(replies.count, 0) ASC, cq.created_at DESC`
        } else {
          query += ` ORDER BY cq.created_at DESC`
        }

        query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
        values.push(Number.parseInt(limit as string), Number.parseInt(offset as string))

        const result = await client.query(query, values)

        await client.query("COMMIT")

        res.json({
          success: true,
          message: "Questions retrieved successfully",
          data: {
            questions: result.rows,
            total: result.rows.length,
          },
        })
      } catch (err) {
        await client.query("ROLLBACK")
        throw err
      } finally {
        client.release()
      }
    } catch (error) {
      console.error("Get questions error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async createQuestion(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id
      const { title, content } = req.body

      const client = await pool.connect()
      try {
        await client.query("BEGIN")

        const result = await client.query(
          `INSERT INTO community_questions (user_id, title, content) 
           VALUES ($1, $2, $3) 
           RETURNING *`,
          [userId, title, content],
        )

        await client.query("COMMIT")
        const question = result.rows[0]

        res.status(201).json({
          success: true,
          message: "Question posted successfully",
          data: { question },
        })
      } catch (err) {
        await client.query("ROLLBACK")
        throw err
      } finally {
        client.release()
      }
    } catch (error) {
      console.error("Create question error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async getQuestionReplies(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const { limit = "50", offset = "0" } = req.query

      const client = await pool.connect()
      try {
        await client.query("BEGIN")

        // Check if question exists
        const questionResult = await client.query("SELECT id FROM community_questions WHERE id = $1", [id])
        if (questionResult.rows.length === 0) {
          await client.query("ROLLBACK")
          res.status(404).json({
            success: false,
            message: "Question not found",
          })
          return
        }

        const result = await client.query(
          `SELECT 
            cr.*,
            u.name as author_name
          FROM community_replies cr
          JOIN users u ON cr.user_id = u.id
          WHERE cr.question_id = $1
          ORDER BY cr.created_at ASC
          LIMIT $2 OFFSET $3`,
          [id, Number.parseInt(limit as string), Number.parseInt(offset as string)],
        )

        await client.query("COMMIT")

        res.json({
          success: true,
          message: "Replies retrieved successfully",
          data: {
            replies: result.rows,
            total: result.rows.length,
          },
        })
      } catch (err) {
        await client.query("ROLLBACK")
        throw err
      } finally {
        client.release()
      }
    } catch (error) {
      console.error("Get question replies error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async createReply(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const { content } = req.body
      const userId = req.user!.id

      const client = await pool.connect()
      try {
        await client.query("BEGIN")

        // Check if question exists
        const questionResult = await client.query("SELECT id FROM community_questions WHERE id = $1", [id])
        if (questionResult.rows.length === 0) {
          await client.query("ROLLBACK")
          res.status(404).json({
            success: false,
            message: "Question not found",
          })
          return
        }

        const result = await client.query(
          `INSERT INTO community_replies (question_id, user_id, content) 
           VALUES ($1, $2, $3) 
           RETURNING *`,
          [id, userId, content],
        )

        const reply = result.rows[0]

        await client.query("COMMIT")

        res.status(201).json({
          success: true,
          message: "Reply posted successfully",
          data: { reply },
        })
      } catch (err) {
        await client.query("ROLLBACK")
        throw err
      } finally {
        client.release()
      }
    } catch (error) {
      console.error("Create reply error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async toggleResolved(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user!.id
      const userRole = req.user!.role

      const client = await pool.connect()
      try {
        await client.query("BEGIN")

        // Get question details
        const questionResult = await client.query("SELECT * FROM community_questions WHERE id = $1", [id])

        if (questionResult.rows.length === 0) {
          await client.query("ROLLBACK")
          res.status(404).json({
            success: false,
            message: "Question not found",
          })
          return
        }

        const question = questionResult.rows[0]

        // Check if user can toggle resolved status (own question or admin)
        if (question.user_id !== userId && userRole !== "admin") {
          await client.query("ROLLBACK")
          res.status(403).json({
            success: false,
            message: "You can only mark your own questions as resolved",
          })
          return
        }

        // Toggle resolved status
        const result = await client.query(
          `UPDATE community_questions 
           SET is_resolved = NOT is_resolved 
           WHERE id = $1 
           RETURNING *`,
          [id],
        )

        await client.query("COMMIT")

        res.json({
          success: true,
          message: result.rows[0].is_resolved ? "Question marked as resolved" : "Question marked as unresolved",
          data: { question: result.rows[0] },
        })
      } catch (err) {
        await client.query("ROLLBACK")
        throw err
      } finally {
        client.release()
      }
    } catch (error) {
      console.error("Toggle resolved error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async deleteQuestion(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user!.id
      const userRole = req.user!.role

      const client = await pool.connect()
      try {
        await client.query("BEGIN")

        // Get question details
        const questionResult = await client.query("SELECT * FROM community_questions WHERE id = $1", [id])

        if (questionResult.rows.length === 0) {
          await client.query("ROLLBACK")
          res.status(404).json({
            success: false,
            message: "Question not found",
          })
          return
        }

        const question = questionResult.rows[0]

        // Check if user can delete this question (own question or admin)
        if (question.user_id !== userId && userRole !== "admin") {
          await client.query("ROLLBACK")
          res.status(403).json({
            success: false,
            message: "You can only delete your own questions",
          })
          return
        }

        // Delete question (replies will be deleted automatically due to CASCADE)
        await client.query("DELETE FROM community_questions WHERE id = $1", [id])

        await client.query("COMMIT")

        res.json({
          success: true,
          message: "Question deleted successfully",
        })
      } catch (err) {
        await client.query("ROLLBACK")
        throw err
      } finally {
        client.release()
      }
    } catch (error) {
      console.error("Delete question error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async deleteReply(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { replyId } = req.params
      const userId = req.user!.id
      const userRole = req.user!.role

      const client = await pool.connect()
      try {
        await client.query("BEGIN")

        // Get reply details
        const replyResult = await client.query("SELECT * FROM community_replies WHERE id = $1", [replyId])

        if (replyResult.rows.length === 0) {
          await client.query("ROLLBACK")
          res.status(404).json({
            success: false,
            message: "Reply not found",
          })
          return
        }

        const reply = replyResult.rows[0]

        // Check if user can delete this reply (own reply or admin)
        if (reply.user_id !== userId && userRole !== "admin") {
          await client.query("ROLLBACK")
          res.status(403).json({
            success: false,
            message: "You can only delete your own replies",
          })
          return
        }

        // Delete reply
        await client.query("DELETE FROM community_replies WHERE id = $1", [replyId])

        await client.query("COMMIT")

        res.json({
          success: true,
          message: "Reply deleted successfully",
        })
      } catch (err) {
        await client.query("ROLLBACK")
        throw err
      } finally {
        client.release()
      }
    } catch (error) {
      console.error("Delete reply error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }
}

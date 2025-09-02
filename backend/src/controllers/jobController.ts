import type { Request, Response } from "express"
import pool from "@/config/database"
import type { AuthenticatedRequest, ApiResponse } from "@/types"

export class JobController {
  static async getJobs(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { job_type, location, search, sort = "new", limit = "20", offset = "0" } = req.query
      const userId = (req as AuthenticatedRequest).user?.id

      // Begin a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        let query = `
          SELECT 
            j.*,
            u.name as uploader_name,
            COALESCE(upvotes.count, 0) as upvotes,
            COALESCE(downvotes.count, 0) as downvotes,
            user_votes.vote_type as user_vote,
            COALESCE(comments.count, 0) as comment_count,
            CASE 
              WHEN j.expires_at <= CURRENT_TIMESTAMP THEN true 
              ELSE false 
            END as is_expired
          FROM jobs j
          JOIN users u ON j.user_id = u.id
          LEFT JOIN (
            SELECT job_id, COUNT(*) as count 
            FROM job_votes 
            WHERE vote_type = 'up' 
            GROUP BY job_id
          ) upvotes ON j.id = upvotes.job_id
          LEFT JOIN (
            SELECT job_id, COUNT(*) as count 
            FROM job_votes 
            WHERE vote_type = 'down' 
            GROUP BY job_id
          ) downvotes ON j.id = downvotes.job_id
          LEFT JOIN job_votes user_votes ON j.id = user_votes.job_id AND user_votes.user_id = $1
          LEFT JOIN (
            SELECT job_id, COUNT(*) as count 
            FROM job_comments 
            GROUP BY job_id
          ) comments ON j.id = comments.job_id
        `

        const conditions: string[] = ["j.is_active = true"]
        const values: any[] = [userId || null]
        let paramCount = 1

        if (job_type && job_type !== "all") {
          paramCount++
          conditions.push(`j.job_type = $${paramCount}`)
          values.push(job_type)
        }

        if (location && location !== "all") {
          paramCount++
          conditions.push(`j.location ILIKE $${paramCount}`)
          values.push(`%${location}%`)
        }

        if (search) {
          paramCount++
          conditions.push(
            `(j.title ILIKE $${paramCount} OR j.description ILIKE $${paramCount} OR j.location ILIKE $${paramCount})`,
          )
          values.push(`%${search}%`)
        }

        query += ` WHERE ${conditions.join(" AND ")}`

        // Add sorting
        if (sort === "hot") {
          query += ` ORDER BY (COALESCE(upvotes.count, 0) - COALESCE(downvotes.count, 0)) DESC, j.created_at DESC`
        } else if (sort === "top") {
          query += ` ORDER BY COALESCE(upvotes.count, 0) DESC, j.created_at DESC`
        } else if (sort === "expiry") {
          query += ` ORDER BY j.expires_at ASC, j.created_at DESC`
        } else {
          query += ` ORDER BY j.created_at DESC`
        }

        query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
        values.push(Number.parseInt(limit as string), Number.parseInt(offset as string))

        const result = await client.query(query, values)

        await client.query('COMMIT');

        res.json({
          success: true,
          message: "Jobs retrieved successfully",
          data: {
            jobs: result.rows,
            total: result.rows.length,
          },
        })
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Get jobs error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async createJob(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      console.log("Validating request body:", req.body);
      const userId = req.user!.id
      const { title, job_type, pay_rate, pay_type, description, location, contact_info, expires_at } = req.body

      // Validate data before insertion
      const validatedData = {
        title, 
        job_type, 
        pay_rate, 
        pay_type, 
        description, 
        location, 
        contact_info, 
        expires_at
      };
      console.log("Validation successful, validated data:", validatedData);

      // Begin a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const result = await client.query(
          `INSERT INTO jobs (
            user_id, title, job_type, pay_rate, pay_type, 
            description, location, contact_info, expires_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
          RETURNING *`,
          [userId, title, job_type, pay_rate, pay_type, description, location, contact_info, expires_at],
        )

        await client.query('COMMIT');
        const job = result.rows[0]

        res.status(201).json({
          success: true,
          message: "Job posted successfully",
          data: { job },
        })
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Create job error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async voteJob(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
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

      // Begin a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Check if job exists
        const jobResult = await client.query("SELECT id FROM jobs WHERE id = $1", [id])
        if (jobResult.rows.length === 0) {
          await client.query('ROLLBACK');
          res.status(404).json({
            success: false,
            message: "Job not found",
          })
          return
        }

        // Insert or update vote (upsert)
        await client.query(
          `INSERT INTO job_votes (job_id, user_id, vote_type) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (job_id, user_id) 
           DO UPDATE SET vote_type = $3, created_at = CURRENT_TIMESTAMP`,
          [id, userId, vote_type],
        )

        await client.query('COMMIT');

        res.json({
          success: true,
          message: "Vote recorded successfully",
        })
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Vote job error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async deleteJob(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user!.id
      const userRole = req.user!.role

      // Begin a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Get job details
        const jobResult = await client.query(
          `SELECT j.*, u.name as uploader_name 
           FROM jobs j 
           JOIN users u ON j.user_id = u.id 
           WHERE j.id = $1`,
          [id],
        )

        if (jobResult.rows.length === 0) {
          await client.query('ROLLBACK');
          res.status(404).json({
            success: false,
            message: "Job not found",
          })
          return
        }

        const job = jobResult.rows[0]

        // Check if user can delete this job (own job or admin)
        if (job.user_id !== userId && userRole !== "admin") {
          await client.query('ROLLBACK');
          res.status(403).json({
            success: false,
            message: "You can only delete your own jobs",
          })
          return
        }

        // Delete job (votes and comments will be deleted automatically due to CASCADE)
        await client.query("DELETE FROM jobs WHERE id = $1", [id])

        await client.query('COMMIT');

        res.json({
          success: true,
          message: `Job "${job.title}" deleted successfully`,
        })
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Delete job error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async getJobComments(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const { limit = "20", offset = "0" } = req.query

      // Begin a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Check if job exists
        const jobResult = await client.query("SELECT id FROM jobs WHERE id = $1", [id])
        if (jobResult.rows.length === 0) {
          await client.query('ROLLBACK');
          res.status(404).json({
            success: false,
            message: "Job not found",
          })
          return
        }

        const result = await client.query(
          `SELECT 
            jc.*,
            u.name as user_name
          FROM job_comments jc
          JOIN users u ON jc.user_id = u.id
          WHERE jc.job_id = $1
          ORDER BY jc.created_at ASC
          LIMIT $2 OFFSET $3`,
          [id, Number.parseInt(limit as string), Number.parseInt(offset as string)],
        )

        await client.query('COMMIT');

        res.json({
          success: true,
          message: "Comments retrieved successfully",
          data: {
            comments: result.rows,
            total: result.rows.length,
          },
        })
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Get job comments error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async createJobComment(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const { comment_text } = req.body
      const userId = req.user!.id

      // Begin a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Check if job exists
        const jobResult = await client.query("SELECT id FROM jobs WHERE id = $1", [id])
        if (jobResult.rows.length === 0) {
          await client.query('ROLLBACK');
          res.status(404).json({
            success: false,
            message: "Job not found",
          })
          return
        }

        const result = await client.query(
          `INSERT INTO job_comments (job_id, user_id, comment_text) 
           VALUES ($1, $2, $3) 
           RETURNING *`,
          [id, userId, comment_text],
        )

        const comment = result.rows[0]
        
        await client.query('COMMIT');

        res.status(201).json({
          success: true,
          message: "Comment posted successfully",
          data: { comment },
        })
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Create job comment error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async deleteJobComment(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { commentId } = req.params
      const userId = req.user!.id
      const userRole = req.user!.role

      // Begin a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Get comment details
        const commentResult = await client.query(
          "SELECT * FROM job_comments WHERE id = $1",
          [commentId],
        )

        if (commentResult.rows.length === 0) {
          await client.query('ROLLBACK');
          res.status(404).json({
            success: false,
            message: "Comment not found",
          })
          return
        }

        const comment = commentResult.rows[0]

        // Check if user can delete this comment (own comment or admin)
        if (comment.user_id !== userId && userRole !== "admin") {
          await client.query('ROLLBACK');
          res.status(403).json({
            success: false,
            message: "You can only delete your own comments",
          })
          return
        }

        // Delete comment
        await client.query("DELETE FROM job_comments WHERE id = $1", [commentId])

        await client.query('COMMIT');

        res.json({
          success: true,
          message: "Comment deleted successfully",
        })
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Delete job comment error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }
}

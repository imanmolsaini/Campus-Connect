import type { Request, Response } from "express"
import pool from "@/config/database"
import type { AuthenticatedRequest, ApiResponse } from "@/types"

export class ClubController {
  // GET clubs
  static async getClubs(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { search, sort = "new", limit = "20", offset = "0" } = req.query
      const userId = (req as AuthenticatedRequest).user?.id

      let query = `
        SELECT 
          c.*,
          u.name as creator_name,
          COALESCE(member_counts.count, 0) as members_count
        FROM clubs c
        JOIN users u ON c.creator_id = u.id
        LEFT JOIN (
          SELECT club_id, COUNT(*) as count 
          FROM club_members 
          GROUP BY club_id
        ) member_counts ON c.id = member_counts.club_id
      `

      const conditions: string[] = ["c.is_active = true"]
      const values: any[] = []
      let paramCount = 0

      if (search) {
        paramCount++
        conditions.push(
          `(c.name ILIKE $${paramCount} OR c.description ILIKE $${paramCount} OR c.location ILIKE $${paramCount})`
        )
        values.push(`%${search}%`)
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`
      }

      // Sorting
      if (sort === "popular") {
        query += ` ORDER BY members_count DESC, c.created_at DESC`
      } else {
        query += ` ORDER BY c.created_at DESC`
      }

      query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
      values.push(Number.parseInt(limit as string), Number.parseInt(offset as string))

      const result = await pool.query(query, values)

      res.json({
        success: true,
        message: "Clubs retrieved successfully",
        data: {
          clubs: result.rows,
          total: result.rows.length,
        },
      })
    } catch (error) {
      console.error("Get clubs error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  // UPDATE the createClub method in clubController.ts
static async createClub(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
  try {
    const creatorId = req.user!.id
    const { name, description, location, club_date, club_time, image_url, join_link} = req.body

    const result = await pool.query(
      `INSERT INTO clubs (
        creator_id, name, description, location, club_date, club_time, image_url, join_link 
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [creatorId, name, description, location, club_date, club_time, image_url, join_link]
    )

    const club = result.rows[0]

    res.status(201).json({
      success: true,
      message: "Club created successfully",
      data: { club },
    })
  } catch (error) {
    console.error("Create club error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}
  // DELETE club
  static async deleteClub(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params
      const userId = req.user!.id
      const userRole = req.user!.role

      // Get club details
      const clubResult = await pool.query(
        `SELECT c.*, u.name as creator_name 
         FROM clubs c 
         JOIN users u ON c.creator_id = u.id 
         WHERE c.id = $1`,
        [id]
      )

      if (clubResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Club not found",
        })
        return
      }

      const club = clubResult.rows[0]

      // Authorization (owner or admin only)
      if (club.creator_id !== userId && userRole !== "admin") {
        res.status(403).json({
          success: false,
          message: "You can only delete your own clubs",
        })
        return
      }

      await pool.query("DELETE FROM clubs WHERE id = $1", [id])

      res.json({
        success: true,
        message: `Club "${club.name}" deleted successfully`,
      })
    } catch (error) {
      console.error("Delete club error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }
}

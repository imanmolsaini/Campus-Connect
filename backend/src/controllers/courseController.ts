import type { Request, Response } from "express"
import pool from "@/config/database"
import type { ApiResponse, AuthenticatedRequest } from "@/types"

export class CourseController {
  static async getCourses(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { faculty, year, search } = req.query

      let query = `
        SELECT 
          c.*,
          COUNT(r.id) as review_count,
          ROUND(AVG(r.rating), 2) as avg_rating,
          ROUND(AVG(r.difficulty_rating), 2) as avg_difficulty,
          ROUND(AVG(r.workload_rating), 2) as avg_workload
        FROM courses c
        LEFT JOIN reviews r ON c.id = r.course_id
      `

      const conditions: string[] = []
      const values: any[] = []
      let paramCount = 0

      if (faculty) {
        paramCount++
        conditions.push(`c.faculty = $${paramCount}`)
        values.push(faculty)
      }

      if (year) {
        paramCount++
        conditions.push(`c.year = $${paramCount}`)
        values.push(Number.parseInt(year as string))
      }

      if (search) {
        paramCount++
        conditions.push(`(c.name ILIKE $${paramCount} OR c.code ILIKE $${paramCount})`)
        values.push(`%${search}%`)
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`
      }

      query += ` GROUP BY c.id ORDER BY c.code`

      const result = await pool.query(query, values)

      res.json({
        success: true,
        message: "Courses retrieved successfully",
        data: {
          courses: result.rows,
          total: result.rows.length,
        },
      })
    } catch (error) {
      console.error("Get courses error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async getCourse(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params

      const courseResult = await pool.query(
        `SELECT 
          c.*,
          COUNT(r.id) as review_count,
          ROUND(AVG(r.rating), 2) as avg_rating,
          ROUND(AVG(r.difficulty_rating), 2) as avg_difficulty,
          ROUND(AVG(r.workload_rating), 2) as avg_workload
        FROM courses c
        LEFT JOIN reviews r ON c.id = r.course_id
        WHERE c.id = $1
        GROUP BY c.id`,
        [id],
      )

      if (courseResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Course not found",
        })
        return
      }

      const course = courseResult.rows[0]

      // Get recent reviews
      const reviewsResult = await pool.query(
        `SELECT 
          r.*,
          CASE 
            WHEN r.anonymous = true THEN 'Anonymous'
            ELSE u.name
          END as reviewer_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.course_id = $1
        ORDER BY r.created_at DESC
        LIMIT 10`,
        [id],
      )

      res.json({
        success: true,
        message: "Course retrieved successfully",
        data: {
          course,
          recent_reviews: reviewsResult.rows,
        },
      })
    } catch (error) {
      console.error("Get course error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async createCourse(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userRole = req.user!.role

      if (userRole !== "admin") {
        res.status(403).json({
          success: false,
          message: "Admin access required",
        })
        return
      }

      const { code, name, description, faculty, year, credits } = req.body

      // Check if course code already exists
      const existingCourse = await pool.query("SELECT id FROM courses WHERE code = $1", [code])
      if (existingCourse.rows.length > 0) {
        res.status(400).json({
          success: false,
          message: "Course code already exists",
        })
        return
      }

      const result = await pool.query(
        `INSERT INTO courses (code, name, description, faculty, year, credits) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [code, name, description, faculty, year, credits],
      )

      const course = result.rows[0]

      res.status(201).json({
        success: true,
        message: "Course created successfully",
        data: { course },
      })
    } catch (error) {
      console.error("Create course error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  static async deleteCourse(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userRole = req.user!.role

      if (userRole !== "admin") {
        res.status(403).json({
          success: false,
          message: "Admin access required",
        })
        return
      }

      const { id } = req.params

      // Check if course exists
      const courseResult = await pool.query("SELECT * FROM courses WHERE id = $1", [id])
      if (courseResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Course not found",
        })
        return
      }

      // Delete course (this will cascade delete related reviews and notes)
      await pool.query("DELETE FROM courses WHERE id = $1", [id])

      res.json({
        success: true,
        message: "Course deleted successfully",
      })
    } catch (error) {
      console.error("Delete course error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }
}

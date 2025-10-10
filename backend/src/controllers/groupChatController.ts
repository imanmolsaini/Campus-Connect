import type { Response } from "express"
import pool from "@/config/database"
import type { AuthenticatedRequest, ApiResponse } from "@/types"

export class GroupChatController {
  // Create a new group with multiple members
  static async createGroup(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    const client = await pool.connect()
    try {
      const creatorId = req.user!.id
      const { name, memberEmails } = req.body

      if (!name || !memberEmails || !Array.isArray(memberEmails) || memberEmails.length === 0) {
        res.status(400).json({
          success: false,
          message: "Group name and at least one member email are required",
        })
        return
      }

      if (!name.trim()) {
        res.status(400).json({
          success: false,
          message: "Group name cannot be empty",
        })
        return
      }

      await client.query("BEGIN")

      // Get user IDs from emails
      const usersResult = await client.query("SELECT id, email, name FROM users WHERE email = ANY($1::text[])", [
        memberEmails,
      ])

      if (usersResult.rows.length === 0) {
        await client.query("ROLLBACK")
        res.status(404).json({
          success: false,
          message: "No valid users found with the provided emails",
        })
        return
      }

      const notFoundEmails = memberEmails.filter((email) => !usersResult.rows.some((user) => user.email === email))

      // Create the group
      const groupResult = await client.query(
        "INSERT INTO groups (name, created_by) VALUES ($1, $2) RETURNING id, name, created_by, created_at",
        [name.trim(), creatorId],
      )

      const group = groupResult.rows[0]

      // Add creator as a member
      await client.query("INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)", [group.id, creatorId])

      // Add other members
      const memberIds = usersResult.rows.map((user) => user.id)
      for (const memberId of memberIds) {
        if (memberId !== creatorId) {
          await client.query("INSERT INTO group_members (group_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [
            group.id,
            memberId,
          ])
        }
      }

      // Get all members with details
      const membersResult = await client.query(
        `SELECT u.id, u.name, u.email 
         FROM group_members gm
         JOIN users u ON gm.user_id = u.id
         WHERE gm.group_id = $1`,
        [group.id],
      )

      await client.query("COMMIT")

      res.status(201).json({
        success: true,
        message: "Group created successfully",
        data: {
          group: {
            ...group,
            members: membersResult.rows,
            notFoundEmails: notFoundEmails.length > 0 ? notFoundEmails : undefined,
          },
        },
      })
    } catch (error) {
      await client.query("ROLLBACK")
      console.error("Create group error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    } finally {
      client.release()
    }
  }

  // Send a message to a group
  static async sendGroupMessage(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const senderId = req.user!.id
      const { groupId, message } = req.body

      if (!groupId || !message) {
        res.status(400).json({
          success: false,
          message: "Group ID and message are required",
        })
        return
      }

      if (!message.trim()) {
        res.status(400).json({
          success: false,
          message: "Message cannot be empty",
        })
        return
      }

      // Check if user is a member of the group
      const memberCheck = await pool.query("SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2", [
        groupId,
        senderId,
      ])

      if (memberCheck.rows.length === 0) {
        res.status(403).json({
          success: false,
          message: "You are not a member of this group",
        })
        return
      }

      // Insert message
      const result = await pool.query(
        `INSERT INTO messages (sender_id, group_id, message, is_group_message) 
         VALUES ($1, $2, $3, TRUE) 
         RETURNING id, sender_id, group_id, message, is_group_message, is_read, created_at`,
        [senderId, groupId, message.trim()],
      )

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: {
          message: result.rows[0],
        },
      })
    } catch (error) {
      console.error("Send group message error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  // Get group conversation
  static async getGroupConversation(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id
      const { groupId } = req.params
      const limit = Number.parseInt(req.query.limit as string) || 50
      const offset = Number.parseInt(req.query.offset as string) || 0

      // Check if user is a member of the group
      const memberCheck = await pool.query("SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2", [
        groupId,
        userId,
      ])

      if (memberCheck.rows.length === 0) {
        res.status(403).json({
          success: false,
          message: "You are not a member of this group",
        })
        return
      }

      // Get messages
      const result = await pool.query(
        `SELECT m.id, m.sender_id, m.group_id, m.message, m.is_read, m.created_at,
                u.name as sender_name
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.group_id = $1 AND m.is_group_message = TRUE
         ORDER BY m.created_at DESC
         LIMIT $2 OFFSET $3`,
        [groupId, limit, offset],
      )

      res.json({
        success: true,
        message: "Group conversation retrieved successfully",
        data: {
          messages: result.rows.reverse(),
          hasMore: result.rows.length === limit,
        },
      })
    } catch (error) {
      console.error("Get group conversation error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  // Get all groups for a user
  static async getUserGroups(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id

      const result = await pool.query(
        `SELECT DISTINCT ON (g.id)
          g.id,
          g.name,
          g.created_by,
          g.created_at,
          m.message as last_message,
          m.created_at as last_message_time,
          m.sender_id as last_sender_id,
          u.name as last_sender_name,
          (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
         FROM groups g
         JOIN group_members gm ON g.id = gm.group_id
         LEFT JOIN LATERAL (
           SELECT message, created_at, sender_id
           FROM messages
           WHERE group_id = g.id AND is_group_message = TRUE
           ORDER BY created_at DESC
           LIMIT 1
         ) m ON true
         LEFT JOIN users u ON m.sender_id = u.id
         WHERE gm.user_id = $1
         ORDER BY g.id, last_message_time DESC NULLS LAST`,
        [userId],
      )

      res.json({
        success: true,
        message: "Groups retrieved successfully",
        data: {
          groups: result.rows,
        },
      })
    } catch (error) {
      console.error("Get user groups error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  // Get group members
  static async getGroupMembers(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id
      const { groupId } = req.params

      // Check if user is a member of the group
      const memberCheck = await pool.query("SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2", [
        groupId,
        userId,
      ])

      if (memberCheck.rows.length === 0) {
        res.status(403).json({
          success: false,
          message: "You are not a member of this group",
        })
        return
      }

      const result = await pool.query(
        `SELECT u.id, u.name, u.email, gm.joined_at
         FROM group_members gm
         JOIN users u ON gm.user_id = u.id
         WHERE gm.group_id = $1
         ORDER BY gm.joined_at ASC`,
        [groupId],
      )

      res.json({
        success: true,
        message: "Group members retrieved successfully",
        data: {
          members: result.rows,
        },
      })
    } catch (error) {
      console.error("Get group members error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  // Add members to a group
  static async addGroupMembers(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    const client = await pool.connect()
    try {
      const userId = req.user!.id
      const { groupId } = req.params
      const { memberEmails } = req.body

      if (!memberEmails || !Array.isArray(memberEmails) || memberEmails.length === 0) {
        res.status(400).json({
          success: false,
          message: "At least one member email is required",
        })
        return
      }

      // Check if user is a member of the group
      const memberCheck = await client.query("SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2", [
        groupId,
        userId,
      ])

      if (memberCheck.rows.length === 0) {
        res.status(403).json({
          success: false,
          message: "You are not a member of this group",
        })
        return
      }

      await client.query("BEGIN")

      // Get user IDs from emails
      const usersResult = await client.query("SELECT id, email, name FROM users WHERE email = ANY($1::text[])", [
        memberEmails,
      ])

      if (usersResult.rows.length === 0) {
        await client.query("ROLLBACK")
        res.status(404).json({
          success: false,
          message: "No valid users found with the provided emails",
        })
        return
      }

      // Add members
      const addedMembers = []
      for (const user of usersResult.rows) {
        const insertResult = await client.query(
          "INSERT INTO group_members (group_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id",
          [groupId, user.id],
        )
        if (insertResult.rows.length > 0) {
          addedMembers.push(user)
        }
      }

      await client.query("COMMIT")

      res.json({
        success: true,
        message: "Members added successfully",
        data: {
          addedMembers,
        },
      })
    } catch (error) {
      await client.query("ROLLBACK")
      console.error("Add group members error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    } finally {
      client.release()
    }
  }

  // Leave a group
  static async leaveGroup(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id
      const { groupId } = req.params

      const result = await pool.query("DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 RETURNING id", [
        groupId,
        userId,
      ])

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "You are not a member of this group",
        })
        return
      }

      res.json({
        success: true,
        message: "Left group successfully",
      })
    } catch (error) {
      console.error("Leave group error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  // Delete a group (only creator can delete)
  static async deleteGroup(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    const client = await pool.connect()
    try {
      const userId = req.user!.id
      const { groupId } = req.params

      await client.query("BEGIN")

      // Check if user is the creator of the group
      const groupCheck = await client.query("SELECT id, created_by FROM groups WHERE id = $1", [groupId])

      if (groupCheck.rows.length === 0) {
        await client.query("ROLLBACK")
        res.status(404).json({
          success: false,
          message: "Group not found",
        })
        return
      }

      if (groupCheck.rows[0].created_by !== userId) {
        await client.query("ROLLBACK")
        res.status(403).json({
          success: false,
          message: "Only the group creator can delete the group",
        })
        return
      }

      // Delete group members
      await client.query("DELETE FROM group_members WHERE group_id = $1", [groupId])

      // Delete group messages
      await client.query("DELETE FROM messages WHERE group_id = $1", [groupId])

      // Delete group
      await client.query("DELETE FROM groups WHERE id = $1", [groupId])

      await client.query("COMMIT")

      res.json({
        success: true,
        message: "Group deleted successfully",
      })
    } catch (error) {
      await client.query("ROLLBACK")
      console.error("Delete group error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    } finally {
      client.release()
    }
  }
}

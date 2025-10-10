import type { Response } from "express"
import pool from "@/config/database"
import type { AuthenticatedRequest, ApiResponse } from "@/types"

export class ChatController {
  // Send a message to a friend
  static async sendMessage(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const senderId = req.user!.id
      const { receiverId, message } = req.body

      if (!receiverId || !message) {
        res.status(400).json({
          success: false,
          message: "Receiver ID and message are required",
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

      // Check if users are friends
      const user1Id = senderId < receiverId ? senderId : receiverId
      const user2Id = senderId < receiverId ? receiverId : senderId

      const friendshipCheck = await pool.query("SELECT id FROM friendships WHERE user1_id = $1 AND user2_id = $2", [
        user1Id,
        user2Id,
      ])

      if (friendshipCheck.rows.length === 0) {
        res.status(403).json({
          success: false,
          message: "You can only send messages to your friends",
        })
        return
      }

      // Insert message
      const result = await pool.query(
        `INSERT INTO messages (sender_id, receiver_id, message) 
         VALUES ($1, $2, $3) 
         RETURNING id, sender_id, receiver_id, message, is_read, created_at`,
        [senderId, receiverId, message.trim()],
      )

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: {
          message: result.rows[0],
        },
      })
    } catch (error) {
      console.error("Send message error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  // Get conversation with a specific friend
  static async getConversation(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id
      const { friendId } = req.params
      const limit = Number.parseInt(req.query.limit as string) || 50
      const offset = Number.parseInt(req.query.offset as string) || 0

      // Check if users are friends
      const user1Id = userId < friendId ? userId : friendId
      const user2Id = userId < friendId ? friendId : userId

      const friendshipCheck = await pool.query("SELECT id FROM friendships WHERE user1_id = $1 AND user2_id = $2", [
        user1Id,
        user2Id,
      ])

      if (friendshipCheck.rows.length === 0) {
        res.status(403).json({
          success: false,
          message: "You can only view conversations with your friends",
        })
        return
      }

      // Get messages
      const result = await pool.query(
        `SELECT m.id, m.sender_id, m.receiver_id, m.message, m.is_read, m.created_at,
                u.name as sender_name
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE (m.sender_id = $1 AND m.receiver_id = $2) 
            OR (m.sender_id = $2 AND m.receiver_id = $1)
         ORDER BY m.created_at DESC
         LIMIT $3 OFFSET $4`,
        [userId, friendId, limit, offset],
      )

      // Mark messages as read
      await pool.query(
        `UPDATE messages 
         SET is_read = TRUE 
         WHERE receiver_id = $1 AND sender_id = $2 AND is_read = FALSE`,
        [userId, friendId],
      )

      res.json({
        success: true,
        message: "Conversation retrieved successfully",
        data: {
          messages: result.rows.reverse(), // Reverse to show oldest first
          hasMore: result.rows.length === limit,
        },
      })
    } catch (error) {
      console.error("Get conversation error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  // Get all conversations (list of friends with last message)
  static async getConversations(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id

      const result = await pool.query(
        `SELECT DISTINCT ON (friend_id)
          friend_id,
          friend_name,
          friend_email,
          last_message,
          last_message_time,
          last_sender_id,
          unread_count
         FROM (
           SELECT 
             CASE 
               WHEN f.user1_id = $1 THEN u2.id
               ELSE u1.id
             END as friend_id,
             CASE 
               WHEN f.user1_id = $1 THEN u2.name
               ELSE u1.name
             END as friend_name,
             CASE 
               WHEN f.user1_id = $1 THEN u2.email
               ELSE u1.email
             END as friend_email,
             m.message as last_message,
             m.created_at as last_message_time,
             m.sender_id as last_sender_id,
             (SELECT COUNT(*) 
              FROM messages 
              WHERE receiver_id = $1 
                AND sender_id = CASE 
                  WHEN f.user1_id = $1 THEN f.user2_id
                  ELSE f.user1_id
                END
                AND is_read = FALSE
             ) as unread_count
           FROM friendships f
           JOIN users u1 ON f.user1_id = u1.id
           JOIN users u2 ON f.user2_id = u2.id
           LEFT JOIN LATERAL (
             SELECT message, created_at, sender_id
             FROM messages
             WHERE (sender_id = $1 AND receiver_id = CASE 
                      WHEN f.user1_id = $1 THEN f.user2_id
                      ELSE f.user1_id
                    END)
                OR (receiver_id = $1 AND sender_id = CASE 
                      WHEN f.user1_id = $1 THEN f.user2_id
                      ELSE f.user1_id
                    END)
             ORDER BY created_at DESC
             LIMIT 1
           ) m ON true
           WHERE f.user1_id = $1 OR f.user2_id = $1
         ) conversations
         ORDER BY friend_id, last_message_time DESC NULLS LAST`,
        [userId],
      )

      res.json({
        success: true,
        message: "Conversations retrieved successfully",
        data: {
          conversations: result.rows,
        },
      })
    } catch (error) {
      console.error("Get conversations error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  // Mark messages as read
  static async markAsRead(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id
      const { friendId } = req.params

      await pool.query(
        `UPDATE messages 
         SET is_read = TRUE 
         WHERE receiver_id = $1 AND sender_id = $2 AND is_read = FALSE`,
        [userId, friendId],
      )

      res.json({
        success: true,
        message: "Messages marked as read",
      })
    } catch (error) {
      console.error("Mark as read error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  // Get unread message count
  static async getUnreadCount(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id

      const result = await pool.query(
        "SELECT COUNT(*) as unread_count FROM messages WHERE receiver_id = $1 AND is_read = FALSE",
        [userId],
      )

      res.json({
        success: true,
        message: "Unread count retrieved successfully",
        data: {
          unreadCount: Number.parseInt(result.rows[0].unread_count),
        },
      })
    } catch (error) {
      console.error("Get unread count error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }
}

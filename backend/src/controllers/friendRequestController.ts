import type { Response } from "express"
import pool from "@/config/database"
import type { AuthenticatedRequest, ApiResponse } from "@/types"

export class FriendRequestController {
  // Send a friend request by email
  static async sendFriendRequest(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const senderId = req.user!.id
      const { email } = req.body

      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email is required",
        })
        return
      }

      // Find receiver by email
      const receiverResult = await pool.query("SELECT id, name, email FROM users WHERE email = $1", [email])

      if (receiverResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User with this email not found",
        })
        return
      }

      const receiver = receiverResult.rows[0]
      const receiverId = receiver.id

      // Check if trying to send request to self
      if (receiverId === senderId) {
        res.status(400).json({
          success: false,
          message: "You cannot send a friend request to yourself",
        })
        return
      }

      // Check if already friends
      const friendshipCheck = await pool.query(
        `SELECT id FROM friendships 
         WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`,
        [senderId, receiverId],
      )

      if (friendshipCheck.rows.length > 0) {
        res.status(400).json({
          success: false,
          message: "You are already friends with this user",
        })
        return
      }

      // Check if request already exists
      const existingRequest = await pool.query(
        `SELECT id, status FROM friend_requests 
         WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)`,
        [senderId, receiverId],
      )

      if (existingRequest.rows.length > 0) {
        const request = existingRequest.rows[0]
        if (request.status === "pending") {
          res.status(400).json({
            success: false,
            message: "A friend request already exists between you and this user",
          })
          return
        }
      }

      // Create friend request
      const result = await pool.query(
        `INSERT INTO friend_requests (sender_id, receiver_id, status) 
         VALUES ($1, $2, 'pending') 
         RETURNING id, sender_id, receiver_id, status, created_at`,
        [senderId, receiverId],
      )

      res.status(201).json({
        success: true,
        message: "Friend request sent successfully",
        data: {
          friendRequest: result.rows[0],
          receiver: {
            id: receiverId,
            name: receiver.name,
            email: receiver.email,
          },
        },
      })
    } catch (error) {
      console.error("Send friend request error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  // Get all friend requests (sent and received)
  static async getFriendRequests(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id

      // Get received requests (pending)
      const receivedResult = await pool.query(
        `SELECT fr.id, fr.sender_id, fr.receiver_id, fr.status, fr.created_at,
                u.name as sender_name, u.email as sender_email
         FROM friend_requests fr
         JOIN users u ON fr.sender_id = u.id
         WHERE fr.receiver_id = $1 AND fr.status = 'pending'
         ORDER BY fr.created_at DESC`,
        [userId],
      )

      // Get sent requests (pending)
      const sentResult = await pool.query(
        `SELECT fr.id, fr.sender_id, fr.receiver_id, fr.status, fr.created_at,
                u.name as receiver_name, u.email as receiver_email
         FROM friend_requests fr
         JOIN users u ON fr.receiver_id = u.id
         WHERE fr.sender_id = $1 AND fr.status = 'pending'
         ORDER BY fr.created_at DESC`,
        [userId],
      )

      res.json({
        success: true,
        message: "Friend requests retrieved successfully",
        data: {
          received: receivedResult.rows,
          sent: sentResult.rows,
        },
      })
    } catch (error) {
      console.error("Get friend requests error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  // Accept a friend request
  static async acceptFriendRequest(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id
      const { requestId } = req.params

      // Get the friend request
      const requestResult = await pool.query(
        "SELECT id, sender_id, receiver_id, status FROM friend_requests WHERE id = $1",
        [requestId],
      )

      if (requestResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Friend request not found",
        })
        return
      }

      const request = requestResult.rows[0]

      // Check if user is the receiver
      if (request.receiver_id !== userId) {
        res.status(403).json({
          success: false,
          message: "You are not authorized to accept this request",
        })
        return
      }

      // Check if already accepted
      if (request.status !== "pending") {
        res.status(400).json({
          success: false,
          message: "This request has already been processed",
        })
        return
      }

      // Start transaction
      const client = await pool.connect()
      try {
        await client.query("BEGIN")

        // Update request status
        await client.query("UPDATE friend_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
          "accepted",
          requestId,
        ])

        // Create friendship (ensure user1_id < user2_id for consistent ordering)
        const user1Id = request.sender_id < request.receiver_id ? request.sender_id : request.receiver_id
        const user2Id = request.sender_id < request.receiver_id ? request.receiver_id : request.sender_id

        await client.query("INSERT INTO friendships (user1_id, user2_id) VALUES ($1, $2)", [user1Id, user2Id])

        await client.query("COMMIT")

        res.json({
          success: true,
          message: "Friend request accepted",
        })
      } catch (error) {
        await client.query("ROLLBACK")
        throw error
      } finally {
        client.release()
      }
    } catch (error) {
      console.error("Accept friend request error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  // Reject a friend request
  static async rejectFriendRequest(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id
      const { requestId } = req.params

      // Get the friend request
      const requestResult = await pool.query(
        "SELECT id, sender_id, receiver_id, status FROM friend_requests WHERE id = $1",
        [requestId],
      )

      if (requestResult.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Friend request not found",
        })
        return
      }

      const request = requestResult.rows[0]

      // Check if user is the receiver
      if (request.receiver_id !== userId) {
        res.status(403).json({
          success: false,
          message: "You are not authorized to reject this request",
        })
        return
      }

      // Check if already processed
      if (request.status !== "pending") {
        res.status(400).json({
          success: false,
          message: "This request has already been processed",
        })
        return
      }

      // Update request status
      await pool.query("UPDATE friend_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
        "rejected",
        requestId,
      ])

      res.json({
        success: true,
        message: "Friend request rejected",
      })
    } catch (error) {
      console.error("Reject friend request error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  // Get all friends
  static async getFriends(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id

      const result = await pool.query(
        `SELECT 
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
          f.created_at as friends_since
         FROM friendships f
         JOIN users u1 ON f.user1_id = u1.id
         JOIN users u2 ON f.user2_id = u2.id
         WHERE f.user1_id = $1 OR f.user2_id = $1
         ORDER BY f.created_at DESC`,
        [userId],
      )

      res.json({
        success: true,
        message: "Friends retrieved successfully",
        data: {
          friends: result.rows,
        },
      })
    } catch (error) {
      console.error("Get friends error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  // Remove a friend
  static async removeFriend(req: AuthenticatedRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user!.id
      const { friendId } = req.params

      const parsedFriendId = Number.parseInt(friendId, 10)

      if (isNaN(parsedFriendId)) {
        res.status(400).json({
          success: false,
          message: "Invalid friend ID",
        })
        return
      }

      const user1Id = userId < friendId ? userId : friendId
      const user2Id = userId < friendId ? friendId : userId

      const result = await pool.query("DELETE FROM friendships WHERE user1_id = $1 AND user2_id = $2 RETURNING id", [
        user1Id,
        user2Id,
      ])

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "Friendship not found",
        })
        return
      }

      res.json({
        success: true,
        message: "Friend removed successfully",
      })
    } catch (error) {
      console.error("Remove friend error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }
}

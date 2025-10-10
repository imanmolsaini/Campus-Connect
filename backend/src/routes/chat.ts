import { Router } from "express"
import { ChatController } from "@/controllers/chatController"
import { authenticateToken } from "@/middleware/auth"

const router = Router()

// All routes require authentication
router.use(authenticateToken)

// Send a message
router.post("/messages", ChatController.sendMessage)

// Get all conversations
router.get("/conversations", ChatController.getConversations)

// Get conversation with a specific friend
router.get("/conversations/:friendId", ChatController.getConversation)

// Mark messages as read
router.post("/conversations/:friendId/read", ChatController.markAsRead)

// Get unread message count
router.get("/unread-count", ChatController.getUnreadCount)

export default router

import { Router } from "express"
import { ChatController } from "@/controllers/chatController"
import { authenticateToken } from "@/middleware/auth"
import { uploadChatAttachment } from "@/middleware/chatUpload"

const router = Router()

// All routes require authentication
router.use(authenticateToken)

router.post("/messages", uploadChatAttachment.single("attachment"), ChatController.sendMessage)

// Get all conversations
router.get("/conversations", ChatController.getConversations)

// Get conversation with a specific friend
router.get("/conversations/:friendId", ChatController.getConversation)

// Mark messages as read
router.post("/conversations/:friendId/read", ChatController.markAsRead)

// Get unread message count
router.get("/unread-count", ChatController.getUnreadCount)

router.get("/attachments/:messageId", ChatController.downloadAttachment)

export default router

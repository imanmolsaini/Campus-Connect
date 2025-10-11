import { Router } from "express"
import { GroupChatController } from "@/controllers/groupChatController"
import { authenticateToken } from "@/middleware/auth"
import { uploadChatAttachment } from "@/middleware/chatUpload"

const router = Router()

// All routes require authentication
router.use(authenticateToken)

// Create a new group
router.post("/create", GroupChatController.createGroup)

// Get all groups for the user
router.get("/", GroupChatController.getUserGroups)

router.post("/message", uploadChatAttachment.single("attachment"), GroupChatController.sendGroupMessage)

// Get group conversation
router.get("/:groupId/messages", GroupChatController.getGroupConversation)

// Get group members
router.get("/:groupId/members", GroupChatController.getGroupMembers)

// Add members to a group
router.post("/:groupId/members", GroupChatController.addGroupMembers)

// Leave a group
router.delete("/:groupId/leave", GroupChatController.leaveGroup)

// Delete a group (only creator)
router.delete("/:groupId", GroupChatController.deleteGroup)

export default router

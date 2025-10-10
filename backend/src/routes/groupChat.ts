import { Router } from "express"
import { GroupChatController } from "@/controllers/groupChatController"
import { authenticateToken } from "@/middleware/auth"

const router = Router()

// All routes require authentication
router.use(authenticateToken)

// Create a new group
router.post("/create", GroupChatController.createGroup)

// Send a message to a group
router.post("/message", GroupChatController.sendGroupMessage)

// Get all groups for the user
router.get("/", GroupChatController.getUserGroups)

// Get group conversation
router.get("/:groupId/messages", GroupChatController.getGroupConversation)

// Get group members
router.get("/:groupId/members", GroupChatController.getGroupMembers)

// Add members to a group
router.post("/:groupId/members", GroupChatController.addGroupMembers)

// Leave a group
router.delete("/:groupId/leave", GroupChatController.leaveGroup)

// Delete a group (only creator can delete)
router.delete("/:groupId", GroupChatController.deleteGroup)

export default router

import { Router } from "express"
import { FriendRequestController } from "@/controllers/friendRequestController"
import { authenticateToken } from "@/middleware/auth"

const router = Router()

// All routes require authentication
router.use(authenticateToken)

// Send friend request
router.post("/", FriendRequestController.sendFriendRequest)

// Get friend requests (sent and received)
router.get("/", FriendRequestController.getFriendRequests)

// Accept friend request
router.post("/:requestId/accept", FriendRequestController.acceptFriendRequest)

// Reject friend request
router.post("/:requestId/reject", FriendRequestController.rejectFriendRequest)

// Get all friends
router.get("/friends", FriendRequestController.getFriends)

// Remove friend
router.delete("/friends/:friendId", FriendRequestController.removeFriend)

export default router

import { Router } from "express"
import { CommunityController } from "@/controllers/communityController"
import { authenticateToken, requireVerified } from "@/middleware/auth"
import { validate, createCommunityQuestionSchema, createCommunityReplySchema } from "@/middleware/validation"

const router = Router()

// Question routes
router.get("/questions", CommunityController.getQuestions)
router.post(
  "/questions",
  authenticateToken,
  requireVerified,
  validate(createCommunityQuestionSchema),
  CommunityController.createQuestion,
)
router.delete("/questions/:id", authenticateToken, CommunityController.deleteQuestion)
router.patch("/questions/:id/resolved", authenticateToken, CommunityController.toggleResolved)

// Reply routes
router.get("/questions/:id/replies", CommunityController.getQuestionReplies)
router.post(
  "/questions/:id/replies",
  authenticateToken,
  requireVerified,
  validate(createCommunityReplySchema),
  CommunityController.createReply,
)
router.delete("/replies/:replyId", authenticateToken, CommunityController.deleteReply)

export default router

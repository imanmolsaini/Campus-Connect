import { Router } from "express"
import { ReviewController } from "@/controllers/reviewController"
import { authenticateToken, requireVerified } from "@/middleware/auth"
import { validate, createReviewSchema } from "@/middleware/validation"

const router = Router()

// Public routes
router.get("/", ReviewController.getReviews)

// Protected routes
router.post("/", authenticateToken, requireVerified, validate(createReviewSchema), ReviewController.createReview)
router.get("/my-reviews", authenticateToken, ReviewController.getUserReviews)
router.delete("/:id", authenticateToken, ReviewController.deleteReview) // New delete route

export default router

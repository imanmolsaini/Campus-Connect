import { Router } from "express"
import { ClubController } from "@/controllers/clubController"
import { authenticateToken, requireVerified } from "@/middleware/auth"
import { validate, createClubSchema } from "@/middleware/validation"

const router = Router()

// Get all clubs
router.get("/", ClubController.getClubs)

// Get a single club by ID
router.get("/:id", ClubController.getClub);

// Create a club (requires login + verified user)
router.post("/", authenticateToken, requireVerified, validate(createClubSchema), ClubController.createClub)

// Delete a club
router.delete("/:id", authenticateToken, ClubController.deleteClub)

export default router

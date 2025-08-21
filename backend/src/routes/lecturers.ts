import { Router } from "express"
import { LecturerController } from "@/controllers/lecturerController"
import { authenticateToken, requireAdmin } from "@/middleware/auth"
import { validate, createLecturerSchema } from "@/middleware/validation"

const router = Router()

// Public routes
router.get("/", LecturerController.getLecturers)
router.get("/:id", LecturerController.getLecturer)

// Admin-only routes
router.post("/", authenticateToken, requireAdmin, validate(createLecturerSchema), LecturerController.createLecturer)
router.put("/:id", authenticateToken, requireAdmin, validate(createLecturerSchema), LecturerController.updateLecturer)
router.delete("/:id", authenticateToken, requireAdmin, LecturerController.deleteLecturer)

export default router

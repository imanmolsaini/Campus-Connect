import { Router } from "express"
import { CourseController } from "@/controllers/courseController"
import { authenticateToken } from "@/middleware/auth"
import { validate, createCourseSchema } from "@/middleware/validation"

const router = Router()

router.get("/", CourseController.getCourses)
router.get("/:id", CourseController.getCourse)

router.post("/", authenticateToken, validate(createCourseSchema), CourseController.createCourse)
router.delete("/:id", authenticateToken, CourseController.deleteCourse)

export default router

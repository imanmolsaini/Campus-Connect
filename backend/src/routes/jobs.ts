import { Router } from "express"
import { JobController } from "@/controllers/jobController"
import { authenticateToken, requireVerified } from "@/middleware/auth"
import { validate, createJobSchema, createJobCommentSchema } from "@/middleware/validation"

const router = Router()

router.get("/", JobController.getJobs)
router.post("/", authenticateToken, requireVerified, validate(createJobSchema), JobController.createJob)
router.post("/:id/vote", authenticateToken, JobController.voteJob)
router.delete("/:id", authenticateToken, JobController.deleteJob)
router.get("/:id/comments", JobController.getJobComments)
router.post(
  "/:id/comments",
  authenticateToken,
  requireVerified,
  validate(createJobCommentSchema),
  JobController.createJobComment,
)
router.delete("/comments/:commentId", authenticateToken, JobController.deleteJobComment)

export default router

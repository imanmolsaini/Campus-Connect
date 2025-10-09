import { Router } from "express"
import { EventController } from "@/controllers/eventController"
import { authenticateToken, requireVerified } from "@/middleware/auth"
import { validate, createEventSchema } from "@/middleware/validation"

const router = Router()

router.get("/", EventController.getEvents)
router.post("/", authenticateToken, requireVerified, validate(createEventSchema), EventController.createEvent)
router.post("/:id/interest", authenticateToken, EventController.markInterest)
router.post("/:id/subscribe", authenticateToken, EventController.subscribeToEvent)
router.delete("/:id/subscribe", authenticateToken, EventController.unsubscribeFromEvent)
router.delete("/:id", authenticateToken, EventController.deleteEvent)

export default router

import { Router } from "express"
import { DealController } from "@/controllers/dealController"
import { authenticateToken, requireVerified } from "@/middleware/auth"
import { validate, createDealSchema } from "@/middleware/validation"

const router = Router()

router.get("/", DealController.getDeals)
router.post("/", authenticateToken, requireVerified, validate(createDealSchema), DealController.createDeal)
router.post("/:id/vote", authenticateToken, DealController.voteDeal)
router.delete("/:id", authenticateToken, DealController.deleteDeal)

export default router

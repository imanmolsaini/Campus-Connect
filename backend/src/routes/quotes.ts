import { Router } from "express"
import { QuoteController } from "@/controllers/quoteController"
import { authenticateToken, requireVerified } from "@/middleware/auth"
import { validate, createQuoteSchema } from "@/middleware/validation"

const router = Router()

router.get("/", QuoteController.getQuotes)
router.post("/", authenticateToken, requireVerified, validate(createQuoteSchema), QuoteController.createQuote)
router.delete("/:id", authenticateToken, QuoteController.deleteQuote) // New delete route

export default router

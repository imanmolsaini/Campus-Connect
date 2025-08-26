import { Router } from "express"
import { NoteController } from "@/controllers/noteController"
import { authenticateToken, requireVerified } from "@/middleware/auth"
import { validate, createNoteSchema } from "@/middleware/validation"
import { uploadNote } from "@/middleware/upload"

const router = Router()

// Public routes
router.get("/", NoteController.getNotes)
router.get("/download/:id", NoteController.downloadNote)

// Protected routes
router.post(
  "/",
  authenticateToken,
  requireVerified,
  uploadNote.single("file"),
  validate(createNoteSchema),
  NoteController.createNote,
)
router.get("/my-notes", authenticateToken, NoteController.getUserNotes)

router.delete("/:id", authenticateToken, NoteController.deleteNote)
router.get("/admin/all", authenticateToken, NoteController.getAllNotes)

export default router

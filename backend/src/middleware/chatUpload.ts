import multer from "multer"
import path from "path"
import fs from "fs"
import { v4 as uuidv4 } from "uuid"

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || "uploads"
const chatDir = path.join(uploadDir, "chat")

if (!fs.existsSync(chatDir)) {
  fs.mkdirSync(chatDir, { recursive: true })
}

// Configure multer for chat file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, chatDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  },
})

// File filter for chat attachments
const fileFilter = (req: any, file: any, cb: multer.FileFilterCallback) => {
  // Allow common file types for chat
  const allowedTypes = [
    "pdf",
    "doc",
    "docx",
    "ppt",
    "pptx",
    "xls",
    "xlsx",
    "txt",
    "md",
    "csv",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "zip",
    "rar",
    "7z",
    "mp3",
    "mp4",
    "avi",
    "mov",
    "wmv",
  ]

  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1)

  if (allowedTypes.includes(fileExtension)) {
    cb(null, true)
  } else {
    cb(new Error(`File type .${fileExtension} is not allowed for chat attachments`))
  }
}

export const uploadChatAttachment = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB default
  },
})

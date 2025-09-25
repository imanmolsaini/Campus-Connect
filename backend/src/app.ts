import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import path from "path"
import dotenv from "dotenv"

// Import routes
import authRoutes from "@/routes/auth"
import courseRoutes from "@/routes/courses"
import noteRoutes from "@/routes/notes"
import reviewRoutes from "@/routes/reviews"
import lecturerRoutes from "@/routes/lecturers" // NEW
import lecturerFeedbackRoutes from "@/routes/lecturerFeedback" // MODIFIED
import quoteRoutes from "@/routes/quotes" // NEW
import dealRoutes from "@/routes/deals" // Added deals routes
import jobRoutes from "@/routes/jobs" // Added jobs routes
import eventRoutes from "@/routes/events" // Added events routes
import cron from "node-cron";
import pool from "./config/database";
import { EmailService } from "./services/emailService";

// Load environment variables
dotenv.config()

const app = express()

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
})
app.use(limiter)

// Logging
app.use(morgan("combined"))

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Static files (for file downloads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Campus Connect NZ API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/notes", noteRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/lecturers", lecturerRoutes) // NEW
app.use("/api/lecturer-feedback", lecturerFeedbackRoutes) // MODIFIED
app.use("/api/quotes", quoteRoutes) // NEW
app.use("/api/deals", dealRoutes) // Added deals API route
app.use("/api/jobs", jobRoutes) // Added jobs API route
app.use("/api/events", eventRoutes) // Added events API route

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global error handler:", err)

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large",
    })
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: "Unexpected file field",
    })
  }

  // Default error
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  })
})

export default app

// Send reminders for events starting in the next 10 minutes
cron.schedule("* * * * *", async () => {
  try {
    //selects the users that are interested in the event through getting the event time,id name and user emails 
    //then getting those user emails that have the interested tag, then checking the event time to see if its within the next 10 minutes

    const { rows: events } = await pool.query(`
      SELECT e.id, e.event_name, e.event_time, u.email
      FROM events e
      JOIN event_interests ei ON ei.event_id = e.id AND ei.interest_type = 'interested'
      JOIN users u ON u.id = ei.user_id
      WHERE e.event_time BETWEEN NOW() + INTERVAL '10 minutes' AND NOW() + INTERVAL '11 minutes'
        AND e.event_time > NOW()
    `);
    //if it is within that time it send the email
    for (const event of events) {
      await EmailService.sendReminderEmail(
        event.email,
        `Reminder: ${event.event_name} is starting soon!`,
        `Hi,\n\nThis is a reminder that "${event.event_name}" will start at ${event.event_time}.\n\n`
      );
    }
    //error handling for email service
  } catch (err) {
    console.error("Error sending event reminders:", err);
  }
});
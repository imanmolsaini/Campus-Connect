import nodemailer from "nodemailer"
import crypto from "crypto"

interface EventDetails {
  event_name: string
  event_time: string
  event_place: string
  event_location: string
  event_description?: string
  event_type: string
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  static generateToken(): string {
    return crypto.randomBytes(32).toString("hex")
  }

  static async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Verify Your Email - Campus Connect",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Welcome to Campus Connect, ${name}!</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Verify Email
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            If you didn't create an account, please ignore this email.
          </p>
        </div>
      `,
    }

    await this.transporter.sendMail(mailOptions)
  }

  static async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Reset Your Password - Campus Connect",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Reset Password
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `,
    }

    await this.transporter.sendMail(mailOptions)
  }

  static async sendEventSubscriptionEmail(email: string, name: string, eventDetails: EventDetails): Promise<void> {
    const eventDate = new Date(eventDetails.event_time)
    const formattedDate = eventDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const formattedTime = eventDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    // Generate ICS calendar file content
    const icsContent = this.generateICSFile(eventDetails)
    const icsBase64 = Buffer.from(icsContent).toString("base64")

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: `Event Subscription Confirmed: ${eventDetails.event_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 You're Subscribed!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hi ${name},</p>
            <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
              You've successfully subscribed to the following event. We'll send you a reminder before it starts!
            </p>
            
            <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid #7c3aed; margin-bottom: 25px;">
              <h2 style="color: #7c3aed; margin-top: 0; font-size: 22px;">${eventDetails.event_name}</h2>
              
              <div style="margin: 15px 0;">
                <p style="margin: 8px 0; color: #4b5563;">
                  <strong style="color: #1f2937;">📅 Date:</strong> ${formattedDate}
                </p>
                <p style="margin: 8px 0; color: #4b5563;">
                  <strong style="color: #1f2937;">🕐 Time:</strong> ${formattedTime}
                </p>
                <p style="margin: 8px 0; color: #4b5563;">
                  <strong style="color: #1f2937;">📍 Location:</strong> ${eventDetails.event_place}
                </p>
                <p style="margin: 8px 0; color: #4b5563;">
                  <strong style="color: #1f2937;">🗺️ Address:</strong> ${eventDetails.event_location}
                </p>
                <p style="margin: 8px 0; color: #4b5563;">
                  <strong style="color: #1f2937;">🏷️ Type:</strong> <span style="background: #ede9fe; color: #7c3aed; padding: 4px 12px; border-radius: 12px; text-transform: capitalize;">${eventDetails.event_type}</span>
                </p>
              </div>
              
              ${
                eventDetails.event_description
                  ? `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #4b5563; line-height: 1.6;">
                    <strong style="color: #1f2937;">About this event:</strong><br/>
                    ${eventDetails.event_description}
                  </p>
                </div>
              `
                  : ""
              }
            </div>
            
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border: 1px solid #bfdbfe; margin-bottom: 25px;">
              <p style="margin: 0 0 15px 0; color: #1e40af; font-weight: 600;">📆 Add to Your Calendar</p>
              <p style="margin: 0 0 15px 0; color: #1e3a8a; font-size: 14px;">
                The calendar file is attached to this email. Simply open it to add this event to your calendar app (Google Calendar, Outlook, Apple Calendar, etc.)
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                See you at the event! 🎊
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 5px 0;">Campus Connect - Connecting Students, One Event at a Time</p>
            <p style="margin: 5px 0;">If you didn't subscribe to this event, please ignore this email.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `${eventDetails.event_name.replace(/[^a-z0-9]/gi, "_")}.ics`,
          content: icsBase64,
          encoding: "base64",
          contentType: "text/calendar",
        },
      ],
    }

    await this.transporter.sendMail(mailOptions)
  }

  private static generateICSFile(eventDetails: EventDetails): string {
    const eventDate = new Date(eventDetails.event_time)

    // Format dates for ICS (YYYYMMDDTHHMMSSZ)
    const formatICSDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    }

    const startDate = formatICSDate(eventDate)
    // Assume 2-hour duration for events
    const endDate = formatICSDate(new Date(eventDate.getTime() + 2 * 60 * 60 * 1000))

    // Create alarm for 1 hour before event
    const alarmDate = formatICSDate(new Date(eventDate.getTime() - 60 * 60 * 1000))

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Campus Connect//Event Subscription//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${crypto.randomUUID()}@campusconnect.com`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${eventDetails.event_name}`,
      `DESCRIPTION:${eventDetails.event_description || "Campus Connect Event"}`,
      `LOCATION:${eventDetails.event_place}, ${eventDetails.event_location}`,
      "STATUS:CONFIRMED",
      "SEQUENCE:0",
      "BEGIN:VALARM",
      "TRIGGER:-PT1H",
      "ACTION:DISPLAY",
      `DESCRIPTION:Reminder: ${eventDetails.event_name} starts in 1 hour`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n")

    return icsContent
  }
}

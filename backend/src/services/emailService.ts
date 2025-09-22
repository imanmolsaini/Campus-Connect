import transporter from "@/config/email"
import { v4 as uuidv4 } from "uuid"

export class EmailService {
  static async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Verify Your Campus Connect NZ Account",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Account</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.025em;">Campus Connect NZ</h1>
                      <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0; font-size: 16px; font-weight: 400;">Auckland University of Technology</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #1f2937; margin: 0 0 24px; font-size: 24px; font-weight: 600; text-align: center;">Welcome to Campus Connect NZ!</h2>
                      
                      <p style="color: #374151; margin: 0 0 20px; font-size: 16px;">Dear ${name},</p>
                      
                      <p style="color: #374151; margin: 0 0 20px; font-size: 16px;">Thank you for joining Campus Connect NZ, the premier platform for AUT students to share knowledge, connect with peers, and excel in their academic journey.</p>
                      
                      <p style="color: #374151; margin: 0 0 32px; font-size: 16px;">To complete your registration and secure your account, please verify your email address by clicking the button below:</p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; margin: 32px 0;">
                        <tr>
                          <td style="text-align: center;">
                            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; letter-spacing: 0.025em; box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.4); transition: all 0.2s;">
                              ✓ Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Alternative Link -->
                      <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 32px 0;">
                        <p style="color: #6b7280; margin: 0 0 12px; font-size: 14px; font-weight: 500;">Alternative verification method:</p>
                        <p style="color: #6b7280; margin: 0; font-size: 14px;">If the button above doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #3b82f6; margin: 8px 0 0; font-size: 14px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;">${verificationUrl}</p>
                      </div>
                      
                      <!-- Security Notice -->
                      <div style="border-left: 4px solid #fbbf24; background-color: #fffbeb; padding: 16px; margin: 32px 0; border-radius: 0 8px 8px 0;">
                        <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 500;">🔒 Security Notice</p>
                        <p style="color: #92400e; margin: 8px 0 0; font-size: 14px;">This verification link will expire in 24 hours for your security. If you didn't create this account, please ignore this email.</p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 32px 40px; border-top: 1px solid #e5e7eb;">
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td style="text-align: center;">
                            <p style="color: #6b7280; margin: 0 0 16px; font-size: 14px; font-weight: 500;">Campus Connect NZ</p>
                            <p style="color: #9ca3af; margin: 0 0 8px; font-size: 13px;">Connecting AUT students for academic success</p>
                            <p style="color: #9ca3af; margin: 0; font-size: 13px;">Auckland University of Technology, New Zealand</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="text-align: center; padding-top: 24px;">
                            <div style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
                              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                                This email was sent to ${email}. If you have any questions, please contact our support team.
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    }

    await transporter.sendMail(mailOptions)
  }

  static async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Reset Your Campus Connect NZ Password",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 40px 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.025em;">Campus Connect NZ</h1>
                      <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0; font-size: 16px; font-weight: 400;">Password Reset Request</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #1f2937; margin: 0 0 24px; font-size: 24px; font-weight: 600; text-align: center;">Reset Your Password</h2>
                      
                      <p style="color: #374151; margin: 0 0 20px; font-size: 16px;">Dear ${name},</p>
                      
                      <p style="color: #374151; margin: 0 0 20px; font-size: 16px;">We received a request to reset the password for your Campus Connect NZ account. If you made this request, click the button below to create a new password:</p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; margin: 32px 0;">
                        <tr>
                          <td style="text-align: center;">
                            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; letter-spacing: 0.025em; box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.4);">
                              🔐 Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Alternative Link -->
                      <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 32px 0;">
                        <p style="color: #6b7280; margin: 0 0 12px; font-size: 14px; font-weight: 500;">Alternative reset method:</p>
                        <p style="color: #6b7280; margin: 0; font-size: 14px;">Copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #dc2626; margin: 8px 0 0; font-size: 14px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;">${resetUrl}</p>
                      </div>
                      
                      <!-- Security Notice -->
                      <div style="border-left: 4px solid #ef4444; background-color: #fef2f2; padding: 16px; margin: 32px 0; border-radius: 0 8px 8px 0;">
                        <p style="color: #b91c1c; margin: 0; font-size: 14px; font-weight: 500;">🚨 Important Security Information</p>
                        <p style="color: #b91c1c; margin: 8px 0 0; font-size: 14px;">This reset link expires in 1 hour and can only be used once. If you didn't request this password reset, please ignore this email - your password will remain unchanged.</p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 32px 40px; border-top: 1px solid #e5e7eb;">
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td style="text-align: center;">
                            <p style="color: #6b7280; margin: 0 0 16px; font-size: 14px; font-weight: 500;">Campus Connect NZ</p>
                            <p style="color: #9ca3af; margin: 0 0 8px; font-size: 13px;">Connecting AUT students for academic success</p>
                            <p style="color: #9ca3af; margin: 0; font-size: 13px;">Auckland University of Technology, New Zealand</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="text-align: center; padding-top: 24px;">
                            <div style="border-top: 1px solid #e5e7eb; padding-top: 16px;">
                              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                                This email was sent to ${email}. If you have any questions, please contact our support team.
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    }

    await transporter.sendMail(mailOptions)
  }

  static generateToken(): string {
    return uuidv4()
  }
}

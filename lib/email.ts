import nodemailer from "nodemailer"

// Create transporter using Gmail SMTP settings
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`

  try {
    const info = await transporter.sendMail({
      from: `"Kia Ora Kahi" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your Kia Ora account",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b5cf6; margin: 0;">Kia Ora Kahi</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: white; margin: 0 0 20px 0;">Verify Your Account</h2>
            <p style="color: white; margin: 0 0 25px 0;">Click the button below to verify your email address and activate your account.</p>
            <a href="${verificationUrl}" style="display: inline-block; background: white; color: #8b5cf6; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Account</a>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #666;">
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${verificationUrl}</p>
          </div>
        </div>
      `,
      text: `
        Welcome to Kia Ora Kahi!
        
        Please verify your email address by clicking the following link:
        ${verificationUrl}
        
        If the link doesn't work, copy and paste it into your browser.
      `,
    })

    console.log("✅ Verification email sent successfully!")
  } catch (error) {
    console.error("❌ Failed to send verification email:", error)
    throw new Error("Failed to send verification email")
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

  try {
    const info = await transporter.sendMail({
      from: `"Kia Ora Kahi" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your Kia Ora password",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b5cf6; margin: 0;">Kia Ora Kahi</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: white; margin: 0 0 20px 0;">Reset Your Password</h2>
            <p style="color: white; margin: 0 0 25px 0;">Click the button below to reset your password.</p>
            <a href="${resetUrl}" style="display: inline-block; background: white; color: #8b5cf6; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #666;">
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
          </div>
        </div>
      `,
      text: `
        Reset your Kia Ora Kahi password
        
        Click the following link to reset your password:
        ${resetUrl}
        
        If the link doesn't work, copy and paste it into your browser.
      `,
    })

    console.log("✅ Password reset email sent successfully!")
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error)
    throw new Error("Failed to send password reset email")
  }
}

export async function sendApplicationStatusEmail(
  email: string,
  fullName: string,
  status: string,
  message: string,
  reviewNotes?: string,
) {
  const statusColors = {
    PENDING: "#f59e0b",
    UNDER_REVIEW: "#3b82f6",
    APPROVED: "#10b981",
    REJECTED: "#ef4444",
    REQUIRES_CHANGES: "#f59e0b",
  }

  const statusColor = statusColors[status as keyof typeof statusColors] || "#8b5cf6"

  try {
    const info = await transporter.sendMail({
      from: `"Kia Ora Kahi" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Application Update: ${status.replace("_", " ")}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b5cf6; margin: 0;">Kia Ora Kahi</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, ${statusColor} 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: white; margin: 0 0 20px 0;">Application Status Update</h2>
            <p style="color: white; margin: 0 0 10px 0;">Hello ${fullName},</p>
            <p style="color: white; margin: 0 0 25px 0;">${message}</p>
            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: white; margin: 0; font-weight: bold;">Status: ${status.replace("_", " ")}</p>
            </div>
          </div>
          
          ${
            reviewNotes
              ? `
          <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <h3 style="color: #333; margin: 0 0 10px 0;">Review Notes:</h3>
            <p style="color: #666; margin: 0;">${reviewNotes}</p>
          </div>
          `
              : ""
          }
          
          <div style="margin-top: 20px; text-align: center; color: #666;">
            <p>Thank you for your interest in Kia Ora Kahi!</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      `,
      text: `
        Kia Ora Kahi - Application Status Update
        
        Hello ${fullName},
        
        ${message}
        
        Status: ${status.replace("_", " ")}
        
        ${reviewNotes ? `Review Notes: ${reviewNotes}` : ""}
        
        Thank you for your interest in Kia Ora Kahi!
      `,
    })

    console.log("✅ Application status email sent successfully!")
  } catch (error) {
    console.error("❌ Failed to send application status email:", error)
    throw new Error("Failed to send application status email")
  }
}
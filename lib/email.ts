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
    await transporter.sendMail({
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
  } catch (error) {
    console.error("Failed to send verification email:", error)
    throw new Error("Failed to send verification email")
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

  try {
    await transporter.sendMail({
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
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    throw new Error("Failed to send password reset email")
  }
}
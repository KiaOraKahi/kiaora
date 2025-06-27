import emailjs from "emailjs-com"

const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!
const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!
const userId = process.env.NEXT_PUBLIC_EMAILJS_USER_ID!

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`

  try {
    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: email,
        subject: "Verify your Kia Ora account",
        message: `Please click the link below to verify your account: ${verificationUrl}`,
        verification_url: verificationUrl,
      },
      userId,
    )
  } catch (error) {
    console.error("Failed to send verification email:", error)
    throw new Error("Failed to send verification email")
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

  try {
    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: email,
        subject: "Reset your Kia Ora password",
        message: `Please click the link below to reset your password: ${resetUrl}`,
        reset_url: resetUrl,
      },
      userId,
    )
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    throw new Error("Failed to send password reset email")
  }
}

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

// Generic sendEmail function - moved to top so other functions can use it
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html?: string
  text?: string
}) {
  try {
    const info = await transporter.sendMail({
      from: `"Kia Ora Kahi" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    })
    console.log("✅ Email sent successfully:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Failed to send email:", error)
    // Don't throw error, just return failure status
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

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
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Failed to send verification email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
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
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
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
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Failed to send application status email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// New booking-related email functions
export async function sendNewBookingNotificationToCelebrity(
  celebrityEmail: string,
  celebrityName: string,
  bookingDetails: {
    orderNumber: string
    customerName: string
    recipientName: string
    occasion: string
    amount: number
    instructions: string
    deadline: string
  },
) {
  try {
    const info = await transporter.sendMail({
      from: `"Kia Ora Kahi" <${process.env.EMAIL_USER}>`,
      to: celebrityEmail,
      subject: `New Booking Request - ${bookingDetails.orderNumber}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b5cf6; margin: 0;">Kia Ora Kahi</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: white; margin: 0 0 20px 0;">🎉 New Booking Request!</h2>
            <p style="color: white; margin: 0 0 25px 0;">Hello ${celebrityName}, you have a new booking request waiting for your response.</p>
            <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
              <p style="color: white; margin: 0 0 10px 0;"><strong>Order:</strong> ${bookingDetails.orderNumber}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>From:</strong> ${bookingDetails.customerName}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>For:</strong> ${bookingDetails.recipientName}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Occasion:</strong> ${bookingDetails.occasion}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Amount:</strong> $${bookingDetails.amount.toLocaleString()}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Deadline:</strong> ${new Date(bookingDetails.deadline).toLocaleDateString()}</p>
            </div>
            <a href="${process.env.NEXTAUTH_URL}/celebrity-dashboard" style="display: inline-block; background: white; color: #8b5cf6; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Request</a>
          </div>
          
          ${
            bookingDetails.instructions
              ? `
          <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <h3 style="color: #333; margin: 0 0 10px 0;">Special Instructions:</h3>
            <p style="color: #666; margin: 0;">${bookingDetails.instructions}</p>
          </div>
          `
              : ""
          }
          
          <div style="margin-top: 20px; text-align: center; color: #666;">
            <p>Please respond to this request as soon as possible to maintain your response rate.</p>
            <p>Log in to your celebrity dashboard to accept or decline this request.</p>
          </div>
        </div>
      `,
      text: `
        Kia Ora Kahi - New Booking Request
        
        Hello ${celebrityName},
        
        You have a new booking request:
        
        Order: ${bookingDetails.orderNumber}
        From: ${bookingDetails.customerName}
        For: ${bookingDetails.recipientName}
        Occasion: ${bookingDetails.occasion}
        Amount: $${bookingDetails.amount.toLocaleString()}
        Deadline: ${new Date(bookingDetails.deadline).toLocaleDateString()}
        
        ${bookingDetails.instructions ? `Special Instructions: ${bookingDetails.instructions}` : ""}
        
        Please log in to your celebrity dashboard to respond: ${process.env.NEXTAUTH_URL}/celebrity-dashboard
      `,
    })

    console.log("✅ New booking notification email sent to celebrity!")
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Failed to send new booking notification email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendBookingConfirmationToCustomer(
  customerEmail: string,
  customerName: string,
  bookingDetails: {
    orderNumber: string
    celebrityName: string
    recipientName: string
    occasion: string
    amount: number
    estimatedDelivery: string
  },
) {
  try {
    const info = await transporter.sendMail({
      from: `"Kia Ora Kahi" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Booking Confirmed - ${bookingDetails.orderNumber}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b5cf6; margin: 0;">Kia Ora Kahi</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #10b981 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: white; margin: 0 0 20px 0;">🎉 Booking Confirmed!</h2>
            <p style="color: white; margin: 0 0 25px 0;">Great news ${customerName}! ${bookingDetails.celebrityName} has accepted your booking request.</p>
            <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
              <p style="color: white; margin: 0 0 10px 0;"><strong>Order:</strong> ${bookingDetails.orderNumber}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Celebrity:</strong> ${bookingDetails.celebrityName}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>For:</strong> ${bookingDetails.recipientName}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Occasion:</strong> ${bookingDetails.occasion}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Amount:</strong> $${bookingDetails.amount.toLocaleString()}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Expected Delivery:</strong> ${new Date(bookingDetails.estimatedDelivery).toLocaleDateString()}</p>
            </div>
            <a href="${process.env.NEXTAUTH_URL}/orders/${bookingDetails.orderNumber}" style="display: inline-block; background: white; color: #10b981; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Order</a>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #666;">
            <p>Your personalized video message is now being created!</p>
            <p>You'll receive another email when it's ready for download.</p>
            <p>Track your order status anytime in your account dashboard.</p>
          </div>
        </div>
      `,
      text: `
        Kia Ora Kahi - Booking Confirmed
        
        Great news ${customerName}!
        
        ${bookingDetails.celebrityName} has accepted your booking request.
        
        Order: ${bookingDetails.orderNumber}
        Celebrity: ${bookingDetails.celebrityName}
        For: ${bookingDetails.recipientName}
        Occasion: ${bookingDetails.occasion}
        Amount: $${bookingDetails.amount.toLocaleString()}
        Expected Delivery: ${new Date(bookingDetails.estimatedDelivery).toLocaleDateString()}
        
        Track your order: ${process.env.NEXTAUTH_URL}/orders/${bookingDetails.orderNumber}
      `,
    })

    console.log("✅ Booking confirmation email sent to customer!")
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Failed to send booking confirmation email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendBookingRejectionToCustomer(
  customerEmail: string,
  customerName: string,
  bookingDetails: {
    orderNumber: string
    celebrityName: string
    recipientName: string
    occasion: string
    amount: number
    refundAmount: number
  },
) {
  try {
    const info = await transporter.sendMail({
      from: `"Kia Ora Kahi" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Booking Update - ${bookingDetails.orderNumber}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b5cf6; margin: 0;">Kia Ora Kahi</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: white; margin: 0 0 20px 0;">Booking Update</h2>
            <p style="color: white; margin: 0 0 25px 0;">Hello ${customerName}, we have an update regarding your booking request.</p>
            <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
              <p style="color: white; margin: 0 0 10px 0;"><strong>Order:</strong> ${bookingDetails.orderNumber}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Celebrity:</strong> ${bookingDetails.celebrityName}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Status:</strong> Unable to fulfill</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Refund Amount:</strong> $${bookingDetails.refundAmount.toLocaleString()}</p>
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <h3 style="color: #333; margin: 0 0 10px 0;">What happens next?</h3>
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              <li>Your payment will be fully refunded within 3-5 business days</li>
              <li>You can browse other celebrities who might be available</li>
              <li>Our support team is here to help you find alternatives</li>
            </ul>
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/celebrities" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">Browse Celebrities</a>
            <a href="${process.env.NEXTAUTH_URL}/contact" style="display: inline-block; background: transparent; color: #8b5cf6; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; border: 2px solid #8b5cf6;">Contact Support</a>
          </div>
        </div>
      `,
      text: `
        Kia Ora Kahi - Booking Update
        
        Hello ${customerName},
        
        Unfortunately, ${bookingDetails.celebrityName} is unable to fulfill your booking request for order ${bookingDetails.orderNumber}.
        
        Your payment of $${bookingDetails.refundAmount.toLocaleString()} will be fully refunded within 3-5 business days.
        
        You can browse other celebrities or contact our support team for assistance.
        
        Browse celebrities: ${process.env.NEXTAUTH_URL}/celebrities
        Contact support: ${process.env.NEXTAUTH_URL}/contact
      `,
    })

    console.log("✅ Booking rejection email sent to customer!")
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Failed to send booking rejection email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Send video delivery notification to customer
export async function sendVideoDeliveryNotification(
  email: string,
  customerName: string,
  orderDetails: {
    orderNumber: string
    celebrityName: string
    recipientName: string
    occasion: string
    videoUrl: string
  },
) {
  try {
    const info = await transporter.sendMail({
      from: `"Kia Ora Kahi" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎬 Your video from ${orderDetails.celebrityName} is ready!`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b5cf6; margin: 0;">Kia Ora Kahi</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #10b981 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: white; margin: 0 0 20px 0;">🎬 Your Video is Ready!</h2>
            <p style="color: white; margin: 0 0 25px 0;">Exciting news ${customerName}! ${orderDetails.celebrityName} has completed your personalized video message for ${orderDetails.recipientName}!</p>
            <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
              <p style="color: white; margin: 0 0 10px 0;"><strong>Order:</strong> ${orderDetails.orderNumber}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Celebrity:</strong> ${orderDetails.celebrityName}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>For:</strong> ${orderDetails.recipientName}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Occasion:</strong> ${orderDetails.occasion}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Status:</strong> ✅ Delivered</p>
            </div>
            <a href="${process.env.NEXTAUTH_URL}/orders/${orderDetails.orderNumber}" style="display: inline-block; background: white; color: #10b981; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Watch Your Video</a>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #666;">
            <p>Your video is now available to watch and download!</p>
            <p>Share this special moment with ${orderDetails.recipientName}!</p>
            <p style="font-size: 14px;"><strong>Tip:</strong> You can download the video to save it permanently or share it on social media!</p>
          </div>
        </div>
      `,
      text: `
        Kia Ora Kahi - Your Video is Ready!
        
        Exciting news ${customerName}!
        
        ${orderDetails.celebrityName} has completed your personalized video message for ${orderDetails.recipientName}!
        
        Order: ${orderDetails.orderNumber}
        Celebrity: ${orderDetails.celebrityName}
        For: ${orderDetails.recipientName}
        Occasion: ${orderDetails.occasion}
        Status: ✅ Delivered
        
        Watch your video: ${process.env.NEXTAUTH_URL}/orders/${orderDetails.orderNumber}
      `,
    })

    console.log("✅ Video delivery notification email sent successfully!")
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Failed to send video delivery notification email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// NEW: Send video approval notification to customer
export async function sendVideoApprovalNotification(
  email: string,
  customerName: string,
  orderDetails: {
    orderNumber: string
    celebrityName: string
    recipientName: string
    occasion: string
    videoUrl: string
    approvalUrl: string
  },
) {
  try {
    const info = await transporter.sendMail({
      from: `"Kia Ora Kahi" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎬 Please review your video from ${orderDetails.celebrityName}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b5cf6; margin: 0;">Kia Ora Kahi</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: white; margin: 0 0 20px 0;">🎬 Your Video is Ready for Review!</h2>
            <p style="color: white; margin: 0 0 25px 0;">Great news ${customerName}! ${orderDetails.celebrityName} has completed your personalized video message for ${orderDetails.recipientName}. Please review and approve it.</p>
            <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
              <p style="color: white; margin: 0 0 10px 0;"><strong>Order:</strong> ${orderDetails.orderNumber}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Celebrity:</strong> ${orderDetails.celebrityName}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>For:</strong> ${orderDetails.recipientName}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Occasion:</strong> ${orderDetails.occasion}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Status:</strong> ⏳ Awaiting Your Approval</p>
            </div>
            <a href="${process.env.NEXTAUTH_URL}/orders/${orderDetails.orderNumber}" style="display: inline-block; background: white; color: #f59e0b; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Video</a>
          </div>
          
          <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <h3 style="color: #333; margin: 0 0 10px 0;">What happens next?</h3>
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              <li><strong>Review the video</strong> - Watch it and make sure you're happy with the content</li>
              <li><strong>Approve or request changes</strong> - You can accept it or ask for revisions</li>
              <li><strong>Payment release</strong> - Your payment is held securely until you approve</li>
              <li><strong>Download & share</strong> - Once approved, download and share your video!</li>
            </ul>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #666;">
            <p><strong>Important:</strong> Your payment is held securely until you approve the video.</p>
            <p>If you need any changes, you can request up to 2 revisions at no extra cost.</p>
          </div>
        </div>
      `,
      text: `
        Kia Ora Kahi - Your Video is Ready for Review!
        
        Great news ${customerName}!
        
        ${orderDetails.celebrityName} has completed your personalized video message for ${orderDetails.recipientName}. Please review and approve it.
        
        Order: ${orderDetails.orderNumber}
        Celebrity: ${orderDetails.celebrityName}
        For: ${orderDetails.recipientName}
        Occasion: ${orderDetails.occasion}
        Status: ⏳ Awaiting Your Approval
        
        Review your video: ${process.env.NEXTAUTH_URL}/orders/${orderDetails.orderNumber}
        
        What happens next?
        - Review the video and make sure you're happy with the content
        - Approve or request changes (up to 2 revisions at no extra cost)
        - Your payment is held securely until you approve
        - Once approved, download and share your video!
      `,
    })

    console.log("✅ Video approval notification email sent successfully!")
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Failed to send video approval notification email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// NEW: Send video approval confirmation to customer
export async function sendVideoApprovalConfirmation(
  email: string,
  customerName: string,
  orderDetails: {
    orderNumber: string
    celebrityName: string
    recipientName: string
    occasion: string
    amount: number
    videoUrl: string
  },
) {
  try {
    const info = await transporter.sendMail({
      from: `"Kia Ora Kahi" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ Video approved - Payment released for ${orderDetails.orderNumber}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b5cf6; margin: 0;">Kia Ora Kahi</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #10b981 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: white; margin: 0 0 20px 0;">✅ Video Approved!</h2>
            <p style="color: white; margin: 0 0 25px 0;">Thank you ${customerName}! You've approved your video from ${orderDetails.celebrityName}. Your payment has been released and the order is now complete.</p>
            <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
              <p style="color: white; margin: 0 0 10px 0;"><strong>Order:</strong> ${orderDetails.orderNumber}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Celebrity:</strong> ${orderDetails.celebrityName}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>For:</strong> ${orderDetails.recipientName}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Occasion:</strong> ${orderDetails.occasion}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Amount:</strong> $${orderDetails.amount.toLocaleString()}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Status:</strong> ✅ Completed</p>
            </div>
            <a href="${process.env.NEXTAUTH_URL}/orders/${orderDetails.orderNumber}" style="display: inline-block; background: white; color: #10b981; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order</a>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #666;">
            <p>🎉 Your video is now available to download and share!</p>
            <p>💝 Consider leaving a tip or review for ${orderDetails.celebrityName}!</p>
            <p>📱 Share your experience on social media and tag us!</p>
          </div>
        </div>
      `,
      text: `
        Kia Ora Kahi - Video Approved!
        
        Thank you ${customerName}!
        
        You've approved your video from ${orderDetails.celebrityName}. Your payment has been released and the order is now complete.
        
        Order: ${orderDetails.orderNumber}
        Celebrity: ${orderDetails.celebrityName}
        For: ${orderDetails.recipientName}
        Occasion: ${orderDetails.occasion}
        Amount: $${orderDetails.amount.toLocaleString()}
        Status: ✅ Completed
        
        View your order: ${process.env.NEXTAUTH_URL}/orders/${orderDetails.orderNumber}
        
        Your video is now available to download and share!
        Consider leaving a tip or review for ${orderDetails.celebrityName}!
      `,
    })

    console.log("✅ Video approval confirmation email sent successfully!")
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Failed to send video approval confirmation email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// NEW: Send video decline notification to celebrity
export async function sendVideoDeclineNotificationToCelebrity(
  celebrityEmail: string,
  celebrityName: string,
  orderDetails: {
    orderNumber: string
    customerName: string
    recipientName: string
    occasion: string
    declineReason: string
    revisionCount: number
    maxRevisions: number
  },
) {
  try {
    const info = await transporter.sendMail({
      from: `"Kia Ora Kahi" <${process.env.EMAIL_USER}>`,
      to: celebrityEmail,
      subject: `📝 Video revision requested - ${orderDetails.orderNumber}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b5cf6; margin: 0;">Kia Ora Kahi</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: white; margin: 0 0 20px 0;">📝 Video Revision Requested</h2>
            <p style="color: white; margin: 0 0 25px 0;">Hello ${celebrityName}, ${orderDetails.customerName} has requested a revision for their video order.</p>
            <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
              <p style="color: white; margin: 0 0 10px 0;"><strong>Order:</strong> ${orderDetails.orderNumber}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Customer:</strong> ${orderDetails.customerName}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>For:</strong> ${orderDetails.recipientName}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Occasion:</strong> ${orderDetails.occasion}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Revision:</strong> ${orderDetails.revisionCount} of ${orderDetails.maxRevisions}</p>
            </div>
            <a href="${process.env.NEXTAUTH_URL}/celebrity-dashboard" style="display: inline-block; background: white; color: #f59e0b; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Request</a>
          </div>
          
          <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <h3 style="color: #333; margin: 0 0 10px 0;">Customer Feedback:</h3>
            <p style="color: #666; margin: 0; font-style: italic;">"${orderDetails.declineReason}"</p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #666;">
            <p>Please create a new video addressing the customer's feedback.</p>
            <p>Upload the revised video through your celebrity dashboard.</p>
            ${
              orderDetails.revisionCount >= orderDetails.maxRevisions
                ? '<p style="color: #ef4444;"><strong>Note:</strong> This is the final revision allowed for this order.</p>'
                : `<p>Revisions remaining: ${orderDetails.maxRevisions - orderDetails.revisionCount}</p>`
            }
          </div>
        </div>
      `,
      text: `
        Kia Ora Kahi - Video Revision Requested
        
        Hello ${celebrityName},
        
        ${orderDetails.customerName} has requested a revision for their video order.
        
        Order: ${orderDetails.orderNumber}
        Customer: ${orderDetails.customerName}
        For: ${orderDetails.recipientName}
        Occasion: ${orderDetails.occasion}
        Revision: ${orderDetails.revisionCount} of ${orderDetails.maxRevisions}
        
        Customer Feedback:
        "${orderDetails.declineReason}"
        
        Please create a new video addressing the customer's feedback and upload it through your celebrity dashboard.
        
        Dashboard: ${process.env.NEXTAUTH_URL}/celebrity-dashboard
        
        ${
          orderDetails.revisionCount >= orderDetails.maxRevisions
            ? "Note: This is the final revision allowed for this order."
            : `Revisions remaining: ${orderDetails.maxRevisions - orderDetails.revisionCount}`
        }
      `,
    })

    console.log("✅ Video decline notification email sent to celebrity!")
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Failed to send video decline notification email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// NEW: Send video decline confirmation to customer
export async function sendVideoDeclineConfirmation(
  email: string,
  customerName: string,
  orderDetails: {
    orderNumber: string
    celebrityName: string
    recipientName: string
    occasion: string
    declineReason: string
    revisionCount: number
    maxRevisions: number
  },
) {
  try {
    const info = await transporter.sendMail({
      from: `"Kia Ora Kahi" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `📝 Revision request sent - ${orderDetails.orderNumber}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b5cf6; margin: 0;">Kia Ora Kahi</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: white; margin: 0 0 20px 0;">📝 Revision Request Sent</h2>
            <p style="color: white; margin: 0 0 25px 0;">Thank you ${customerName}! Your revision request has been sent to ${orderDetails.celebrityName}. They will work on addressing your feedback.</p>
            <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
              <p style="color: white; margin: 0 0 10px 0;"><strong>Order:</strong> ${orderDetails.orderNumber}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Celebrity:</strong> ${orderDetails.celebrityName}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>For:</strong> ${orderDetails.recipientName}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Occasion:</strong> ${orderDetails.occasion}</p>
              <p style="color: white; margin: 0 0 10px 0;"><strong>Revision:</strong> ${orderDetails.revisionCount} of ${orderDetails.maxRevisions}</p>
            </div>
            <a href="${process.env.NEXTAUTH_URL}/orders/${orderDetails.orderNumber}" style="display: inline-block; background: white; color: #3b82f6; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Order</a>
          </div>
          
          <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <h3 style="color: #333; margin: 0 0 10px 0;">Your Feedback:</h3>
            <p style="color: #666; margin: 0; font-style: italic;">"${orderDetails.declineReason}"</p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #666;">
            <p>🎬 ${orderDetails.celebrityName} will create a new video based on your feedback</p>
            <p>📧 You'll receive an email when the revised video is ready for review</p>
            <p>💰 Your payment remains securely held until you approve the video</p>
            ${
              orderDetails.revisionCount >= orderDetails.maxRevisions
                ? '<p style="color: #ef4444;"><strong>Note:</strong> This was your final revision for this order.</p>'
                : `<p>Revisions remaining: ${orderDetails.maxRevisions - orderDetails.revisionCount}</p>`
            }
          </div>
        </div>
      `,
      text: `
        Kia Ora Kahi - Revision Request Sent
        
        Thank you ${customerName}!
        
        Your revision request has been sent to ${orderDetails.celebrityName}. They will work on addressing your feedback.
        
        Order: ${orderDetails.orderNumber}
        Celebrity: ${orderDetails.celebrityName}
        For: ${orderDetails.recipientName}
        Occasion: ${orderDetails.occasion}
        Revision: ${orderDetails.revisionCount} of ${orderDetails.maxRevisions}
        
        Your Feedback:
        "${orderDetails.declineReason}"
        
        What happens next:
        - ${orderDetails.celebrityName} will create a new video based on your feedback
        - You'll receive an email when the revised video is ready for review
        - Your payment remains securely held until you approve the video
        
        Track your order: ${process.env.NEXTAUTH_URL}/orders/${orderDetails.orderNumber}
        
        ${
          orderDetails.revisionCount >= orderDetails.maxRevisions
            ? "Note: This was your final revision for this order."
            : `Revisions remaining: ${orderDetails.maxRevisions - orderDetails.revisionCount}`
        }
      `,
    })

    console.log("✅ Video decline confirmation email sent successfully!")
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Failed to send video decline confirmation email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

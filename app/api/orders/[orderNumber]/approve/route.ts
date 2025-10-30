import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transferBookingPayment } from "@/lib/stripe";
import Stripe from "stripe";

console.log("📦 APPROVAL API - All imports loaded successfully");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

console.log(
  "💳 APPROVAL API - Stripe initialized:",
  !!process.env.STRIPE_SECRET_KEY
);
console.log("🗄️ APPROVAL API - Prisma available:", !!prisma);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  console.log("🚀 APPROVAL API CALLED - Starting function...");

  try {
    console.log("🔐 Getting server session...");
    const session = await getServerSession(authOptions);
    console.log("👤 Session result:", !!session, "User ID:", session?.user?.id);

    if (!session?.user?.id) {
      console.log("❌ No session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("📝 Getting params...");
    const { orderNumber } = await params;
    console.log("🔢 Order number:", orderNumber);

    if (!orderNumber) {
      console.log("❌ No order number provided");
      return NextResponse.json(
        { error: "Order number is required" },
        { status: 400 }
      );
    }

    console.log(`🔍 Processing approval for order: ${orderNumber}`);
    console.log(`👤 User ID: ${session.user.id}`);

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        celebrity: {
          include: {
            user: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      console.log(`❌ Order not found: ${orderNumber}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log(`📋 Order details:`, {
      id: order.id,
      status: order.status,
      approvalStatus: order.approvalStatus,
      userId: order.userId,
      celebrityId: order.celebrityId,
      hasStripeAccount: !!order.celebrity.stripeConnectAccountId,
      totalAmount: order.totalAmount,
      currency: order.currency,
    });

    if (order.userId !== session.user.id) {
      console.log(
        `❌ Unauthorized: User ${session.user.id} cannot approve order ${order.id} (owned by ${order.userId})`
      );
      return NextResponse.json(
        { error: "Unauthorized to approve this order" },
        { status: 403 }
      );
    }

    if (order.approvalStatus !== "PENDING_APPROVAL") {
      console.log(
        `❌ Invalid status: Order ${order.id} has status ${order.approvalStatus}, expected PENDING_APPROVAL`
      );
      return NextResponse.json(
        {
          error: `Order cannot be approved. Current approval status: ${order.approvalStatus}`,
        },
        { status: 400 }
      );
    }

    // Check if celebrity has Stripe Connect account
    if (!order.celebrity.stripeConnectAccountId) {
      console.log(
        `❌ No Stripe account: Celebrity ${order.celebrityId} has no Stripe Connect account`
      );
      return NextResponse.json(
        { error: "Celebrity payment account not set up" },
        { status: 400 }
      );
    }

    console.log(`✅ Validation passed, proceeding with Stripe transfer...`);

    // Use the order's actual currency instead of hardcoded "nzd"
    const currency = order.currency.toLowerCase();

    // Amounts (in cents)
    const originalAmount = Math.round(order.totalAmount * 100);

    console.log(`💰 Financial breakdown:`, {
      originalAmount: order.totalAmount,
      originalAmountCents: originalAmount,
      currency,
    });

    // Transfer payment to celebrity using improved helper function
    const transferResult = await transferBookingPayment({
      accountId: order.celebrity.stripeConnectAccountId,
      amount: originalAmount,
      currency: currency,
      orderId: order.id,
      orderNumber: orderNumber,
      celebrityName: order.celebrity.user.name || "",
      platformFeePercentage: 20,
    });

    console.log(`💰 Transfer result:`, {
      transferId: transferResult.transferId,
      celebrityAmount: transferResult.celebrityAmount,
      platformFee: transferResult.platformFee,
      status: transferResult.status,
      isSimulated: transferResult.isSimulated,
    });

    // Determine status and completion time based on transfer result
    const transferStatus = transferResult.status;
    const transferredAt = transferResult.status === "PAID" ? new Date() : null;

    // Create transfer object for compatibility
    const transfer = {
      id: transferResult.transferId,
      amount: transferResult.celebrityAmount,
      currency: currency,
      destination: order.celebrity.stripeConnectAccountId,
      description: `Payment for order ${orderNumber} - ${order.celebrity.user.name}`,
    };

    // Update order status and store the transfer ID
    // Status is COMPLETED and transfer is initiated
    console.log(`🔄 Updating order status...`);
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "COMPLETED",
        approvalStatus: "APPROVED",
        approvedAt: new Date(),
        platformFee: transferResult.platformFee / 100,
        celebrityAmount: transferResult.celebrityAmount / 100,
        transferStatus: transferStatus,
        transferredAt: transferredAt,
      },
    });
    console.log(`✅ Order updated: ${updatedOrder.id}`);

    // Create payout record with transfer ID
    console.log(`🔄 Creating payout record...`);
    await prisma.payout.create({
      data: {
        celebrityId: order.celebrityId,
        orderId: order.id,
        amount: transferResult.celebrityAmount / 100,
        platformFee: transferResult.platformFee / 100,
        currency: currency,
        stripeTransferId: transfer.id,
        status: transferStatus,
        paidAt: transferStatus === "PAID" ? new Date() : null,
      },
    });
    console.log(`✅ Payout record created`);

    // Create transfer record in database
    console.log(`🔄 Creating transfer record...`);
    await prisma.transfer.create({
      data: {
        stripeTransferId: transfer.id,
        celebrityId: order.celebrityId,
        orderId: order.id,
        amount: transferResult.celebrityAmount / 100,
        currency: currency,
        type: "BOOKING_PAYMENT",
        status: transferStatus,
        description: `Payment for order ${orderNumber} - ${order.celebrity.user.name}`,
        initiatedAt: new Date(),
        completedAt: transferStatus === "PAID" ? new Date() : null,
      },
    });
    console.log(`✅ Transfer record created`);

    // Send notification email
    console.log(`🔄 Sending notification email...`);
    try {
      const emailResponse = await fetch(
        `${process.env.NEXTAUTH_URL}/api/send-approval-emails`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "video_approved",
            orderNumber,
            celebrityEmail: order.celebrity.user.email,
            celebrityName: order.celebrity.user.name,
            customerName: order.user.name,
            amount: transferResult.celebrityAmount / 100,
            tipAmount: 0,
            hasReview: false,
          }),
        }
      );

      if (!emailResponse.ok) {
        console.error(
          "Failed to send approval email:",
          await emailResponse.text()
        );
      } else {
        console.log(`✅ Notification email sent`);
      }
    } catch (emailError) {
      console.error("Error sending approval email:", emailError);
    }

    console.log(`🎉 Approval completed successfully for order ${orderNumber}`);

    // Prepare response message based on transfer status
    let responseMessage = "Video approved successfully";
    let additionalInfo: any = {};

    if (transferStatus === "PAID") {
      responseMessage = "Video approved and payment transferred successfully";
    } else if (transferStatus === "PENDING" && transferResult.isSimulated) {
      responseMessage =
        "Video approved successfully (payment transfer simulated in test mode)";
      additionalInfo = {
        testModeNote:
          "In test environment with insufficient funds. In production, the transfer would be processed normally.",
        instructions:
          "To test actual transfers, add funds to your Stripe test account using the 4000000000000077 test card.",
      };
    }

    return NextResponse.json({
      success: true,
      message: responseMessage,
      data: {
        orderNumber,
        status: "COMPLETED",
        approvalStatus: "APPROVED",
        transferId: transfer.id,
        transferStatus: transferStatus,
        celebrityEarnings: transferResult.celebrityAmount / 100,
        platformFee: transferResult.platformFee / 100,
        isSimulated: transferResult.isSimulated,
        ...additionalInfo,
      },
    });
  } catch (error: any) {
    console.error("❌ Approval processing error:", error);

    // Log more detailed error information
    if (error instanceof Stripe.errors.StripeError) {
      console.error("❌ Stripe error details:", {
        type: error.type,
        code: error.code,
        message: error.message,
        decline_code: (error as any).decline_code,
        param: (error as any).param,
      });

      // Provide user-friendly error messages for common Stripe errors
      if (error.code === "balance_insufficient") {
        return NextResponse.json(
          {
            error: "Insufficient funds for transfer",
            details:
              "The platform account doesn't have sufficient funds to process the transfer. In test mode, you can add funds using the 4000000000000077 test card.",
            stripeError: {
              code: error.code,
              type: error.type,
              message: error.message,
            },
          },
          { status: 400 }
        );
      } else if (error.code === "account_invalid") {
        return NextResponse.json(
          {
            error: "Invalid celebrity payment account",
            details:
              "The celebrity's Stripe Connect account is invalid or not properly set up.",
            stripeError: {
              code: error.code,
              type: error.type,
              message: error.message,
            },
          },
          { status: 400 }
        );
      } else if (error.code === "transfers_not_allowed") {
        return NextResponse.json(
          {
            error: "Transfers not allowed",
            details:
              "The celebrity's account is not enabled for transfers. They may need to complete their account setup.",
            stripeError: {
              code: error.code,
              type: error.type,
              message: error.message,
            },
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to process approval",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

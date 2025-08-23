// Manual Transfer Script for Sarah's Pending Payment
// Run this script to transfer money that's already been processed but not transferred

import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil'
})

async function manualTransferForSarah() {
  try {
    console.log('🔍 Looking for Sarah\'s pending payments...')
    
    // Find Sarah's celebrity record
    const sarah = await prisma.celebrity.findFirst({
      where: {
        user: {
          name: {
            contains: 'Sarah',
            mode: 'insensitive'
          }
        }
      },
      include: {
        user: true
      }
    })

    if (!sarah) {
      console.log('❌ Sarah not found in database')
      return
    }

    console.log(`✅ Found Sarah: ${sarah.user.name} (ID: ${sarah.id})`)
    console.log(`   Stripe Connect Account: ${sarah.stripeConnectAccountId}`)
    console.log(`   Account Status: ${sarah.stripeAccountStatus}`)
    console.log(`   Payouts Enabled: ${sarah.stripePayoutsEnabled}`)

    if (!sarah.stripeConnectAccountId) {
      console.log('❌ Sarah doesn\'t have a Stripe Connect account set up')
      return
    }

    // Find all completed orders for Sarah that haven't been transferred
    const pendingOrders = await prisma.order.findMany({
      where: {
        celebrityId: sarah.id,
        status: 'COMPLETED',
        transferStatus: 'PENDING',
        paymentStatus: 'SUCCEEDED'
      },
      include: {
        user: true
      }
    })

    console.log(`📋 Found ${pendingOrders.length} pending transfers for Sarah`)

    if (pendingOrders.length === 0) {
      console.log('✅ No pending transfers found for Sarah')
      return
    }

    // Process each pending order
    for (const order of pendingOrders) {
      console.log(`\n🔄 Processing order: ${order.orderNumber}`)
      console.log(`   Amount: $${order.totalAmount} ${order.currency}`)
      console.log(`   Customer: ${order.user.name}`)
      console.log(`   Status: ${order.status}`)
      console.log(`   Transfer Status: ${order.transferStatus}`)

      try {
        // Calculate platform fee (20%) and celebrity amount
        const totalAmountCents = Math.round(order.totalAmount * 100)
        const platformFeeCents = Math.round(totalAmountCents * 0.2)
        const celebrityAmountCents = totalAmountCents - platformFeeCents

        console.log(`💰 Payment Split:`)
        console.log(`   Total: $${order.totalAmount} (${totalAmountCents} cents)`)
        console.log(`   Platform Fee (20%): $${platformFeeCents / 100}`)
        console.log(`   Sarah gets: $${celebrityAmountCents / 100}`)

        // Create Stripe transfer
        console.log('🔄 Creating Stripe transfer...')
        const transfer = await stripe.transfers.create({
          amount: celebrityAmountCents,
          currency: order.currency || 'nzd',
          destination: sarah.stripeConnectAccountId,
          description: `Manual transfer for completed order ${order.orderNumber} - ${sarah.user.name}`,
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            celebrityId: sarah.id,
            transferType: 'manual_completed_order',
            originalAmount: order.totalAmount.toString(),
            platformFee: (platformFeeCents / 100).toString(),
            celebrityAmount: (celebrityAmountCents / 100).toString(),
            trigger: 'manual_script',
          },
        })

        console.log(`✅ Stripe transfer created: ${transfer.id}`)

        // Update order transfer status
        await prisma.order.update({
          where: { id: order.id },
          data: {
            transferStatus: 'IN_TRANSIT',
            transferredAt: new Date(),
            platformFee: platformFeeCents / 100,
            celebrityAmount: celebrityAmountCents / 100,
          },
        })

        // Create payout record
        await prisma.payout.create({
          data: {
            celebrityId: sarah.id,
            orderId: order.id,
            amount: celebrityAmountCents / 100,
            platformFee: platformFeeCents / 100,
            currency: order.currency || 'nzd',
            stripeTransferId: transfer.id,
            status: 'IN_TRANSIT',
          },
        })

        // Create transfer record
        await prisma.transfer.create({
          data: {
            stripeTransferId: transfer.id,
            celebrityId: sarah.id,
            orderId: order.id,
            amount: celebrityAmountCents / 100,
            currency: order.currency || 'nzd',
            type: 'BOOKING_PAYMENT',
            status: 'IN_TRANSIT',
            description: `Manual transfer for completed order ${order.orderNumber}`,
          },
        })

        console.log(`✅ Order ${order.orderNumber} transfer initiated successfully!`)
        console.log(`   Sarah will receive: $${celebrityAmountCents / 100} ${order.currency}`)

      } catch (error) {
        console.error(`❌ Failed to process order ${order.orderNumber}:`, error.message)
        
        // Update order to show transfer failed
        await prisma.order.update({
          where: { id: order.id },
          data: {
            transferStatus: 'FAILED',
          },
        })
      }
    }

    console.log('\n🎉 Manual transfer process completed!')
    console.log('📊 Check Sarah\'s Stripe dashboard to see the incoming transfers')
    console.log('📋 Monitor webhook events for transfer completion')

  } catch (error) {
    console.error('❌ Script failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
manualTransferForSarah()
  .then(() => {
    console.log('✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script error:', error)
    process.exit(1)
  })

// Check Sarah's Payment Status Script
// Run this to see what's happening with Sarah's payments

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSarahStatus() {
  try {
    console.log('🔍 Checking Sarah\'s payment status...')
    
    // Find Sarah
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
        user: true,
        orders: {
          include: {
            payouts: true,
            transfers: true,
            tips: true
          }
        }
      }
    })

    if (!sarah) {
      console.log('❌ Sarah not found')
      return
    }

    console.log(`\n👤 Celebrity: ${sarah.user.name}`)
    console.log(`   Email: ${sarah.user.email}`)
    console.log(`   ID: ${sarah.id}`)
    console.log(`   Stripe Connect Account: ${sarah.stripeConnectAccountId || 'NOT SET UP'}`)
    console.log(`   Account Status: ${sarah.stripeAccountStatus}`)
    console.log(`   Payouts Enabled: ${sarah.stripePayoutsEnabled}`)
    console.log(`   Total Earnings: $${sarah.totalEarnings || 0}`)
    console.log(`   Pending Earnings: $${sarah.pendingEarnings || 0}`)

    if (!sarah.stripeConnectAccountId) {
      console.log('\n❌ PROBLEM: Sarah doesn\'t have a Stripe Connect account!')
      console.log('   She needs to complete the Stripe Connect onboarding first.')
      return
    }

    // Check orders
    console.log(`\n📋 Orders (${sarah.orders.length} total):`)
    
    const completedOrders = sarah.orders.filter(o => o.status === 'COMPLETED')
    const pendingTransfers = sarah.orders.filter(o => o.transferStatus === 'PENDING')
    const inTransitTransfers = sarah.orders.filter(o => o.transferStatus === 'IN_TRANSIT')
    const paidTransfers = sarah.orders.filter(o => o.transferStatus === 'PAID')

    console.log(`   Completed: ${completedOrders.length}`)
    console.log(`   Pending Transfer: ${pendingTransfers.length}`)
    console.log(`   In Transit: ${inTransitTransfers.length}`)
    console.log(`   Paid: ${paidTransfers.length}`)

    if (pendingTransfers.length > 0) {
      console.log('\n💰 PENDING TRANSFERS (Money stuck in platform):')
      pendingTransfers.forEach(order => {
        console.log(`   Order: ${order.orderNumber}`)
        console.log(`   Amount: $${order.totalAmount} ${order.currency}`)
        console.log(`   Status: ${order.status}`)
        console.log(`   Transfer Status: ${order.transferStatus}`)
        console.log(`   Payment Status: ${order.paymentStatus}`)
        console.log(`   Created: ${order.createdAt.toDateString()}`)
        console.log('')
      })
    }

    if (inTransitTransfers.length > 0) {
      console.log('\n🔄 TRANSFERS IN TRANSIT:')
      inTransitTransfers.forEach(order => {
        console.log(`   Order: ${order.orderNumber}`)
        console.log(`   Amount: $${order.totalAmount} ${order.currency}`)
        console.log(`   Transfer Status: ${order.transferStatus}`)
        console.log(`   Transferred At: ${order.transferredAt?.toDateString() || 'Unknown'}`)
        console.log('')
      })
    }

    // Check payouts
    const allPayouts = sarah.orders.flatMap(o => o.payouts)
    console.log(`\n💸 Payouts (${allPayouts.length} total):`)
    
    const pendingPayouts = allPayouts.filter(p => p.status === 'PENDING')
    const inTransitPayouts = allPayouts.filter(p => p.status === 'IN_TRANSIT')
    const paidPayouts = allPayouts.filter(p => p.status === 'PAID')

    console.log(`   Pending: ${pendingPayouts.length}`)
    console.log(`   In Transit: ${inTransitPayouts.length}`)
    console.log(`   Paid: ${paidPayouts.length}`)

    // Summary
    console.log('\n📊 SUMMARY:')
    if (pendingTransfers.length > 0) {
      const totalPending = pendingTransfers.reduce((sum, o) => sum + o.totalAmount, 0)
      console.log(`❌ ${pendingTransfers.length} orders with $${totalPending} stuck in platform`)
      console.log('   Run the manual transfer script to fix this!')
    } else {
      console.log('✅ No pending transfers found')
    }

    if (inTransitTransfers.length > 0) {
      console.log(`🔄 ${inTransitTransfers.length} transfers in transit`)
      console.log('   These should complete automatically via webhooks')
    }

    if (paidTransfers.length > 0) {
      const totalPaid = paidTransfers.reduce((sum, o) => sum + o.totalAmount, 0)
      console.log(`✅ ${paidTransfers.length} orders with $${totalPaid} successfully transferred`)
    }

  } catch (error) {
    console.error('❌ Error checking Sarah\'s status:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSarahStatus()
  .then(() => {
    console.log('\n✅ Status check completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Status check failed:', error)
    process.exit(1)
  })

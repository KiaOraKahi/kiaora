import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPlatformFeesData() {
  try {
    console.log('🔍 Checking platform fees data...')
    
    // Check financial settings
    const financialSettings = await prisma.financialSettings.findFirst()
    console.log('📊 Financial Settings:', financialSettings)
    
    // Check platform fee transfers
    const transfers = await prisma.platformFeeTransfer.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
    console.log('💸 Platform Fee Transfers:', transfers.length, 'found')
    
    // Check orders with platform fees
    const ordersWithFees = await prisma.order.findMany({
      where: {
        paymentStatus: "SUCCEEDED",
        platformFee: {
          gt: 0
        }
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        platformFee: true,
        platformFeeTransferred: true,
        paymentStatus: true,
        createdAt: true
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('📦 Orders with Platform Fees:', ordersWithFees.length, 'found')
    if (ordersWithFees.length > 0) {
      console.log('📋 Sample orders:', ordersWithFees)
    }
    
    // Calculate totals
    const totalPlatformFees = await prisma.order.aggregate({
      _sum: { platformFee: true },
      where: {
        paymentStatus: "SUCCEEDED",
      },
    })
    
    const pendingPlatformFees = await prisma.order.aggregate({
      _sum: { platformFee: true },
      where: {
        paymentStatus: "SUCCEEDED",
        platformFeeTransferred: false,
      },
    })
    
    console.log('💰 Total Platform Fees:', totalPlatformFees._sum.platformFee || 0)
    console.log('⏳ Pending Platform Fees:', pendingPlatformFees._sum.platformFee || 0)
    
  } catch (error) {
    console.error('❌ Error checking platform fees data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPlatformFeesData()

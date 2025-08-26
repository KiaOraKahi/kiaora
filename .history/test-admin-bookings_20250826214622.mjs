import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"
    }
  }
})

async function testAdminBookings() {
  try {
    console.log('🧪 Testing admin bookings functionality...')
    
    // Test the exact query that was failing
    console.log('📊 Testing admin bookings query...')
    const adminBookings = await prisma.order.findMany({
      take: 1,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        celebrity: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        booking: {
          select: {
            id: true,
            status: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    })
    
    console.log('✅ Admin bookings query successful!')
    console.log(`📋 Found ${adminBookings.length} bookings`)
    
    if (adminBookings.length > 0) {
      console.log('📋 Sample booking:', {
        id: adminBookings[0].id,
        orderNumber: adminBookings[0].orderNumber,
        customerName: adminBookings[0].user?.name,
        celebrityName: adminBookings[0].celebrity?.user?.name,
        status: adminBookings[0].status,
        paymentStatus: adminBookings[0].paymentStatus
      })
    }
    
    // Test platform fees functionality
    console.log('\n📊 Testing platform fees functionality...')
    const financialSettings = await prisma.financialSettings.findFirst()
    console.log('✅ FinancialSettings query successful')
    console.log('📋 Settings:', {
      id: financialSettings?.id,
      platformFee: financialSettings?.platformFee,
      adminStripeAccountId: financialSettings?.adminStripeAccountId,
      adminStripeAccountStatus: financialSettings?.adminStripeAccountStatus
    })
    
    console.log('\n🎉 All tests passed!')
    console.log('📝 The admin bookings and platform fees functionality should now work correctly.')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminBookings()

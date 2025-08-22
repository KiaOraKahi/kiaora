import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PRISMA_DATABASE_URL || "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19XNjN0WUZkZ2tPb0ljeTFveVhRaVMiLCJhcGlfa2V5IjoiMDFLMzhaOFc2VEJKQVRBWVM1M0VTNFFUMjciLCJ0ZW5hbnRfaWQiOiI5N2UxMGE4MDRiMzcxNDEzYjJhZGZhZjdhYzViMzFkMjhmY2FjYjAzZWZkNWMyOTNhYWZiYmY4NzBhYmNlN2FhIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjI3ZTQyNmItZjY2NS00ZDI1LWE4OGEtM2E1NTgwMmIyODVmIn0.F7jaLciHEiq3GPE1CANg51wLP6FdxMQCYiCTHSQwdcY"
    }
  }
})

async function testVideoUploadAPI() {
  try {
    console.log("🔍 Testing Video Upload API Configuration...")
    
    // 1. Check if BLOB_READ_WRITE_TOKEN is available
    console.log("📋 Environment Variables:")
    console.log("   - BLOB_READ_WRITE_TOKEN:", process.env.BLOB_READ_WRITE_TOKEN ? "✅ SET" : "❌ NOT SET")
    console.log("   - NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "❌ NOT SET")
    console.log("   - NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "✅ SET" : "❌ NOT SET")
    
    // 2. Check database connection
    console.log("\n🗄️ Database Connection Test:")
    try {
      await prisma.$connect()
      console.log("   ✅ Database connected successfully")
    } catch (dbError) {
      console.log("   ❌ Database connection failed:", dbError.message)
      return
    }
    
    // 3. Check if Sarah celebrity exists
    console.log("\n👤 Checking Sarah Celebrity Profile:")
    const sarahCelebrity = await prisma.celebrity.findFirst({
      where: {
        user: {
          name: {
            contains: "Sarah"
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    if (sarahCelebrity) {
      console.log("   ✅ Sarah Celebrity found:")
      console.log("      - ID:", sarahCelebrity.id)
      console.log("      - Name:", sarahCelebrity.user.name)
      console.log("      - Email:", sarahCelebrity.user.email)
    } else {
      console.log("   ❌ Sarah Celebrity not found")
    }
    
    // 4. Check for confirmed bookings
    console.log("\n📋 Checking Confirmed Bookings:")
    const confirmedBookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED"
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        celebrity: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            paymentStatus: true,
            totalAmount: true
          }
        }
      }
    })
    
    if (confirmedBookings.length > 0) {
      console.log(`   ✅ Found ${confirmedBookings.length} confirmed bookings:`)
      confirmedBookings.forEach((booking, index) => {
        console.log(`      ${index + 1}. Order: ${booking.order?.orderNumber}`)
        console.log(`         - Customer: ${booking.user?.name}`)
        console.log(`         - Celebrity: ${booking.celebrity?.user?.name}`)
        console.log(`         - Payment: ${booking.order?.paymentStatus}`)
        console.log(`         - Amount: $${booking.order?.totalAmount}`)
      })
    } else {
      console.log("   ❌ No confirmed bookings found")
    }
    
    // 5. Test Vercel Blob connection
    console.log("\n☁️ Testing Vercel Blob Connection:")
    try {
      const { put } = await import('@vercel/blob')
      console.log("   ✅ @vercel/blob imported successfully")
      
      // Create a test file
      const testContent = "This is a test file for blob upload"
      const testFile = new Blob([testContent], { type: 'text/plain' })
      
      console.log("   📤 Attempting test upload...")
      const testBlob = await put('test-upload.txt', testFile, {
        access: 'public',
      })
      
      console.log("   ✅ Test upload successful!")
      console.log("      - URL:", testBlob.url)
      console.log("      - Pathname:", testBlob.pathname)
      
    } catch (blobError) {
      console.log("   ❌ Vercel Blob test failed:", blobError.message)
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

testVideoUploadAPI()

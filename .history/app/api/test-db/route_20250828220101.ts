import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    console.log("🔍 Testing database connection...")
    
    // Check the celebrity_applications table structure
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'celebrity_applications' 
      ORDER BY ordinal_position;
    `
    
    const hasAchievements = columns.some((col: any) => col.column_name === 'achievements')
    const hasProfession = columns.some((col: any) => col.column_name === 'profession')
    
    // Try to create a test application to see if it works
    let testResult = "Not tested"
    try {
      const testApp = await prisma.celebrityApplication.create({
        data: {
          fullName: "Test User",
          email: `test-${Date.now()}@example.com`,
          phone: "1234567890",
          dateOfBirth: "1990-01-01",
          nationality: "Test",
          profession: "Test",
          category: "Test",
          experience: "This is a test application with more than 50 characters to meet the minimum requirement.",
          achievements: "Test achievements",
          instagramHandle: null,
          twitterHandle: null,
          tiktokHandle: null,
          youtubeHandle: null,
          otherSocialMedia: null,
          followerCount: "0",
          basePrice: 299.0,
          rushPrice: 399.0,
          languages: ["English"],
          availability: "24 hours",
          specialRequests: null,
          motivation: "Test motivation",
          hasProfilePhoto: false,
          hasIdDocument: false,
          profilePhotoUrl: null,
          idDocumentUrl: null,
          status: "PENDING",
        },
      })
      
      // Delete the test application
      await prisma.celebrityApplication.delete({
        where: { id: testApp.id }
      })
      
      testResult = "✅ SUCCESS - Test application created and deleted successfully"
    } catch (error: any) {
      testResult = `❌ FAILED - ${error.message}`
    }
    
    return NextResponse.json({
      success: true,
      databaseInfo: {
        totalColumns: columns.length,
        hasAchievements,
        hasProfession,
        columns: columns.map((col: any) => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable
        })),
        testResult
      }
    })
    
  } catch (error: any) {
    console.error("❌ Database test error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check all possible database URL environment variables
    const envVars = {
      'DATABASE_URL': process.env.DATABASE_URL,
      'DATABASE_URL_POSTGRES_URL': process.env.DATABASE_URL_POSTGRES_URL,
      'DATABASE_URL_PRISMA_DATABASE_URL': process.env.DATABASE_URL_PRISMA_DATABASE_URL,
      'DATABASE_URL_DATABASE_URL': process.env.DATABASE_URL_DATABASE_URL
    };

    // Mask sensitive parts of the URLs for security
    const maskedEnvVars = {};
    Object.entries(envVars).forEach(([key, value]) => {
      if (value) {
        // Mask the password part of the URL
        const maskedValue = value.replace(/:([^:@]+)@/, ':****@');
        maskedEnvVars[key] = maskedValue;
      } else {
        maskedEnvVars[key] = null;
      }
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrls: maskedEnvVars,
      message: "Check the database URLs above to see which one Vercel is using"
    })

  } catch (error: any) {
    console.error("❌ Error checking Vercel environment:", error)
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 })
  }
}

import { NextResponse } from "next/server"

export async function GET() {
  try {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    const nextAuthUrl = process.env.NEXTAUTH_URL
    const nodeEnv = process.env.NODE_ENV

    return NextResponse.json({
      blobConfigured: !!blobToken,
      blobTokenLength: blobToken ? blobToken.length : 0,
      nextAuthUrl,
      nodeEnv,
      message: blobToken 
        ? "Vercel Blob is configured correctly" 
        : "Vercel Blob is NOT configured - BLOB_READ_WRITE_TOKEN is missing",
      instructions: blobToken 
        ? "File uploads should work correctly"
        : "To fix file uploads: 1. Go to Vercel dashboard 2. Create a Blob store 3. Copy the token 4. Add BLOB_READ_WRITE_TOKEN to environment variables"
    })
  } catch (error) {
    return NextResponse.json({
      error: "Failed to check configuration",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

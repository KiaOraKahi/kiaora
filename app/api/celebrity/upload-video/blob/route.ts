import { NextRequest } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Validate file size (100MB limit)
        const maxSize = 100 * 1024 * 1024; // 100MB in bytes
        
        // Extract booking ID from pathname for validation
        const pathParts = pathname.split('/');
        const bookingId = pathParts[1]; // celebrity-videos/{bookingId}/{filename}
        
        if (!bookingId) {
          throw new Error("Invalid upload path");
        }

        return {
          allowedContentTypes: [
            // Canonical MIME types for common containers
            "video/mp4",        // .mp4
            "video/quicktime",  // .mov
            "video/x-msvideo",  // .avi
            "video/x-m4v",      // .m4v
            "video/x-ms-wmv",   // .wmv
            "video/webm",       // .webm
            "video/x-flv",      // .flv
          ],
          maximumSizeInBytes: maxSize,
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            bookingId,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("✅ Blob upload completed:", blob.url);
        
        // Optional: You can add additional processing here
        // The main processing will happen in the main upload-video endpoint
      },
    });

    return Response.json(jsonResponse);
  } catch (error) {
    console.error("Blob upload error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 }
    );
  }
}
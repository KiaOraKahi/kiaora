import { put } from '@vercel/blob'

export interface UploadResult {
  url: string
  pathname: string
  size: number
  uploadedAt: string
}

export async function uploadFileDirectly(file: File, type: string): Promise<UploadResult> {
  try {
    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not set. Please configure Vercel Blob storage.')
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `celebrity-applications/${type}-${timestamp}-${sanitizedFileName}`

    // Upload directly to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return {
      url: blob.url,
      pathname: blob.pathname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Upload error:', error)
    if (error instanceof Error) {
      if (error.message.includes('BLOB_READ_WRITE_TOKEN')) {
        throw new Error('File upload is not configured. Please contact support.')
      }
    }
    throw new Error('Failed to upload file')
  }
}

// Alternative: Upload through API route for smaller files
export async function uploadFileViaAPI(file: File, type: string): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Upload failed')
  }

  return await response.json()
}

// Smart upload function that chooses the best method
export async function uploadFile(file: File, type: string): Promise<UploadResult> {
  const fileSizeMB = file.size / (1024 * 1024)
  
  // Use direct upload for files larger than 4MB (Vercel's limit is 4.5MB)
  if (fileSizeMB > 4) {
    console.log(`📁 Large file detected (${fileSizeMB.toFixed(2)}MB), using direct upload`)
    return uploadFileDirectly(file, type)
  } else {
    console.log(`📁 Small file detected (${fileSizeMB.toFixed(2)}MB), using API route`)
    return uploadFileViaAPI(file, type)
  }
}

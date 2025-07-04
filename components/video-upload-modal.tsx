"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Upload, CheckCircle, AlertCircle, Loader2, Play } from "lucide-react"
import { toast } from "sonner"

interface VideoUploadModalProps {
  bookingId: string
  orderNumber: string
  customerName: string
  onUploadSuccess?: () => void
  children: React.ReactNode
}

export function VideoUploadModal({
  bookingId,
  orderNumber,
  customerName,
  onUploadSuccess,
  children,
}: VideoUploadModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError("File size too large. Maximum 50MB allowed.")
      return
    }

    // Validate file type
    const allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/quicktime", "video/webm"]
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only MP4, MOV, AVI, QuickTime, and WebM videos are allowed.")
      return
    }

    setSelectedFile(file)
    setError(null)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setUploading(true)
      setUploadProgress(0)
      setError(null)

      const formData = new FormData()
      formData.append("video", selectedFile)
      formData.append("bookingId", bookingId)

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch("/api/celebrity/upload-video", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const result = await response.json()
      console.log("✅ Video upload successful:", result)

      setUploadSuccess(true)
      toast.success("Video Uploaded Successfully!", {
        description: `Your video for order ${orderNumber} has been delivered to ${customerName}.`,
        })

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess()
      }

      // Close modal after a short delay
      setTimeout(() => {
        setIsOpen(false)
        resetModal()
      }, 2000)
    } catch (error) {
      console.error("❌ Video upload failed:", error)
      setError(error instanceof Error ? error.message : "Upload failed")
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const resetModal = () => {
    setSelectedFile(null)
    setUploading(false)
    setUploadProgress(0)
    setUploadSuccess(false)
    setError(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Order Details</h4>
            <p className="text-purple-200 text-sm">
              <strong>Order:</strong> {orderNumber}
            </p>
            <p className="text-purple-200 text-sm">
              <strong>Customer:</strong> {customerName}
            </p>
          </div>

          {!uploadSuccess ? (
            <>
              {/* File Upload */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="video-upload" className="text-purple-200">
                    Select Video File
                  </Label>
                  <Input
                    id="video-upload"
                    type="file"
                    accept="video/mp4,video/mov,video/avi,video/quicktime,video/webm"
                    onChange={handleFileSelect}
                    className="bg-white/10 border-white/20 text-white file:bg-purple-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1"
                    disabled={uploading}
                  />
                  <p className="text-xs text-purple-400 mt-1">
                    Supported formats: MP4, MOV, AVI, QuickTime, WebM (Max: 50MB)
                  </p>
                </div>

                {selectedFile && (
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <Play className="w-8 h-8 text-purple-400" />
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{selectedFile.name}</p>
                        <p className="text-purple-300 text-xs">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200 text-sm">Uploading...</span>
                      <span className="text-purple-200 text-sm">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="bg-white/20" />
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-300 text-sm">{error}</span>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Video
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={uploading}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Video Uploaded Successfully!</h3>
              <p className="text-purple-200">
                Your video has been delivered to {customerName}. They will receive an email notification.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
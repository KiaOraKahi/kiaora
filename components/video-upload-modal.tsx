"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, Video, CheckCircle, Loader2, X, Clock } from "lucide-react"
import { toast } from "sonner"

interface VideoUploadModalProps {
  bookingId: string
  orderNumber: string
  customerName: string
  children: React.ReactNode
  onUploadSuccess?: () => void
}

export function VideoUploadModal({
  bookingId,
  orderNumber,
  customerName,
  children,
  onUploadSuccess,
}: VideoUploadModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [notes, setNotes] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
  const ALLOWED_TYPES = ["video/mp4", "video/mov", "video/avi", "video/quicktime", "video/webm"]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please select a video file (MP4, MOV, AVI, QuickTime, or WebM).")
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Please select a video file smaller than 50MB.")
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a video file to upload.")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("video", selectedFile)
      formData.append("bookingId", bookingId)
      formData.append("notes", notes.trim())

      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      })

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          setUploadComplete(true)
          toast.success("The customer will be notified to review your video message.")

          // Call success callback
          if (onUploadSuccess) {
            onUploadSuccess()
          }

          // Reset form after a delay
          setTimeout(() => {
            handleClose()
          }, 2000)
        } else {
          const errorResponse = JSON.parse(xhr.responseText)
          throw new Error(errorResponse.error || "Upload failed")
        }
      })

      // Handle errors
      xhr.addEventListener("error", () => {
        throw new Error("Network error during upload")
      })

      xhr.open("POST", "/api/celebrity/upload-video")
      xhr.send(formData)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload video. Please try again.")
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleClose = () => {
    if (isUploading) return // Prevent closing during upload

    setIsOpen(false)
    setSelectedFile(null)
    setUploadProgress(0)
    setIsUploading(false)
    setUploadComplete(false)
    setNotes("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
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
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="sm:max-w-lg bg-white/95 backdrop-blur-lg border-white/20"
        onPointerDownOutside={(e) => {
          if (isUploading) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="w-6 h-6 text-purple-600" />
            Upload Video Message
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Upload the video message for order #{orderNumber} - {customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!uploadComplete ? (
            <>
              {/* File Upload Area */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">Video File</Label>

                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-colors"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-2">Click to select video file</p>
                    <p className="text-sm text-gray-500">Supports MP4, MOV, AVI, QuickTime, WebM (max 50MB)</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Video className="w-8 h-8 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      </div>
                      {!isUploading && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFile(null)
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ""
                            }
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about the video message..."
                  className="bg-white/50 border-gray-300 focus:border-purple-500 resize-none"
                  rows={3}
                  maxLength={200}
                  disabled={isUploading}
                />
                <p className="text-xs text-gray-500 text-right">{notes.length}/200 characters</p>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Uploading...</span>
                    <span className="text-sm text-gray-500">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-gray-500 text-center">Please don't close this window while uploading</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 bg-transparent"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isUploading ? (
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
              </div>
            </>
          ) : (
            /* Success State - Updated for Approval Workflow */
            <div className="text-center py-8">
              <div className="relative mb-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <Clock className="w-6 h-6 text-orange-500 absolute -bottom-1 -right-1 bg-white rounded-full p-1" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Video Uploaded Successfully!</h3>
              <div className="space-y-3 text-gray-600">
                <p className="font-medium">📧 Customer has been notified to review your video</p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-orange-700 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Pending Customer Approval</span>
                  </div>
                  <p className="text-sm text-orange-600">
                    Your payment will be released once {customerName} approves the video. If they request changes,
                    you'll be notified to upload a revision.
                  </p>
                </div>
                <p className="text-sm text-gray-500">This window will close automatically...</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
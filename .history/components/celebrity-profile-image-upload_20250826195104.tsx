"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2, X } from "lucide-react"
import { toast } from "sonner"

interface CelebrityProfileImageUploadProps {
  currentImage: string
  onImageUpdate: (imageUrl: string) => void
  disabled?: boolean
}

export function CelebrityProfileImageUpload({ 
  currentImage, 
  onImageUpdate, 
  disabled = false 
}: CelebrityProfileImageUploadProps) {
  const { data: session } = useSession()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if user has CELEBRITY role
  const canUploadImage = session?.user?.role === "CELEBRITY"

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleUpload = async (file: File) => {
    if (!canUploadImage) {
      toast.error("Only users with CELEBRITY role can upload profile images")
      return
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, or WebP)")
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large. Maximum 5MB allowed.")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/celebrity/profile-image", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        onImageUpdate(result.url)
        toast.success("Profile image updated successfully!")
        // Refresh the session to update the user image in the navbar
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        toast.error(result.error || "Failed to upload image")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = () => {
    onImageUpdate("")
    toast.success("Profile image removed")
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  if (!canUploadImage) {
    return (
      <div className="space-y-2">
        <Button 
          variant="outline" 
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 cursor-not-allowed opacity-50"
          disabled
        >
          <Camera className="w-4 h-4 mr-2" />
          Change Photo (CELEBRITY only)
        </Button>
        <p className="text-xs text-red-400">
          Only users with CELEBRITY role can upload profile images
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Current Image Display */}
      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={currentImage} alt="Profile" />
          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
            {session?.user?.name?.charAt(0) || "C"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col gap-2">
          <Button
            onClick={triggerFileInput}
            disabled={disabled || isUploading}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Change Photo
              </>
            )}
          </Button>
          
          {currentImage && (
            <Button
              onClick={handleRemoveImage}
              disabled={disabled || isUploading}
              variant="outline"
              size="sm"
              className="bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
            >
              <X className="w-4 h-4 mr-2" />
              Remove Photo
            </Button>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Guidelines */}
      <div className="text-xs text-gray-400 space-y-1">
        <p>• Supported formats: JPEG, PNG, WebP</p>
        <p>• Maximum file size: 5MB</p>
        <p>• Recommended: Square image, 400x400 pixels or larger</p>
      </div>
    </div>
  )
}

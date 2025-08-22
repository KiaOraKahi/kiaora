"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Camera, Upload, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ProfileImageUploadProps {
  currentImage?: string
  onImageUpdate: (imageUrl: string) => void
  disabled?: boolean
}

export function ProfileImageUpload({ 
  currentImage, 
  onImageUpdate, 
  disabled = false 
}: ProfileImageUploadProps) {
  const { data: session } = useSession()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if user has FAN role
  const canUploadImage = session?.user?.role === "FAN"

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleUpload = async (file: File) => {
    if (!canUploadImage) {
      toast.error("Only users with FAN role can upload profile images")
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

      const response = await fetch("/api/user/profile-image", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        onImageUpdate(result.url)
        toast.success("Profile image updated successfully!")
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
          Change Photo (FAN only)
        </Button>
        <p className="text-xs text-red-400">
          Only users with FAN role can upload profile images
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
      
      <Button
        variant="outline"
        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        onClick={triggerFileInput}
        disabled={disabled || isUploading}
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
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={handleRemoveImage}
          disabled={disabled || isUploading}
        >
          <X className="w-4 h-4 mr-2" />
          Remove
        </Button>
      )}
    </div>
  )
}

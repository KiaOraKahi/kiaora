"use client"

import Image from "next/image"
import { useState } from "react"

interface CelebrityImageProps {
  src: string | null | undefined
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  sizes?: string
  priority?: boolean
}

export default function CelebrityImage({
  src,
  alt,
  width,
  height,
  className = "",
  fill = false,
  sizes,
  priority = false
}: CelebrityImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Determine fallback image based on dimensions
  const getFallbackImage = () => {
    if (width && height) {
      return `/placeholder.svg?height=${height}&width=${width}`
    }
    return "/placeholder.svg"
  }

  const handleError = () => {
    setImageError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  const imageSrc = imageError ? getFallbackImage() : (src || getFallbackImage())

  return (
    <div className="relative">
      {isLoading && !imageError && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
      
      {fill ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className={className}
          sizes={sizes}
          priority={priority}
          onError={handleError}
          onLoad={handleLoad}
        />
      ) : (
        <Image
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={className}
          sizes={sizes}
          priority={priority}
          onError={handleError}
          onLoad={handleLoad}
        />
      )}
    </div>
  )
}

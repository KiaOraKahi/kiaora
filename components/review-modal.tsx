"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Star, Loader2, Lock, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface ReviewModalProps {
  celebrityId: string
  celebrityName: string
  bookingId?: string
  orderNumber?: string
  children: React.ReactNode
  onReviewSubmitted?: () => void
}

interface OrderStatus {
  status: string
  approvalStatus: string
  videoUrl: string | null
}

export function ReviewModal({
  celebrityId,
  celebrityName,
  bookingId,
  orderNumber,
  children,
  onReviewSubmitted,
}: ReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [occasion, setOccasion] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)

  // Check order approval status when modal opens
  useEffect(() => {
    if (isOpen && orderNumber) {
      checkOrderStatus()
    }
  }, [isOpen, orderNumber])

  const checkOrderStatus = async () => {
    if (!orderNumber) return

    try {
      setStatusLoading(true)
      setStatusError(null)

      const response = await fetch(`/api/orders/${orderNumber}`)
      const data = await response.json()

      if (response.ok) {
        setOrderStatus({
          status: data.status,
          approvalStatus: data.approvalStatus,
          videoUrl: data.videoUrl,
        })
      } else {
        setStatusError("Failed to check order status")
      }
    } catch (error) {
      console.error("Error checking order status:", error)
      setStatusError("Failed to check order status")
    } finally {
      setStatusLoading(false)
    }
  }

  const isVideoApproved = () => {
    return orderStatus?.approvalStatus === "APPROVED"
  }

  const getStatusMessage = () => {
    if (!orderStatus) return "Checking status..."

    switch (orderStatus.approvalStatus) {
      case "PENDING_APPROVAL":
        return "Video is ready for your review. Please approve it first before leaving a review."
      case "DECLINED":
        return "Video revisions have been requested. Reviews can be left after approval."
      case "APPROVED":
        return "Video has been approved! You can now leave a review."
      default:
        return "Video is still being processed. Reviews will be available after approval."
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check approval status before submitting
    if (orderNumber && !isVideoApproved()) {
      toast.error("Review Not Available", {
        description: "You can only leave a review after approving the video.",
      })
      return
    }

    if (rating === 0) {
      toast.error("Rating Required!", {
        description: "Please select a star rating before submitting your review.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          celebrityId,
          bookingId,
          rating,
          comment: comment.trim() || null,
          occasion: occasion.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review")
      }

      toast.success("Review Submitted!", {
        description: "Thank you for your feedback. Your review has been posted.",
      })

      // Reset form
      setRating(0)
      setHoveredRating(0)
      setComment("")
      setOccasion("")
      setIsOpen(false)

      // Call callback if provided
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Error!", {
        description: error instanceof Error ? error.message : "Failed to submit review. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1 transition-transform hover:scale-110"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(star)}
            disabled={orderNumber && !isVideoApproved()}
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hoveredRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-300"
              } ${orderNumber && !isVideoApproved() ? "opacity-50" : ""}`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-lg border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Review {celebrityName}</DialogTitle>
          <DialogDescription className="text-gray-600">
            Share your experience and help others make informed decisions.
          </DialogDescription>
        </DialogHeader>

        {/* Status Loading */}
        {statusLoading && orderNumber && (
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
              <span className="text-gray-600">Checking order status...</span>
            </div>
          </div>
        )}

        {/* Status Error */}
        {statusError && orderNumber && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 font-medium">Status Check Failed</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{statusError}</p>
            <Button onClick={checkOrderStatus} variant="outline" size="sm" className="mt-2 bg-transparent">
              Try Again
            </Button>
          </div>
        )}

        {/* Approval Required State */}
        {orderNumber && orderStatus && !statusLoading && !isVideoApproved() && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-orange-500" />
              <span className="text-orange-700 font-medium">Video Approval Required</span>
            </div>
            <p className="text-orange-600 text-sm mb-3">{getStatusMessage()}</p>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-orange-600">Current Status: {orderStatus.approvalStatus.replace("_", " ")}</span>
            </div>
          </div>
        )}

        {/* Video Approved State */}
        {orderNumber && orderStatus && !statusLoading && isVideoApproved() && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700 font-medium">Video Approved!</span>
            </div>
            <p className="text-green-600 text-sm mt-1">You can now leave a review for this experience.</p>
          </div>
        )}

        {/* Review Form - Only show if approved or no order number */}
        {(!orderNumber || (orderStatus && isVideoApproved())) && !statusLoading && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Rating <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-col items-center gap-2">
                {renderStars()}
                <p className="text-sm text-gray-500">
                  {rating === 0 && "Click to rate"}
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              </div>
            </div>

            {/* Occasion */}
            <div className="space-y-2">
              <Label htmlFor="occasion" className="text-sm font-medium text-gray-700">
                Occasion (Optional)
              </Label>
              <Input
                id="occasion"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="e.g., Birthday, Anniversary, Business event..."
                className="bg-white/50 border-gray-300 focus:border-purple-500"
                maxLength={50}
              />
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment" className="text-sm font-medium text-gray-700">
                Your Review (Optional)
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell others about your experience..."
                className="bg-white/50 border-gray-300 focus:border-purple-500 min-h-[100px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 text-right">{comment.length}/500 characters</p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface VideoApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  order: {
    id: string
    orderNumber: string
    videoUrl: string
    celebrity: {
      name: string
      profileImage: string
    }
    amount: number
  }
  onApprove: () => Promise<void>
}

export default function VideoApprovalModal({ isOpen, onClose, order, onApprove }: VideoApprovalModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleApprove = async () => {
    setIsSubmitting(true)

    try {
      await onApprove()
      toast.success("Video approved successfully!")
      onClose()
    } catch (error) {
      console.error("Error approving video:", error)
      toast.error("Failed to approve video. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Your Video is Ready!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Celebrity Info */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <img
              src={order.celebrity.profileImage || "/placeholder.svg"}
              alt={order.celebrity.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold">{order.celebrity.name}</h3>
              <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
            </div>
          </div>

          {/* Video Player */}
          <div className="space-y-2">
            <Label>Your Personalized Video</Label>
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video src={order.videoUrl} controls className="w-full h-64 object-cover" preload="metadata">
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isSubmitting ? "Processing..." : "Approve Video"}
            </Button>
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting} size="lg">
              Close
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">By approving, payment will be released to the celebrity</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

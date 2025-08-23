"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, MessageSquare, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface VideoDeclineModalProps {
  isOpen: boolean
  onClose: () => void
  order: {
    id: string
    orderNumber: string
    videoUrl: string
    celebrity: {
      name: string
      profileImage: string
      category: string
    }
    customerName: string
    occasion: string
    instructions: string
    price: number
    createdAt: string
  }
  onSuccess?: () => void // Callback for successful decline
}

const DECLINE_REASONS = [
  { id: "quality", label: "Video quality issues" },
  { id: "instructions", label: "Instructions not followed" },
  { id: "audio", label: "Audio problems" },
  { id: "content", label: "Content not as expected" },
  { id: "length", label: "Video too short" },
  { id: "other", label: "Other (please specify)" },
]

export default function VideoDeclineModal({ isOpen, onClose, order, onSuccess }: VideoDeclineModalProps) {
  const [step, setStep] = useState<"decline" | "processing" | "success">("decline")
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [feedback, setFeedback] = useState("")
  const [requestRevision, setRequestRevision] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReasonChange = (reasonId: string, checked: boolean) => {
    if (checked) {
      setSelectedReasons((prev) => [...prev, reasonId])
    } else {
      setSelectedReasons((prev) => prev.filter((id) => id !== reasonId))
    }
  }

  const handleDecline = async () => {
    if (selectedReasons.length === 0) {
      toast.error("Please select at least one reason for declining")
      return
    }

    if (selectedReasons.includes("other") && !feedback.trim()) {
      toast.error('Please provide details for "Other" reason')
      return
    }

    setIsSubmitting(true)
    setStep("processing")

    try {
      const response = await fetch(`/api/orders/${order.orderNumber}/decline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reasons: selectedReasons,
          feedback: feedback.trim(),
          requestRevision,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to decline video")
      }

      setStep("success")
      toast.success(requestRevision ? "Revision requested successfully" : "Video declined successfully")

      // Auto close after 3 seconds
      setTimeout(() => {
        onClose()
        // Call the success callback if provided, otherwise just close
        if (onSuccess) {
          onSuccess()
        }
      }, 3000)
    } catch (error) {
      console.error("Error declining video:", error)
      toast.error("Failed to process decline. Please try again.")
      setStep("decline")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetModal = () => {
    setStep("decline")
    setSelectedReasons([])
    setFeedback("")
    setRequestRevision(true)
    setIsSubmitting(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  if (step === "processing") {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Processing Request</h3>
            <p className="text-gray-600 text-center">
              {requestRevision ? "Sending revision request to celebrity..." : "Processing video decline..."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (step === "success") {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{requestRevision ? "Revision Requested" : "Video Declined"}</h3>
            <p className="text-gray-600 text-center mb-4">
              {requestRevision
                ? `${order.celebrity.name} has been notified and will work on your revision.`
                : "Your feedback has been recorded and the celebrity has been notified."}
            </p>
            {requestRevision && (
              <div className="bg-blue-50 p-4 rounded-lg w-full">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">What happens next?</span>
                </div>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Celebrity will review your feedback</li>
                  <li>• New video will be delivered within 7 days</li>
                  <li>• You'll receive an email notification</li>
                  <li>• Payment remains secure until approval</li>
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Decline Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={order.celebrity.profileImage || "/placeholder.svg"} alt={order.celebrity.name} />
                  <AvatarFallback>{order.celebrity.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{order.celebrity.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {order.celebrity.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${order.price}</p>
                  <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Player */}
          <div className="space-y-2">
            <Label>Delivered Video</Label>
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video src={order.videoUrl} controls className="w-full h-64 object-contain" preload="metadata">
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Decline Reasons */}
          <div className="space-y-3">
            <Label>Why are you declining this video? (Select all that apply)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DECLINE_REASONS.map((reason) => (
                <div key={reason.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={reason.id}
                    checked={selectedReasons.includes(reason.id)}
                    onCheckedChange={(checked) => handleReasonChange(reason.id, checked as boolean)}
                  />
                  <Label htmlFor={reason.id} className="text-sm font-normal cursor-pointer">
                    {reason.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback">
              Additional Feedback {selectedReasons.includes("other") && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="feedback"
              placeholder="Please provide specific details about what you'd like improved..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              maxLength={1000}
              rows={4}
            />
            <p className="text-xs text-gray-500">{feedback.length}/1000 characters</p>
          </div>

          {/* Revision Option */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Checkbox id="revision" checked={requestRevision} onCheckedChange={setRequestRevision} />
              <div className="flex-1">
                <Label htmlFor="revision" className="font-medium cursor-pointer">
                  Request a revision (Recommended)
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Give {order.celebrity.name} a chance to create a new video based on your feedback. Your payment will
                  remain secure until you approve the revised video.
                </p>
              </div>
            </div>
          </div>

          {!requestRevision && (
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700">Final Decline</p>
                  <p className="text-sm text-red-600">
                    This will permanently decline the video and process a refund. The celebrity will not have another
                    opportunity to fulfill this order.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleDecline}
              disabled={isSubmitting || selectedReasons.length === 0}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {requestRevision ? "Request Revision" : "Decline Video"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
"use client"

import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ReviewModal } from "@/components/review-modal"
import { TipModal } from "@/components/tip-modal"
import VideoApprovalModal from "@/components/video-approval-modal"
import VideoDeclineModal from "@/components/video-decline-modal"
import {
  Download,
  Play,
  Star,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Heart,
  Gift,
  ThumbsUp,
  ThumbsDown,
  Eye,
  MessageCircle,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useParams } from "next/navigation"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import { toast } from "sonner"

interface OrderDetails {
  id: string
  orderNumber: string
  status: string
  approvalStatus?: string
  approvedAt?: string | null
  declinedAt?: string | null
  declineReason?: string | null
  revisionCount?: number
  maxRevisions?: number
  totalAmount: number
  currency: string
  paymentStatus: string
  createdAt: string
  deliveredAt: string | null
  videoUrl: string | null
  recipientName: string
  occasion: string
  personalMessage: string
  specialInstructions: string | null
  messageType: string
  email: string
  phone: string | null
  scheduledDate: string | null
  scheduledTime: string | null
  celebrity: {
    id: string
    name: string
    image: string | null
    category: string
    verified: boolean
  }
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
  booking: {
    id: string
    status: string
  } | null
  hasReviewed: boolean
}

interface TipData {
  id: string
  amount: number
  message: string | null
  createdAt: string
  paymentStatus: string
}

export default function OrderDetailsPage() {
  const params = useParams()
  const { data: session } = useSession()
  const orderNumber = params?.orderNumber as string
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [tips, setTips] = useState<TipData[]>([])
  const [totalTips, setTotalTips] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videoLoading, setVideoLoading] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails()
      fetchTips()
    }
  }, [orderNumber])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/orders/${orderNumber}`)
      const data = await response.json()

      if (response.ok) {
        setOrder(data)
      } else {
        setError(data.error || "Order not found")
      }
    } catch (error) {
      console.error("Error fetching order:", error)
      setError("Failed to load order details")
    } finally {
      setLoading(false)
    }
  }

  const fetchTips = async () => {
    try {
      const response = await fetch(`/api/tips?orderNumber=${orderNumber}`)
      if (response.ok) {
        const data = await response.json()
        setTips(data.tips || [])
        setTotalTips(data.totalTips || 0)
      }
    } catch (error) {
      console.error("Error fetching tips:", error)
    }
  }

  const handleApproveVideo = async () => {
    if (!order) return

    try {
      const response = await fetch(`/api/orders/${order.orderNumber}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        setOrder({
          ...order,
          approvalStatus: "APPROVED",
          approvedAt: new Date().toISOString(),
          status: "COMPLETED",
        })

        toast.success("Video approved! Payment has been released to the celebrity.")
      } else {
        throw new Error(data.error || "Failed to approve video")
      }
    } catch (error) {
      console.error("Error approving video:", error)
      toast.error("Failed to approve video. Please try again.")
      throw error
    }
  }

  const handleTipSuccess = () => {
    fetchTips()
  }

  const handleVideoDownload = async () => {
    if (!order?.videoUrl) return

    try {
      setVideoLoading(true)
      const response = await fetch(order.videoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${order.orderNumber}-video.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading video:", error)
      toast.error("Failed to download video")
    } finally {
      setVideoLoading(false)
    }
  }

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-500/20 text-gray-300 border-gray-500/30"

    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "confirmed":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "pending_approval":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "revision_requested":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getApprovalStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-500/20 text-gray-300 border-gray-500/30"

    switch (status.toLowerCase()) {
      case "pending_approval":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "approved":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "declined":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "revision_requested":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getPaymentStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-500/20 text-gray-300 border-gray-500/30"

    switch (status.toLowerCase()) {
      case "succeeded":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "failed":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const formatStatusText = (status: string | undefined) => {
    if (!status) return "Unknown"
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const safeFormatDate = (dateString: string | null | undefined, formatStr: string) => {
    if (!dateString) return "Not available"
    try {
      return format(new Date(dateString), formatStr)
    } catch {
      return "Invalid date"
    }
  }

  // Check if video is ready for approval
  const isVideoReadyForApproval = () => {
    return !!(
    order?.videoUrl && 
    order?.status?.toLowerCase() === "pending_approval"
  );
  }

  // Check if video has been approved
  const isVideoApproved = () => {
    return order?.status.toLowerCase() === "completed"
  }

  // Check if tips and reviews should be allowed
  const allowTipsAndReviews = () => {
    return isVideoApproved()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>
        <div className="relative z-10">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>
        <div className="relative z-10">
          <Navbar />
          <div className="container mx-auto px-4 pt-24 pb-12">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-white mb-4">Order Not Found</h1>
              <p className="text-purple-200 mb-6">{error || "Order not found"}</p>
              <Link href="/orders">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500">Back to Orders</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="container mx-auto px-4 pt-24 pb-12">
          {/* Header */}
          <div className="mb-8">
            <Link href="/orders">
              <Button variant="outline" className="mb-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Order Details</h1>
                <p className="text-purple-200">Order #{order.orderNumber || "Unknown"}</p>
              </div>
              <div className="text-right space-y-2">
                <Badge className={`text-lg px-4 py-2 ${getStatusColor(order.status)}`}>
                  {formatStatusText(order.status)}
                </Badge>
                {order.approvalStatus && (
                  <div>
                    <Badge className={`text-sm px-3 py-1 ${getApprovalStatusColor(order.approvalStatus)}`}>
                      {formatStatusText(order.approvalStatus)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Section - Show when video is uploaded */}
              {order.videoUrl && (
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Your Video Message
                      {isVideoReadyForApproval() && (
                        <Badge className="ml-2 bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                          Awaiting Your Approval
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video controls className="w-full h-auto max-h-96" poster="/placeholder.svg?height=400&width=600">
                        <source src={order.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>

                    {/* Video Approval Section */}
                    {isVideoReadyForApproval() && (
                      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Eye className="w-5 h-5 text-purple-400" />
                          <h3 className="text-lg font-semibold text-white">Review Your Video</h3>
                        </div>
                        <p className="text-purple-200 text-sm mb-4">
                          Please review your video message. Once you approve it, payment will be released to{" "}
                          {order.celebrity?.name} and you'll be able to leave tips.
                        </p>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => setShowApprovalModal(true)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Approve Video
                          </Button>
                          <Button
                            onClick={() => setShowDeclineModal(true)}
                            variant="outline"
                            className="flex-1 bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20"
                          >
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            Request Changes
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Video Actions - Only show after approval */}
                    {isVideoApproved() && (
                      <div className="flex gap-3">
                        <Button
                          onClick={handleVideoDownload}
                          disabled={videoLoading}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          {videoLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Download Video
                            </>
                          )}
                        </Button>
                        {/* {!order.hasReviewed && order.celebrity?.id && (
                          <ReviewModal
                            celebrityId={order.celebrity.id}
                            celebrityName={order.celebrity.name || "Celebrity"}
                            bookingId={order.booking?.id}
                            onReviewSubmitted={() => {
                              setOrder({ ...order, hasReviewed: true })
                            }}
                          >
                            <Button
                              variant="outline"
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              <Star className="w-4 h-4 mr-2" />
                              Leave Review
                            </Button>
                          </ReviewModal>
                        )} */}
                      </div>
                    )}

                    {/* Approval Status Messages */}
                    {order.approvedAt && (
                      <p className="text-green-200 text-sm">
                        ✅ Approved on {safeFormatDate(order.approvedAt, "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    )}
                    {order.declinedAt && order.declineReason && (
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                        <p className="text-orange-200 text-sm font-medium mb-2">
                          Feedback sent on {safeFormatDate(order.declinedAt, "MMMM d, yyyy 'at' h:mm a")}:
                        </p>
                        <p className="text-orange-100 text-sm italic">"{order.declineReason}"</p>
                      </div>
                    )}
                    {order.deliveredAt && isVideoApproved() && (
                      <p className="text-purple-200 text-sm">
                        Delivered on {safeFormatDate(order.deliveredAt, "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Tip Section - Only show after video approval */}
              {allowTipsAndReviews() && order.celebrity?.id && (
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Heart className="w-5 h-5 text-pink-500" />
                      Show Your Appreciation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-purple-200 text-sm">
                      Love your video? Show {order.celebrity.name} some extra appreciation with a tip!
                    </p>

                    {/* Tip History */}
                    {tips.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-purple-200 text-sm">Your Tips:</span>
                          <span className="text-white font-semibold">${totalTips.toLocaleString()}</span>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {tips.map((tip) => (
                            <div key={tip.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                              <div className="flex items-center gap-2">
                                <Gift className="w-4 h-4 text-pink-400" />
                                <span className="text-white text-sm">${tip.amount}</span>
                                {tip.message && (
                                  <span className="text-purple-200 text-xs truncate max-w-32">"{tip.message}"</span>
                                )}
                              </div>
                              <span className="text-purple-300 text-xs">{safeFormatDate(tip.createdAt, "MMM d")}</span>
                            </div>
                          ))}
                        </div>
                        <Separator className="bg-white/20" />
                      </div>
                    )}

                    {/* Tip Button */}
                    <TipModal
                      orderNumber={order.orderNumber}
                      celebrityName={order.celebrity.name || "Celebrity"}
                      celebrityImage={order.celebrity.image || undefined}
                      onTipSuccess={handleTipSuccess}
                    >
                      <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                        <Heart className="w-4 h-4 mr-2" />
                        Send a Tip
                      </Button>
                    </TipModal>

                    <p className="text-purple-300 text-xs text-center">
                      💝 100% of your tip goes directly to {order.celebrity.name}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Order Status */}
              {!isVideoApproved() && (
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Order Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.status === "pending" && (
                        <div className="flex items-center gap-3 p-4 bg-yellow-500/20 rounded-lg">
                          <Clock className="w-6 h-6 text-yellow-400" />
                          <div>
                            <p className="text-white font-semibold">Waiting for Celebrity Response</p>
                            <p className="text-yellow-200 text-sm">
                              {order.celebrity?.name || "The celebrity"} will review your request and respond soon.
                            </p>
                          </div>
                        </div>
                      )}
                      {order.status === "confirmed" && (
                        <div className="flex items-center gap-3 p-4 bg-blue-500/20 rounded-lg">
                          <CheckCircle className="w-6 h-6 text-blue-400" />
                          <div>
                            <p className="text-white font-semibold">Request Accepted!</p>
                            <p className="text-blue-200 text-sm">
                              {order.celebrity?.name || "The celebrity"} is working on your video message.
                            </p>
                          </div>
                        </div>
                      )}
                      {order.status === "pending_approval" && (
                        <div className="flex items-center gap-3 p-4 bg-purple-500/20 rounded-lg">
                          <Eye className="w-6 h-6 text-purple-400" />
                          <div>
                            <p className="text-white font-semibold">Video Ready for Review!</p>
                            <p className="text-purple-200 text-sm">
                              {order.celebrity?.name || "The celebrity"} has uploaded your video. Please review it
                              above.
                            </p>
                          </div>
                        </div>
                      )}
                      {order.status === "revision_requested" && (
                        <div className="flex items-center gap-3 p-4 bg-orange-500/20 rounded-lg">
                          <MessageCircle className="w-6 h-6 text-orange-400" />
                          <div>
                            <p className="text-white font-semibold">Revision Requested</p>
                            <p className="text-orange-200 text-sm">
                              {order.celebrity?.name || "The celebrity"} is working on the changes you requested.
                            </p>
                          </div>
                        </div>
                      )}
                      {order.status === "cancelled" && (
                        <div className="flex items-center gap-3 p-4 bg-red-500/20 rounded-lg">
                          <AlertCircle className="w-6 h-6 text-red-400" />
                          <div>
                            <p className="text-white font-semibold">Request Declined</p>
                            <p className="text-red-200 text-sm">
                              Unfortunately, {order.celebrity?.name || "the celebrity"} was unable to fulfill this
                              request.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Message Details */}
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Message Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-purple-200 text-sm font-medium">Recipient</Label>
                      <p className="text-white">{order.recipientName || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-purple-200 text-sm font-medium">Occasion</Label>
                      <p className="text-white">{order.occasion || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-purple-200 text-sm font-medium">Message Type</Label>
                      <p className="text-white capitalize">{order.messageType || "video"}</p>
                    </div>
                    {order.scheduledDate && (
                      <div>
                        <Label className="text-purple-200 text-sm font-medium">Scheduled For</Label>
                        <p className="text-white">
                          {safeFormatDate(order.scheduledDate, "MMMM d, yyyy")}
                          {order.scheduledTime && ` at ${order.scheduledTime}`}
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-white/20" />

                  <div>
                    <Label className="text-purple-200 text-sm font-medium">Personal Message</Label>
                    <p className="text-white bg-white/5 p-3 rounded-lg mt-2">
                      {order.personalMessage || "No message provided"}
                    </p>
                  </div>

                  {order.specialInstructions && (
                    <div>
                      <Label className="text-purple-200 text-sm font-medium">Special Instructions</Label>
                      <p className="text-white bg-white/5 p-3 rounded-lg mt-2">{order.specialInstructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Celebrity Info */}
              {order.celebrity && (
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Celebrity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={order.celebrity.image || "/placeholder.svg"} />
                        <AvatarFallback>{(order.celebrity.name || "C").charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">
                            {order.celebrity.name || "Unknown Celebrity"}
                          </h3>
                          {order.celebrity.verified && <CheckCircle className="w-5 h-5 text-blue-400" />}
                        </div>
                        <p className="text-purple-200 text-sm">{order.celebrity.category || "Entertainment"}</p>
                      </div>
                    </div>
                    <Link href={`/celebrities/${order.celebrity.id}`}>
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        View Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Order Summary */}
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-200">Order Number</span>
                    <span className="text-white font-mono">{order.orderNumber || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-200">Order Date</span>
                    <span className="text-white">{safeFormatDate(order.createdAt, "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-200">Total Amount</span>
                    <span className="text-white font-semibold">
                      ${(order.totalAmount || 0).toLocaleString()} {(order.currency || "USD").toUpperCase()}
                    </span>
                  </div>
                  {totalTips > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200">Tips Given</span>
                      <span className="text-pink-400 font-semibold">+${totalTips.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-purple-200">Payment Status</span>
                    <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                      {formatStatusText(order.paymentStatus)}
                    </Badge>
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200">Contact Email</span>
                      <span className="text-white text-sm">{order.email || "Not provided"}</span>
                    </div>
                    {order.phone && (
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200">Phone</span>
                        <span className="text-white text-sm">{order.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              {/* {allowTipsAndReviews() && !order.hasReviewed && order.celebrity?.id && (
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Share Your Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-200 text-sm mb-4">
                      Help others by sharing your experience with {order.celebrity.name || "this celebrity"}.
                    </p>
                    <ReviewModal
                      celebrityId={order.celebrity.id}
                      celebrityName={order.celebrity.name || "Celebrity"}
                      bookingId={order.booking?.id}
                      onReviewSubmitted={() => {
                        setOrder({ ...order, hasReviewed: true })
                      }}
                    >
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        <Star className="w-4 h-4 mr-2" />
                        Leave a Review
                      </Button>
                    </ReviewModal>
                  </CardContent>
                </Card>
              )} */}

              {/* {order.hasReviewed && (
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-green-400">
                      <Heart className="w-5 h-5" />
                      <span className="font-medium">Thank you for your review!</span>
                    </div>
                  </CardContent>
                </Card>
              )} */}
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* Approval Modal */}
      {order && (
        <VideoApprovalModal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          order={{
            id: order.id,
            orderNumber: order.orderNumber,
            videoUrl: order.videoUrl || "",
            celebrity: {
              name: order.celebrity?.name || "",
              profileImage: order.celebrity?.image || "",
            },
            amount: order.totalAmount,
          }}
          onApprove={handleApproveVideo}
        />
      )}

      {/* Decline Modal */}
      {order && (
        <VideoDeclineModal
          isOpen={showDeclineModal}
          onClose={() => setShowDeclineModal(false)}
          order={{
            id: order.id,
            orderNumber: order.orderNumber,
            videoUrl: order.videoUrl || "",
            celebrity: {
              name: order.celebrity?.name || "",
              profileImage: order.celebrity?.image || "",
              category: order.celebrity?.category || "",
            },
            customerName: order.user?.name || "",
            occasion: order.occasion,
            instructions: order.personalMessage,
            price: order.totalAmount,
            createdAt: order.createdAt,
          }}
        />
      )}
    </div>
  )
}

"use client"

import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
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
  DollarSign,
  Calendar,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

interface CelebrityOrderDetails {
  id: string
  orderNumber: string
  status: string
  approvalStatus?: string
  approvedAt?: string | null
  declinedAt?: string | null
  declineReason?: string | null
  revisionCount?: number
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
  scheduledDate: string | null
  scheduledTime: string | null
  customer: {
    id: string
    name: string
    email: string
    image: string | null
  }
  celebrity: {
    id: string
    name: string
    image: string | null
    category: string
    verified: boolean
  }
  booking: {
    id: string
    status: string
    deadline: string | null
    price: number
  } | null
  tips: Array<{
    id: string
    amount: number
    message: string | null
    status: string
    createdAt: string
  }>
  totalTips: number
  celebrityAmount: number
  platformFee: number
  transferStatus: string
}

export default function CelebrityOrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const orderNumber = params?.orderNumber as string
  const [order, setOrder] = useState<CelebrityOrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails()
    }
  }, [orderNumber])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/celebrity/orders/${orderNumber}`)
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

  const getStatusBadgeColor = (status: string) => {
    if (!status) return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "confirmed":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getApprovalStatusBadgeColor = (approvalStatus: string) => {
    if (!approvalStatus) return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    switch (approvalStatus.toLowerCase()) {
      case "pending_approval":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "approved":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "declined":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "revision_requested":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Error Loading Order</h1>
          <p className="text-red-200 mb-6">{error}</p>
          <Button onClick={() => router.back()} className="bg-purple-600 hover:bg-purple-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Order Not Found</h1>
          <p className="text-red-200 mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.back()} className="bg-purple-600 hover:bg-purple-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Order Details</h1>
              <p className="text-purple-200">Order #{order.orderNumber}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusBadgeColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
              {order.approvalStatus && (
                <Badge className={getApprovalStatusBadgeColor(order.approvalStatus)}>
                  {order.approvalStatus.replace("_", " ")}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer & Order Info */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer & Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={order.customer.image || "/placeholder.svg"} />
                    <AvatarFallback>{order.customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{order.customer.name}</h3>
                    <p className="text-purple-200">{order.customer.email}</p>
                    <p className="text-purple-300 text-sm">
                      Order placed {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <Separator className="bg-white/20" />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-purple-200 text-sm">Recipient Name</Label>
                    <p className="text-white font-medium">{order.recipientName}</p>
                  </div>
                  <div>
                    <Label className="text-purple-200 text-sm">Occasion</Label>
                    <p className="text-white font-medium">{order.occasion}</p>
                  </div>
                  <div>
                    <Label className="text-purple-200 text-sm">Message Type</Label>
                    <p className="text-white font-medium capitalize">{order.messageType}</p>
                  </div>
                  <div>
                    <Label className="text-purple-200 text-sm">Scheduled Date</Label>
                    <p className="text-white font-medium">
                      {order.scheduledDate ? format(new Date(order.scheduledDate), "MMM d, yyyy") : "Not scheduled"}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-purple-200 text-sm">Personal Message</Label>
                  <p className="text-white bg-white/5 p-3 rounded-lg mt-2">{order.personalMessage}</p>
                </div>

                {order.specialInstructions && (
                  <div>
                    <Label className="text-purple-200 text-sm">Special Instructions</Label>
                    <p className="text-white bg-white/5 p-3 rounded-lg mt-2">{order.specialInstructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Section */}
            {order.videoUrl && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Video Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black rounded-lg p-4">
                    <video
                      controls
                      className="w-full rounded-lg"
                      src={order.videoUrl}
                      poster="/video-placeholder.jpg"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => window.open(order.videoUrl!, "_blank")}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Full Screen
                    </Button>
                    <Button
                      onClick={() => {
                        const link = document.createElement("a")
                        link.href = order.videoUrl!
                        link.download = `${order.orderNumber}-video.mp4`
                        link.click()
                      }}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips Section */}
            {order.tips.length > 0 && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Tips Received
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.tips.map((tip) => (
                      <div key={tip.id} className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-yellow-300 font-semibold">+${tip.amount.toLocaleString()} tip</p>
                            {tip.message && <p className="text-white text-sm mt-1">{tip.message}</p>}
                          </div>
                          <span className="text-purple-400 text-xs">
                            {format(new Date(tip.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-purple-200">Order Total</span>
                  <span className="text-white font-semibold">${order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Platform Fee (20%)</span>
                  <span className="text-red-300">-${order.platformFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Tips</span>
                  <span className="text-yellow-300">+${order.totalTips.toLocaleString()}</span>
                </div>
                <Separator className="bg-white/20" />
                <div className="flex justify-between">
                  <span className="text-green-200 font-semibold">Your Earnings</span>
                  <span className="text-green-400 font-bold text-lg">
                    ${(order.celebrityAmount + order.totalTips).toLocaleString()}
                  </span>
                </div>
                <div className="text-center">
                  <Badge className={`${
                    order.transferStatus === "PAID" 
                      ? "bg-green-500/20 text-green-300" 
                      : order.transferStatus === "IN_TRANSIT"
                      ? "bg-blue-500/20 text-blue-300"
                      : "bg-yellow-500/20 text-yellow-300"
                  }`}>
                    {order.transferStatus === "PAID" ? "Paid" : 
                     order.transferStatus === "IN_TRANSIT" ? "In Transit" : 
                     "Pending"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-white text-sm">Order Created</p>
                    <p className="text-purple-300 text-xs">
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                
                {order.paidAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-white text-sm">Payment Received</p>
                      <p className="text-purple-300 text-xs">
                        {format(new Date(order.paidAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                )}

                {order.deliveredAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="text-white text-sm">Video Delivered</p>
                      <p className="text-purple-300 text-xs">
                        {format(new Date(order.deliveredAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                )}

                {order.approvedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-white text-sm">Video Approved</p>
                      <p className="text-purple-300 text-xs">
                        {format(new Date(order.approvedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                )}

                {order.declinedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="text-white text-sm">Video Declined</p>
                      <p className="text-purple-300 text-xs">
                        {format(new Date(order.declinedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => router.push("/celebrity-dashboard")}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                
                {order.status === "confirmed" && !order.videoUrl && (
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Play className="w-4 h-4 mr-2" />
                    Upload Video
                  </Button>
                )}

                {order.approvalStatus === "DECLINED" && (order.revisionCount || 0) < 2 && (
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                    <Play className="w-4 h-4 mr-2" />
                    Upload Revision
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

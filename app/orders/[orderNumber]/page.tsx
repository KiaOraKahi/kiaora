"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Package,
  CreditCard,
  Download,
  MessageSquare,
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
  Play,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"

interface OrderDetails {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  totalAmount: number
  currency: string
  createdAt: string
  recipientName: string
  occasion: string
  message: string
  specialInstructions: string
  scheduledDate: string
  scheduledTime: string
  videoUrl: string
  bookingStatus: string
  celebrityName: string
  celebrityImage: string
  celebrityCategory: string
  userName: string
  userEmail: string
  items: Array<{
    id: string
    type: string
    name: string
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  transactions: Array<{
    id: string
    amount: number
    currency: string
    status: string
    paymentMethod: string
    createdAt: string
  }>
}

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  in_progress: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  completed: "bg-green-500/20 text-green-300 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
  failed: "bg-red-500/20 text-red-300 border-red-500/30",
}

const paymentStatusColors = {
  pending: "bg-yellow-500/20 text-yellow-300",
  paid: "bg-green-500/20 text-green-300",
  failed: "bg-red-500/20 text-red-300",
  refunded: "bg-gray-500/20 text-gray-300",
}

export default function OrderDetailsPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const orderNumber = params.orderNumber as string
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session && orderNumber) {
      fetchOrderDetails()
    }
  }, [session, orderNumber])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderNumber}`)
      const data = await response.json()

      if (response.ok) {
        setOrder(data.order)
      } else {
        setError(data.error || "Failed to fetch order details")
      }
    } catch (err) {
      setError("An error occurred while fetching order details")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Animated Stars Background */}
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

  if (!session) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Animated Stars Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please Sign In</h1>
          <p className="text-purple-200">You need to be signed in to view order details.</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Animated Stars Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>
        <div className="relative z-10 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Order Not Found</h1>
          <p className="text-purple-200 mb-6">{error || "The requested order could not be found."}</p>
          <Link href="/orders">
            <Button className="bg-purple-600 hover:bg-purple-700">Back to Orders</Button>
          </Link>
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

        <div className="container mx-auto px-4 py-8 pt-24">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white hover:bg-purple-500/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Order {order.orderNumber}</h1>
              <p className="text-purple-200">Placed on {format(new Date(order.createdAt), "MMMM d, yyyy")}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status */}
              <Card className="bg-slate-900 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <Package className="w-5 h-5" />
                    Order Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Badge className={statusColors[order.status as keyof typeof statusColors]} size="lg">
                      {order.status.replace("_", " ")}
                    </Badge>
                    <Badge
                      className={paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors]}
                      size="lg"
                    >
                      Payment {order.paymentStatus}
                    </Badge>
                  </div>

                  {order.status === "completed" && order.videoUrl && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div>
                          <h4 className="text-green-300 font-semibold">Your video is ready!</h4>
                          <p className="text-green-200 text-sm">Click below to watch your personalized message</p>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Play className="w-4 h-4 mr-2" />
                          Watch Video
                        </Button>
                        <Button
                          variant="outline"
                          className="border-green-500/30 text-green-300 hover:bg-green-500/20 bg-transparent"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-purple-200">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Scheduled for {format(new Date(order.scheduledDate), "MMMM d, yyyy")} at {order.scheduledTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-200">
                      <Clock className="w-4 h-4" />
                      <span>Expected delivery within 7 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Celebrity & Message Details */}
              <Card className="bg-slate-900 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <Star className="w-5 h-5" />
                    Message Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      {order.celebrityImage ? (
                        <img
                          src={order.celebrityImage || "/placeholder.svg"}
                          alt={order.celebrityName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{order.celebrityName}</h3>
                      <p className="text-purple-200">{order.celebrityCategory}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-semibold mb-2">Recipient</h4>
                      <p className="text-purple-200">{order.recipientName}</p>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-2">Occasion</h4>
                      <p className="text-purple-200 capitalize">{order.occasion}</p>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-2">Message Request</h4>
                      <div className="bg-white/10 rounded-lg p-4">
                        <p className="text-purple-200 italic">"{order.message}"</p>
                      </div>
                    </div>

                    {order.specialInstructions && (
                      <div>
                        <h4 className="text-white font-semibold mb-2">Special Instructions</h4>
                        <div className="bg-white/10 rounded-lg p-4">
                          <p className="text-purple-200 italic">"{order.specialInstructions}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card className="bg-slate-900 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <MessageSquare className="w-5 h-5" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0"
                      >
                        <div>
                          <h4 className="text-white font-medium">{item.name}</h4>
                          {item.description && <p className="text-purple-200 text-sm">{item.description}</p>}
                          <p className="text-purple-300 text-xs">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">${item.totalPrice}</p>
                          {item.quantity > 1 && <p className="text-purple-300 text-xs">${item.unitPrice} each</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4 bg-white/20" />

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-white">Total</span>
                    <span className="text-xl font-bold text-white">${order.totalAmount}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Information */}
              <Card className="bg-slate-900 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <CreditCard className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-purple-200">Amount</span>
                      <span className="text-white font-semibold">${order.totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Currency</span>
                      <span className="text-white">{order.currency.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Status</span>
                      <Badge className={paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors]}>
                        {order.paymentStatus}
                      </Badge>
                    </div>

                    {order.transactions.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-white font-semibold mb-2">Transaction History</h4>
                        {order.transactions.map((transaction) => (
                          <div key={transaction.id} className="bg-white/10 rounded-lg p-3 mb-2">
                            <div className="flex justify-between items-center">
                              <span className="text-purple-200 text-sm">
                                {format(new Date(transaction.createdAt), "MMM d, yyyy HH:mm")}
                              </span>
                              <Badge
                                className={paymentStatusColors[transaction.status as keyof typeof paymentStatusColors]}
                                size="sm"
                              >
                                {transaction.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-white font-medium">${transaction.amount}</span>
                              {transaction.paymentMethod && (
                                <span className="text-purple-300 text-xs">{transaction.paymentMethod}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card className="bg-slate-900 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-200 text-sm mb-4">
                    Have questions about your order? Our support team is here to help.
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      View FAQ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}

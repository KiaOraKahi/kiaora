"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Calendar, Clock, DollarSign, User, Package, ChevronRight, Loader2 } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import MobileNavbar from "@/components/frontend/mobile-navbar"
import { Sub } from "@radix-ui/react-dropdown-menu"

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  totalAmount: number
  createdAt: string
  recipientName: string
  occasion: string
  scheduledDate: string
  scheduledTime: string
  bookingStatus: string
  celebrityName: string
  celebrityImage: string
  celebrityCategory: string
}

interface OrdersResponse {
  orders: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Subtle starfield component
const SubtleLuxuryStarfield = () => {
  useEffect(() => {
    const existingStarfield = document.querySelector(".starfield")
    if (existingStarfield) {
      existingStarfield.remove()
    }

    const createStar = () => {
      const star = document.createElement("div")
      const size = Math.random() * 2 + 1
      const type = Math.random()

      if (type > 0.97) {
        star.className = "star diamond"
        star.style.width = `${size * 1.5}px`
        star.style.height = `${size * 1.5}px`
      } else if (type > 0.93) {
        star.className = "star sapphire"
        star.style.width = `${size * 1.2}px`
        star.style.height = `${size * 1.2}px`
      } else {
        star.className = "star"
        star.style.width = `${size}px`
        star.style.height = `${size}px`
      }

      star.style.left = `${Math.random() * 100}%`
      star.style.top = `${Math.random() * 100}%`
      star.style.animationDelay = `${Math.random() * 5}s`

      return star
    }

    const starfield = document.createElement("div")
    starfield.className = "starfield"

    for (let i = 0; i < 60; i++) {
      starfield.appendChild(createStar())
    }

    document.body.appendChild(starfield)

    return () => {
      const starfieldToRemove = document.querySelector(".starfield")
      if (starfieldToRemove && document.body.contains(starfieldToRemove)) {
        document.body.removeChild(starfieldToRemove)
      }
    }
  }, [])

  return null
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

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<OrdersResponse["pagination"] | null>(null)
  const [isMobile, setIsMobile] = useState(false)
      
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const fetchOrders = async (page = 1, status = "all", search = "") => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(status !== "all" && { status }),
        ...(search && { search }),
      })

      const response = await fetch(`/api/orders?${params}`)
      const data: OrdersResponse = await response.json()

      if (response.ok) {
        setOrders(data.orders)
        setPagination(data.pagination)
      } else {
        console.error("Failed to fetch orders:", data.error)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchOrders(currentPage, statusFilter, searchTerm)
    }
  }, [session, currentPage, statusFilter])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchOrders(1, statusFilter, searchTerm)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
    fetchOrders(1, status, searchTerm)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {isMobile ? <MobileNavbar /> : <Navbar />}
        <SubtleLuxuryStarfield />
        <div className="relative z-10">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {isMobile ? <MobileNavbar /> : <Navbar />}
        <SubtleLuxuryStarfield />
        <div className="relative z-10 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please Sign In</h1>
          <p className="text-purple-200">You need to be signed in to view your orders.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <SubtleLuxuryStarfield />
      
      {/* Main Content */}
      <div className="relative z-10">
        {isMobile ? <MobileNavbar /> : <Navbar />}
        
        {/* Main Content */}

        <div className="container mx-auto px-4 py-8 pt-24">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">My Orders</h1>
            <p className="text-purple-200">Track and manage your celebrity video bookings</p>
          </div>

          {/* Filters and Search */}
          <Card className="bg-slate-900 border-white/20 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                    <Input
                      placeholder="Search by order number, celebrity, or recipient..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={handleStatusFilter}>
                    <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : orders.length === 0 ? (
            <Card className="bg-slate-900 border-white/20">
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Orders Found</h3>
                <p className="text-purple-200 mb-6">
                  {searchTerm || statusFilter !== "all"
                    ? "No orders match your current filters."
                    : "You haven't placed any orders yet."}
                </p>
                <Link href="/celebrities">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Browse Celebrities
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <Card className="bg-slate-900 border-white/20 hover:border-purple-500/50 transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
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
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold text-white">{order.orderNumber}</h3>
                              <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                                {order.status.replace("_", " ")}
                              </Badge>
                              <Badge
                                className={paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors]}
                              >
                                {order.paymentStatus}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-purple-200">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{order.celebrityName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                <span>For {order.recipientName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{format(new Date(order.scheduledDate), "MMM d, yyyy")}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{order.scheduledTime}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-purple-300 mb-1">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-semibold">${order.totalAmount}</span>
                            </div>
                            <div className="text-xs text-purple-200">
                              {format(new Date(order.createdAt), "MMM d, yyyy")}
                            </div>
                          </div>

                          <Link href={`/orders/${order.orderNumber}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-300 hover:text-white hover:bg-purple-500/20"
                            >
                              View Details
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === pagination.page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className={
                      page === pagination.page
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    }
                    size="sm"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Next
              </Button>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  )
}

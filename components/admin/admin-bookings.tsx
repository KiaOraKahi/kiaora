"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  Search,
  Eye,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

interface Booking {
  id: string
  orderNumber: string
  customerName: string
  celebrityName: string
  message: string
  recipientName: string
  occasion: string
  price: number
  totalAmount: number
  status: string
  paymentStatus: string
  videoUrl?: string
  createdAt: string
  scheduledDate?: string
  completedAt?: string
}

export function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [searchTerm, statusFilter, paymentFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (paymentFilter !== "all") params.append("payment", paymentFilter)

      const response = await fetch(`/api/admin/bookings?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings)
      } else {
        toast.error("Failed to fetch bookings")
      }
    } catch (error) {
      toast.error("Error fetching bookings")
    } finally {
      setLoading(false)
    }
  }

  const handleBookingAction = async (bookingId: string, action: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        toast.success(`Booking ${action} successfully`)
        fetchBookings()
      } else {
        toast.error(`Failed to ${action} booking`)
      }
    } catch (error) {
      toast.error("Error updating booking")
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-500", text: "Pending", icon: Clock },
      CONFIRMED: { color: "bg-blue-500", text: "Confirmed", icon: CheckCircle },
      COMPLETED: { color: "bg-green-500", text: "Completed", icon: CheckCircle },
      CANCELLED: { color: "bg-red-500", text: "Cancelled", icon: XCircle },
      REFUNDED: { color: "bg-gray-500", text: "Refunded", icon: RefreshCw },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-500",
      text: status,
      icon: AlertCircle,
    }
    const Icon = config.icon
    return (
      <Badge className={`${config.color} text-white hover:${config.color}/80 flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      SUCCEEDED: { color: "bg-green-500", text: "Paid" },
      PENDING: { color: "bg-yellow-500", text: "Pending" },
      FAILED: { color: "bg-red-500", text: "Failed" },
      CANCELLED: { color: "bg-gray-500", text: "Cancelled" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { color: "bg-gray-500", text: status }
    return <Badge className={`${config.color} text-white hover:${config.color}/80`}>{config.text}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Booking Management
        </h1>
        <p className="text-gray-400">Monitor and manage all celebrity bookings and video requests.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { title: "Total Bookings", value: bookings.length, icon: Calendar, color: "from-blue-500 to-cyan-500" },
          {
            title: "Pending",
            value: bookings.filter((b) => b.status === "PENDING").length,
            icon: Clock,
            color: "from-yellow-500 to-orange-500",
          },
          {
            title: "Confirmed",
            value: bookings.filter((b) => b.status === "CONFIRMED").length,
            icon: CheckCircle,
            color: "from-blue-500 to-indigo-500",
          },
          {
            title: "Completed",
            value: bookings.filter((b) => b.status === "COMPLETED").length,
            icon: CheckCircle,
            color: "from-green-500 to-emerald-500",
          },
          {
            title: "Total Revenue",
            value: `$${bookings.reduce((acc, b) => acc + b.totalAmount, 0).toLocaleString()}`,
            icon: DollarSign,
            color: "from-purple-500 to-pink-500",
          },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Filters */}
      <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by order number, customer, or celebrity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500"
                />
              </div>
            </div>
            <div className="w-full md:w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all" className="text-white hover:bg-gray-800">
                    All Status
                  </SelectItem>
                  <SelectItem value="PENDING" className="text-white hover:bg-gray-800">
                    Pending
                  </SelectItem>
                  <SelectItem value="CONFIRMED" className="text-white hover:bg-gray-800">
                    Confirmed
                  </SelectItem>
                  <SelectItem value="COMPLETED" className="text-white hover:bg-gray-800">
                    Completed
                  </SelectItem>
                  <SelectItem value="CANCELLED" className="text-white hover:bg-gray-800">
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-40">
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all" className="text-white hover:bg-gray-800">
                    All Payments
                  </SelectItem>
                  <SelectItem value="SUCCEEDED" className="text-white hover:bg-gray-800">
                    Paid
                  </SelectItem>
                  <SelectItem value="PENDING" className="text-white hover:bg-gray-800">
                    Pending
                  </SelectItem>
                  <SelectItem value="FAILED" className="text-white hover:bg-gray-800">
                    Failed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white">All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <span className="ml-2 text-gray-300">Loading bookings...</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-gray-800/50">
                    <TableHead className="text-gray-300">Order</TableHead>
                    <TableHead className="text-gray-300">Customer</TableHead>
                    <TableHead className="text-gray-300">Celebrity</TableHead>
                    <TableHead className="text-gray-300">Occasion</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Payment</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id} className="border-gray-700 hover:bg-gray-800/50 transition-colors">
                      <TableCell>
                        <div>
                          <p className="text-white font-medium">{booking.orderNumber}</p>
                          <p className="text-gray-400 text-sm">ID: {booking.id.slice(-8)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-white">{booking.customerName}</p>
                          <p className="text-gray-400 text-sm">For: {booking.recipientName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{booking.celebrityName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                          {booking.occasion}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">${booking.totalAmount}</TableCell>
                      <TableCell>{getPaymentStatusBadge(booking.paymentStatus)}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedBooking(booking)}
                                className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Booking Details - {selectedBooking?.orderNumber}</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                  View and manage booking information
                                </DialogDescription>
                              </DialogHeader>
                              {selectedBooking && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="bg-gray-800/50 border-gray-700">
                                      <CardHeader>
                                        <CardTitle className="text-lg">Booking Information</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-3">
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Order Number:</span>
                                          <span className="text-white">{selectedBooking.orderNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Customer:</span>
                                          <span className="text-white">{selectedBooking.customerName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Celebrity:</span>
                                          <span className="text-white">{selectedBooking.celebrityName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Recipient:</span>
                                          <span className="text-white">{selectedBooking.recipientName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Occasion:</span>
                                          <span className="text-white">{selectedBooking.occasion}</span>
                                        </div>
                                      </CardContent>
                                    </Card>
                                    <Card className="bg-gray-800/50 border-gray-700">
                                      <CardHeader>
                                        <CardTitle className="text-lg">Payment & Status</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-3">
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Base Price:</span>
                                          <span className="text-white">${selectedBooking.price}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Total Amount:</span>
                                          <span className="text-white">${selectedBooking.totalAmount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Payment Status:</span>
                                          {getPaymentStatusBadge(selectedBooking.paymentStatus)}
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Booking Status:</span>
                                          {getStatusBadge(selectedBooking.status)}
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Created:</span>
                                          <span className="text-white">
                                            {new Date(selectedBooking.createdAt).toLocaleString()}
                                          </span>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                  <Card className="bg-gray-800/50 border-gray-700">
                                    <CardHeader>
                                      <CardTitle className="text-lg">Message</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <p className="text-gray-300 text-sm leading-relaxed">{selectedBooking.message}</p>
                                    </CardContent>
                                  </Card>
                                  {selectedBooking.videoUrl && (
                                    <Card className="bg-gray-800/50 border-gray-700">
                                      <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <Play className="w-5 h-5 text-purple-400" />
                                          Delivered Video
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="flex items-center gap-4">
                                          <Button
                                            onClick={() => window.open(selectedBooking.videoUrl, "_blank")}
                                            className="bg-purple-600 hover:bg-purple-700"
                                          >
                                            <Play className="w-4 h-4 mr-2" />
                                            View Video
                                          </Button>
                                          <span className="text-gray-400 text-sm">
                                            Completed:{" "}
                                            {selectedBooking.completedAt
                                              ? new Date(selectedBooking.completedAt).toLocaleString()
                                              : "N/A"}
                                          </span>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                  <div className="flex gap-2">
                                    {selectedBooking.status === "PENDING" && (
                                      <Button
                                        onClick={() => handleBookingAction(selectedBooking.id, "cancel")}
                                        disabled={updating}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        {updating ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <XCircle className="w-4 h-4" />
                                        )}
                                        Cancel Booking
                                      </Button>
                                    )}
                                    {selectedBooking.paymentStatus === "SUCCEEDED" &&
                                      selectedBooking.status !== "REFUNDED" && (
                                        <Button
                                          onClick={() => handleBookingAction(selectedBooking.id, "refund")}
                                          disabled={updating}
                                          className="bg-yellow-600 hover:bg-yellow-700"
                                        >
                                          {updating ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <RefreshCw className="w-4 h-4" />
                                          )}
                                          Process Refund
                                        </Button>
                                      )}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
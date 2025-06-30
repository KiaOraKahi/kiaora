"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  Calendar,
  MessageSquare,
  User,
  TrendingUp,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  Settings,
  Camera,
  Edit3,
  BarChart3,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"

interface DashboardStats {
  totalEarnings: number
  monthlyEarnings: number
  pendingRequests: number
  completedBookings: number
  averageRating: number
  totalReviews: number
}

interface BookingRequest {
  id: string
  orderNumber: string
  customerName: string
  recipientName: string
  occasion: string
  instructions: string
  amount: number
  requestedDate: string
  status: "pending" | "accepted" | "declined"
  createdAt: string
  deadline: string
}

const mockStats: DashboardStats = {
  totalEarnings: 15420,
  monthlyEarnings: 3240,
  pendingRequests: 8,
  completedBookings: 127,
  averageRating: 4.9,
  totalReviews: 89,
}

const mockBookingRequests: BookingRequest[] = [
  {
    id: "1",
    orderNumber: "KO-2024-001",
    customerName: "Sarah Johnson",
    recipientName: "Mike Johnson",
    occasion: "Birthday",
    instructions: "Please mention his love for basketball and that he's turning 25!",
    amount: 150,
    requestedDate: "2024-01-15",
    status: "pending",
    createdAt: "2024-01-10T10:00:00Z",
    deadline: "2024-01-12T23:59:59Z",
  },
  {
    id: "2",
    orderNumber: "KO-2024-002",
    customerName: "Emily Davis",
    recipientName: "Tom Davis",
    occasion: "Anniversary",
    instructions: "Celebrating 10 years together, they love traveling and cooking.",
    amount: 200,
    requestedDate: "2024-01-20",
    status: "pending",
    createdAt: "2024-01-11T14:30:00Z",
    deadline: "2024-01-13T23:59:59Z",
  },
]

export default function CelebrityDashboard() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<DashboardStats>(mockStats)
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(mockBookingRequests)
  const [loading, setLoading] = useState(false)

  // Check if user is a celebrity
  const isCelebrity = session?.user?.role === "CELEBRITY"

  useEffect(() => {
    if (session && isCelebrity) {
      // Fetch celebrity dashboard data
      fetchDashboardData()
    }
  }, [session, isCelebrity])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // API calls would go here
      // const statsResponse = await fetch('/api/celebrity/stats')
      // const requestsResponse = await fetch('/api/celebrity/booking-requests')

      // For now, using mock data
      setStats(mockStats)
      setBookingRequests(mockBookingRequests)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookingAction = async (requestId: string, action: "accept" | "decline") => {
    try {
      // API call would go here
      // await fetch(`/api/celebrity/booking-requests/${requestId}`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ action })
      // })

      // Update local state
      setBookingRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? { ...request, status: action === "accept" ? "accepted" : "declined" } : request,
        ),
      )
    } catch (error) {
      console.error("Error updating booking request:", error)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 relative z-10" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        <div className="text-center relative z-10">
          <h1 className="text-2xl font-bold text-white mb-4">Please Sign In</h1>
          <p className="text-purple-200">You need to be signed in to access the celebrity dashboard.</p>
        </div>
      </div>
    )
  }

  if (!isCelebrity) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        <div className="text-center relative z-10">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-purple-200 mb-6">This dashboard is only available to verified celebrities.</p>
          <Link href="/join-celebrity">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Apply to Become a Celebrity
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-70"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="container mx-auto px-4 pt-24 pb-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-purple-500 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Celebrity Dashboard</h1>
                <p className="text-purple-200">Welcome back, {session.user?.name}!</p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/10 border border-white/20 p-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="requests"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Requests ({stats.pendingRequests})
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-200 text-sm font-medium">Total Earnings</p>
                        <p className="text-2xl font-bold text-white">${stats.totalEarnings.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-200 text-sm font-medium">This Month</p>
                        <p className="text-2xl font-bold text-white">${stats.monthlyEarnings.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-200 text-sm font-medium">Pending Requests</p>
                        <p className="text-2xl font-bold text-white">{stats.pendingRequests}</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-yellow-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-200 text-sm font-medium">Completed</p>
                        <p className="text-2xl font-bold text-white">{stats.completedBookings}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Recent Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {bookingRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{request.orderNumber}</p>
                          <p className="text-purple-200 text-sm">
                            {request.occasion} for {request.recipientName}
                          </p>
                        </div>
                        <Badge className="bg-yellow-500/20 text-yellow-300">${request.amount}</Badge>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                      onClick={() => setActiveTab("requests")}
                    >
                      View All Requests
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Average Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white font-semibold">{stats.averageRating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Total Reviews</span>
                      <span className="text-white font-semibold">{stats.totalReviews}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Response Rate</span>
                      <span className="text-white font-semibold">98%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Avg. Response Time</span>
                      <span className="text-white font-semibold">2.3 hours</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Booking Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Booking Requests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bookingRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-white font-semibold mb-2">No pending requests</p>
                      <p className="text-purple-200">New booking requests will appear here.</p>
                    </div>
                  ) : (
                    bookingRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{request.orderNumber}</h3>
                              <Badge
                                className={
                                  request.status === "pending"
                                    ? "bg-yellow-500/20 text-yellow-300"
                                    : request.status === "accepted"
                                      ? "bg-green-500/20 text-green-300"
                                      : "bg-red-500/20 text-red-300"
                                }
                              >
                                {request.status}
                              </Badge>
                            </div>
                            <p className="text-purple-200 text-sm mb-1">
                              From: {request.customerName} • For: {request.recipientName}
                            </p>
                            <p className="text-purple-200 text-sm">
                              Occasion: {request.occasion} • Due: {format(new Date(request.deadline), "MMM d, yyyy")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-white">${request.amount}</p>
                            <p className="text-purple-200 text-sm">
                              {format(new Date(request.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-purple-200 text-sm font-medium mb-2">Special Instructions:</p>
                          <p className="text-white bg-white/5 p-3 rounded-lg">{request.instructions}</p>
                        </div>

                        {request.status === "pending" && (
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleBookingAction(request.id, "accept")}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Accept Request
                            </Button>
                            <Button
                              onClick={() => handleBookingAction(request.id, "decline")}
                              variant="outline"
                              className="flex-1 bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar" className="space-y-6">
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Availability Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Calendar Integration</h3>
                    <p className="text-purple-200 mb-6">
                      Manage your availability and schedule booking slots for your fans.
                    </p>
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      <Settings className="w-4 h-4 mr-2" />
                      Set Availability
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        {session.user?.image ? (
                          <img
                            src={session.user.image || "/placeholder.svg"}
                            alt={session.user.name || "Profile"}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-white" />
                        )}
                      </div>
                      <Button
                        size="icon"
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 hover:bg-purple-700"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{session.user?.name}</h3>
                      <p className="text-purple-200">{session.user?.email}</p>
                      <Badge className="bg-yellow-500/20 text-yellow-300 mt-2">
                        <Star className="w-3 h-3 mr-1" />
                        Verified Celebrity
                      </Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-white font-semibold">Basic Information</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-purple-200 text-sm">Display Name</label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-white">{session.user?.name}</span>
                            <Button size="icon" variant="ghost" className="w-6 h-6 text-purple-400">
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label className="text-purple-200 text-sm">Category</label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-white">Actor</span>
                            <Button size="icon" variant="ghost" className="w-6 h-6 text-purple-400">
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label className="text-purple-200 text-sm">Price per Video</label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-white">$150</span>
                            <Button size="icon" variant="ghost" className="w-6 h-6 text-purple-400">
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-semibold">Settings</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-purple-200">Accept New Bookings</span>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Enabled
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-purple-200">Auto-Accept Bookings</span>
                          <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white">
                            Disabled
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-purple-200">Email Notifications</span>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Enabled
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      <Settings className="w-4 h-4 mr-2" />
                      Update Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Footer />
      </div>
    </div>
  )
}
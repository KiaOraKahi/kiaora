"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VideoUploadModal } from "@/components/video-upload-modal"
import StripeConnectOnboarding from "@/components/stripe-connect-onboarding"
import { toast } from "sonner"
import {
  DollarSign,
  Calendar,
  MessageSquare,
  User,
  TrendingUp,
  Star,
  CheckCircle,
  XCircle,
  Settings,
  Camera,
  BarChart3,
  Loader2,
  Save,
  AlertCircle,
  Upload,
  Eye,
  Package,
  Filter,
  Share2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageCircle,
  Copy,
  Heart,
  CreditCard,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface DashboardStats {
  totalEarnings: number
  monthlyEarnings: number
  pendingRequests: number
  completedBookings: number
  averageRating: number
  totalReviews: number
  responseRate: number
  averageResponseTime: number
  completionRate: number
}

interface BookingRequest {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerImage: string | null
  recipientName: string
  occasion: string
  instructions: string
  amount: number
  requestedDate: string
  status: string
  createdAt: string
  deadline: string
  paymentStatus: string
  videoUrl?: string
}

interface CelebrityProfile {
  id: string
  name: string
  email: string
  image: string | null
  bio: string
  longBio: string
  category: string
  pricePersonal: number
  priceBusiness: number
  priceCharity: number
  isActive: boolean
  verified: boolean
  responseTime: string
  nextAvailable: string
  tags: string[]
  achievements: string[]
}

interface Review {
  id: string
  rating: number
  comment: string
  verified: boolean
  occasion: string
  createdAt: string
  user: {
    name: string
    image: string | null
  }
  orderNumber: string | null
}

interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export default function CelebrityDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [orderFilter, setOrderFilter] = useState("all")
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([])
  const [allOrders, setAllOrders] = useState<BookingRequest[]>([])
  const [profile, setProfile] = useState<CelebrityProfile | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Check if user is a celebrity
  const isCelebrity = session?.user?.role === "CELEBRITY"

  useEffect(() => {
    if (status === "loading") return

    if (!session || !isCelebrity) {
      console.log("❌ Celebrity Dashboard - Unauthorized access")
      return
    }

    fetchDashboardData()
    fetchBookingRequests()
    fetchAllOrders()
    fetchProfile()
    fetchReviews()
  }, [session, status, isCelebrity])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/celebrity/stats")

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Celebrity Dashboard - Stats fetch failed:", errorText)
        throw new Error(`Failed to fetch stats: ${response.status} ${errorText}`)
      }

      const data = await response.json()

      // Ensure all numeric fields have default values
      setStats({
        totalEarnings: data.totalEarnings || 0,
        monthlyEarnings: data.monthlyEarnings || 0,
        pendingRequests: data.pendingRequests || 0,
        completedBookings: data.completedBookings || 0,
        averageRating: data.averageRating || 4.5,
        totalReviews: data.totalReviews || 0,
        responseRate: data.responseRate || 95,
        averageResponseTime: data.averageResponseTime || 24,
        completionRate: data.completionRate || 95,
      })
    } catch (error) {
      console.error("❌ Celebrity Dashboard - Error fetching stats:", error)
      setError(error instanceof Error ? error.message : "Failed to load dashboard")
      // Set default stats if API fails
      setStats({
        totalEarnings: 0,
        monthlyEarnings: 0,
        pendingRequests: 0,
        completedBookings: 0,
        averageRating: 4.5,
        totalReviews: 0,
        responseRate: 95,
        averageResponseTime: 24,
        completionRate: 95,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBookingRequests = async () => {
    try {
      setRequestsLoading(true)
      const response = await fetch("/api/celebrity/booking-requests?status=PENDING&limit=20")

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Celebrity Dashboard - Booking requests fetch failed:", errorText)
        throw new Error(`Failed to fetch booking requests: ${response.status} ${errorText}`)
      }

      const data = await response.json()

      // Transform the data to match our interface
      const transformedRequests = (data.requests || []).map((request: any) => ({
        id: request.id,
        orderNumber: request.orderNumber,
        customerName: request.customerName,
        customerEmail: request.customerEmail || "",
        customerImage: request.customerImage,
        recipientName: request.recipientName,
        occasion: request.occasion,
        instructions: request.instructions,
        amount: request.amount,
        requestedDate: request.requestedDate,
        status: request.status,
        createdAt: request.createdAt,
        deadline: request.deadline,
        paymentStatus: request.paymentStatus,
        videoUrl: request.videoUrl,
      }))

      setBookingRequests(transformedRequests)
    } catch (error) {
      console.error("❌ Celebrity Dashboard - Error fetching booking requests:", error)
      setBookingRequests([])
    } finally {
      setRequestsLoading(false)
    }
  }

  const fetchAllOrders = async () => {
    try {
      setOrdersLoading(true)
      const response = await fetch("/api/celebrity/booking-requests?status=ALL&limit=100")

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Celebrity Dashboard - All orders fetch failed:", errorText)
        throw new Error(`Failed to fetch all orders: ${response.status} ${errorText}`)
      }

      const data = await response.json()

      // Transform the data to match our interface
      const transformedOrders = (data.requests || []).map((request: any) => ({
        id: request.id,
        orderNumber: request.orderNumber,
        customerName: request.customerName,
        customerEmail: request.customerEmail || "",
        customerImage: request.customerImage,
        recipientName: request.recipientName,
        occasion: request.occasion,
        instructions: request.instructions,
        amount: request.amount,
        requestedDate: request.requestedDate,
        status: request.status,
        createdAt: request.createdAt,
        deadline: request.deadline,
        paymentStatus: request.paymentStatus,
        videoUrl: request.videoUrl,
      }))

      setAllOrders(transformedOrders)
    } catch (error) {
      console.error("❌ Celebrity Dashboard - Error fetching all orders:", error)
      setAllOrders([])
    } finally {
      setOrdersLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      console.log("👤 Celebrity Dashboard - Fetching profile...")
      setProfileLoading(true)
      setProfileError(null)
      const response = await fetch("/api/celebrity/profile")

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Celebrity Dashboard - Profile fetch failed:", errorText)
        throw new Error(`Failed to fetch profile: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      setProfile(data)
      console.log("✅ Celebrity Dashboard - Profile loaded successfully")
    } catch (error) {
      console.error("❌ Celebrity Dashboard - Error fetching profile:", error)
      setProfileError(error instanceof Error ? error.message : "Failed to load profile")
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      console.log("⭐ Celebrity Dashboard - Fetching reviews...")
      setReviewsLoading(true)
      const response = await fetch("/api/celebrity/reviews")

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Celebrity Dashboard - Reviews fetch failed:", errorText)
        throw new Error(`Failed to fetch reviews: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      setReviews(data.reviews || [])
      setReviewStats(data.stats || null)
      console.log("✅ Celebrity Dashboard - Reviews loaded successfully")
    } catch (error) {
      console.error("❌ Celebrity Dashboard - Error fetching reviews:", error)
      setReviews([])
      setReviewStats(null)
    } finally {
      setReviewsLoading(false)
    }
  }

  const handleBookingAction = async (requestId: string, action: "accept" | "decline") => {
    try {
      const response = await fetch(`/api/celebrity/booking-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Celebrity Dashboard - Failed to ${action} booking:`, errorText)
        throw new Error(`Failed to update booking: ${response.status} ${errorText}`)
      }

      const result = await response.json()

      // Update local state immediately
      setBookingRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? { ...request, status: action === "accept" ? "confirmed" : "cancelled" } : request,
        ),
      )

      // Refresh stats and all orders
      await fetchDashboardData()
      await fetchAllOrders()
    } catch (error) {
      console.error(`❌ Celebrity Dashboard - Error ${action}ing booking:`, error)
    }
  }

  const handleVideoUploadSuccess = () => {
    // Refresh all orders and stats after successful upload
    fetchAllOrders()
    fetchDashboardData()
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    try {
      console.log("💾 Celebrity Dashboard - Saving profile...")
      setProfileSaving(true)
      setProfileError(null)
      setProfileSuccess(false)

      const response = await fetch("/api/celebrity/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Celebrity Dashboard - Profile save failed:", errorText)
        throw new Error(`Failed to save profile: ${response.status} ${errorText}`)
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setProfileSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (error) {
      console.error("❌ Celebrity Dashboard - Error saving profile:", error)
      setProfileError(error instanceof Error ? error.message : "Failed to save profile")
    } finally {
      setProfileSaving(false)
    }
  }

  const updateProfile = (field: keyof CelebrityProfile, value: any) => {
    if (!profile) return
    setProfile({ ...profile, [field]: value })
  }

  // Social sharing functions
  const shareToSocial = (platform: string) => {
    if (!profile) return
    const profileUrl = `${window.location.origin}/celebrities/${profile.id}`
    const shareText = `Check out ${profile.name} on Kia Ora! Get personalized video messages from your favorite celebrity.`

    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}&quote=${encodeURIComponent(shareText)}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(shareText)}&hashtags=KiaOra,Celebrity,PersonalizedMessage`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}&title=${encodeURIComponent(`${profile.name} on Kia Ora`)}&summary=${encodeURIComponent(shareText)}`
        break
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${profileUrl}`)}`
        break
      case "instagram":
        // Instagram doesn't support direct URL sharing, so we'll copy to clipboard
        navigator.clipboard.writeText(`${shareText} ${profileUrl}`)
        toast.success("Copied to Clipboard!", {
          description: "Share text copied! You can now paste it on Instagram.",
        })
        return
      default:
        return
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
      toast.success("Shared Successfully!", {
        description: `Profile shared on ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`,
      })
    }
  }

  const copyProfileLink = async () => {
    if (!profile) return
    const profileUrl = `${window.location.origin}/celebrities/${profile.id}`
    try {
      await navigator.clipboard.writeText(profileUrl)
      toast.success("Link Copied!", {
        description: "Profile link copied to clipboard!",
      })
    } catch (error) {
      toast.error("Copy Failed!", {
        description: "Failed to copy link. Please try again!",
      })
    }
  }

  // Filter orders based on selected filter
  const getFilteredOrders = () => {
    if (orderFilter === "all") return allOrders
    if (orderFilter === "pending") return allOrders.filter((order) => order.status === "pending")
    if (orderFilter === "confirmed") return allOrders.filter((order) => order.status === "confirmed")
    if (orderFilter === "completed") return allOrders.filter((order) => order.status === "completed")
    if (orderFilter === "cancelled") return allOrders.filter((order) => order.status === "cancelled")
    return allOrders
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-400"}`} />
    ))
  }

  if (status === "loading" || loading) {
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
        <div className="relative z-10 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white">Loading your dashboard...</p>
        </div>
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
        <div className="container mx-auto px-4 pt-8 pb-12">
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
                value="payments"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Payments
              </TabsTrigger>
              <TabsTrigger
                value="requests"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Requests ({bookingRequests.filter((r) => r.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                <Package className="w-4 h-4 mr-2" />
                Orders ({allOrders.length})
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                <Star className="w-4 h-4 mr-2" />
                Reviews ({reviewStats?.totalReviews || 0})
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
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-200 text-sm font-medium">Total Earnings</p>
                          <p className="text-2xl font-bold text-white">
                            ${(stats.totalEarnings || 0).toLocaleString()}
                          </p>
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
                          <p className="text-2xl font-bold text-white">
                            ${(stats.monthlyEarnings || 0).toLocaleString()}
                          </p>
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
                          <p className="text-purple-200 text-sm font-medium">Average Rating</p>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold text-white">
                              {(reviewStats?.averageRating || 4.5).toFixed(1)}
                            </p>
                            <div className="flex">{renderStars(Math.round(reviewStats?.averageRating || 4.5))}</div>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                          <Star className="w-6 h-6 text-yellow-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-200 text-sm font-medium">Total Orders</p>
                          <p className="text-2xl font-bold text-white">{allOrders.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-purple-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Social Sharing Section */}
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Share Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-200 mb-4">
                    Promote your celebrity profile on social media to attract more fans and bookings!
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <Button
                      onClick={() => shareToSocial("facebook")}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                    <Button onClick={() => shareToSocial("twitter")} className="bg-sky-500 hover:bg-sky-600 text-white">
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                    <Button
                      onClick={() => shareToSocial("instagram")}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </Button>
                    <Button
                      onClick={() => shareToSocial("linkedin")}
                      className="bg-blue-700 hover:bg-blue-800 text-white"
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                    <Button
                      onClick={() => shareToSocial("whatsapp")}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button
                      onClick={copyProfileLink}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                  {profile && (
                    <div className="mt-4 p-3 bg-white/5 rounded-lg">
                      <p className="text-purple-200 text-sm mb-2">Your Profile URL:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-white text-sm bg-black/30 px-3 py-2 rounded">
                          {window.location.origin}/celebrities/{profile.id}
                        </code>
                        <Button
                          size="sm"
                          onClick={copyProfileLink}
                          variant="outline"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

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
                    {requestsLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                      </div>
                    ) : bookingRequests.filter((r) => r.status === "pending").length > 0 ? (
                      <>
                        {bookingRequests
                          .filter((r) => r.status === "pending")
                          .slice(0, 3)
                          .map((request) => (
                            <div
                              key={request.id}
                              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={request.customerImage || "/placeholder.svg"} />
                                  <AvatarFallback>{request.customerName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-white font-medium text-sm">{request.orderNumber}</p>
                                  <p className="text-purple-200 text-xs">
                                    {request.occasion} for {request.recipientName}
                                  </p>
                                  <p className="text-purple-300 text-xs">From: {request.customerName}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">
                                  ${(request.amount || 0).toLocaleString()}
                                </Badge>
                                <p className="text-xs text-purple-400 mt-1">
                                  {format(new Date(request.createdAt), "MMM d")}
                                </p>
                              </div>
                            </div>
                          ))}
                        <Button
                          variant="outline"
                          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                          onClick={() => setActiveTab("requests")}
                        >
                          View All Requests ({bookingRequests.filter((r) => r.status === "pending").length})
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <MessageSquare className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-purple-200 text-sm">No pending requests</p>
                        <p className="text-purple-400 text-xs">New requests will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Recent Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reviewsLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                      </div>
                    ) : reviews.length > 0 ? (
                      <>
                        {reviews.slice(0, 3).map((review) => (
                          <div key={review.id} className="p-3 bg-white/5 rounded-lg">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={review.user.image || "/placeholder.svg"} />
                                <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-white font-medium text-sm">{review.user.name}</p>
                                  <div className="flex">{renderStars(review.rating)}</div>
                                  {review.verified && (
                                    <Badge className="bg-green-500/20 text-green-300 text-xs">Verified</Badge>
                                  )}
                                </div>
                                <p className="text-purple-200 text-xs mb-1">{review.occasion}</p>
                                <p className="text-white text-sm">{review.comment}</p>
                                <p className="text-purple-400 text-xs mt-1">
                                  {format(new Date(review.createdAt), "MMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                          onClick={() => setActiveTab("reviews")}
                        >
                          View All Reviews ({reviews.length})
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-purple-200 text-sm">No reviews yet</p>
                        <p className="text-purple-400 text-xs">Reviews from customers will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Payments Tab - NEW */}
            <TabsContent value="payments" className="space-y-6">
              <StripeConnectOnboarding />
            </TabsContent>

            {/* Booking Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Booking Requests ({bookingRequests.filter((r) => r.status === "pending").length} pending)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {requestsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    </div>
                  ) : bookingRequests.filter((r) => r.status === "pending").length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-white font-semibold mb-2">No pending requests</p>
                      <p className="text-purple-200">New booking requests will appear here.</p>
                    </div>
                  ) : (
                    bookingRequests
                      .filter((r) => r.status === "pending")
                      .map((request) => (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={request.customerImage || "/placeholder.svg"} />
                                <AvatarFallback>{request.customerName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-white">{request.orderNumber}</h3>
                                  <Badge className="bg-yellow-500/20 text-yellow-300">{request.status}</Badge>
                                </div>
                                <p className="text-purple-200 text-sm mb-1">
                                  <strong>From:</strong> {request.customerName}
                                </p>
                                <p className="text-purple-200 text-sm mb-1">
                                  <strong>For:</strong> {request.recipientName}
                                </p>
                                <p className="text-purple-200 text-sm mb-2">
                                  <strong>Occasion:</strong> {request.occasion}
                                </p>
                                <p className="text-purple-200 text-sm">
                                  <strong>Due:</strong> {format(new Date(request.deadline), "MMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-white">${(request.amount || 0).toLocaleString()}</p>
                              <p className="text-purple-200 text-sm">
                                {format(new Date(request.createdAt), "MMM d, yyyy")}
                              </p>
                              <Badge
                                className={`mt-2 ${request.paymentStatus === "SUCCEEDED" ? "bg-green-500/20 text-green-300" : "bg-orange-500/20 text-orange-300"}`}
                              >
                                {request.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                          <div className="mb-4">
                            <p className="text-purple-200 text-sm font-medium mb-2">Special Instructions:</p>
                            <p className="text-white bg-white/5 p-3 rounded-lg">
                              {request.instructions || "No special instructions provided"}
                            </p>
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

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      All Orders ({getFilteredOrders().length})
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-purple-300" />
                      <Select value={orderFilter} onValueChange={setOrderFilter}>
                        <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Orders</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ordersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    </div>
                  ) : getFilteredOrders().length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-white font-semibold mb-2">No orders found</p>
                      <p className="text-purple-200">
                        {orderFilter === "all"
                          ? "Orders will appear here when you receive bookings."
                          : `No ${orderFilter} orders found.`}
                      </p>
                    </div>
                  ) : (
                    getFilteredOrders().map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={order.customerImage || "/placeholder.svg"} />
                              <AvatarFallback>{order.customerName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-white">{order.orderNumber}</h3>
                                <Badge className={getStatusBadgeColor(order.status)}>
                                  {order.status
                                    ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                                    : "Unknown"}
                                </Badge>
                              </div>
                              <p className="text-purple-200 text-sm mb-1">
                                <strong>From:</strong> {order.customerName}
                              </p>
                              <p className="text-purple-200 text-sm mb-1">
                                <strong>For:</strong> {order.recipientName}
                              </p>
                              <p className="text-purple-200 text-sm mb-2">
                                <strong>Occasion:</strong> {order.occasion}
                              </p>
                              <p className="text-purple-200 text-sm">
                                <strong>Deadline:</strong> {format(new Date(order.deadline), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-white">${(order.amount || 0).toLocaleString()}</p>
                            <p className="text-purple-200 text-sm">
                              {format(new Date(order.createdAt), "MMM d, yyyy")}
                            </p>
                            <Badge className="bg-green-500/20 text-green-300 mt-2">Paid</Badge>
                          </div>
                        </div>
                        <div className="mb-4">
                          <p className="text-purple-200 text-sm font-medium mb-2">Message Instructions:</p>
                          <p className="text-white bg-white/5 p-3 rounded-lg">
                            {order.instructions || "No special instructions provided"}
                          </p>
                        </div>
                        {/* Action buttons based on status */}
                        <div className="flex gap-3">
                          {order.status === "confirmed" && !order.videoUrl && (
                            <VideoUploadModal
                              bookingId={order.id}
                              orderNumber={order.orderNumber}
                              customerName={order.customerName}
                              onUploadSuccess={handleVideoUploadSuccess}
                            >
                              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Video
                              </Button>
                            </VideoUploadModal>
                          )}
                          {order.status === "completed" && order.videoUrl && (
                            <div className="flex-1 flex items-center gap-2 p-3 bg-green-500/20 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-green-400" />
                              <span className="text-green-300 font-medium">Video Delivered</span>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              {/* Review Stats */}
              {reviewStats && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        Review Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-6">
                        <div className="text-4xl font-bold text-white mb-2">{reviewStats.averageRating.toFixed(1)}</div>
                        <div className="flex justify-center mb-2">
                          {renderStars(Math.round(reviewStats.averageRating))}
                        </div>
                        <p className="text-purple-200">
                          Based on {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Rating Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center gap-3">
                            <div className="flex items-center gap-1 w-12">
                              <span className="text-white text-sm">{rating}</span>
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            </div>
                            <div className="flex-1 bg-white/10 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{
                                  width: `${reviewStats.totalReviews > 0 ? (reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution] / reviewStats.totalReviews) * 100 : 0}%`,
                                }}
                              />
                            </div>
                            <span className="text-purple-200 text-sm w-8">
                              {reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* All Reviews */}
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    All Reviews ({reviews.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviewsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-white font-semibold mb-2">No reviews yet</p>
                      <p className="text-purple-200">
                        Reviews from your customers will appear here after they complete their orders.
                      </p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={review.user.image || "/placeholder.svg"} />
                            <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{review.user.name}</h3>
                              <div className="flex">{renderStars(review.rating)}</div>
                              {review.verified && (
                                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mb-3 text-sm text-purple-200">
                              <span>
                                <strong>Occasion:</strong> {review.occasion}
                              </span>
                              {review.orderNumber && (
                                <span>
                                  <strong>Order:</strong> {review.orderNumber}
                                </span>
                              )}
                              <span>{format(new Date(review.createdAt), "MMM d, yyyy")}</span>
                            </div>
                            {review.comment && (
                              <div className="bg-white/5 p-4 rounded-lg">
                                <p className="text-white leading-relaxed">{review.comment}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-4 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                              >
                                <Heart className="w-4 h-4 mr-2" />
                                Thank Customer
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share Review
                              </Button>
                            </div>
                          </div>
                        </div>
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
              {profileLoading ? (
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardContent className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  </CardContent>
                </Card>
              ) : profile ? (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Profile Header */}
                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Profile Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Success/Error Messages */}
                      {profileSuccess && (
                        <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-green-300">Profile updated successfully!</span>
                        </div>
                      )}
                      {profileError && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <span className="text-red-300">{profileError}</span>
                        </div>
                      )}

                      {/* Profile Picture */}
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            {profile.image ? (
                              <img
                                src={profile.image || "/placeholder.svg"}
                                alt={profile.name || "Profile"}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-12 h-12 text-white" />
                            )}
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 hover:bg-purple-700"
                          >
                            <Camera className="w-4 h-4" />
                          </Button>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{profile.name}</h3>
                          <p className="text-purple-200">{profile.email}</p>
                          <Badge className="bg-yellow-500/20 text-yellow-300 mt-2">
                            <Star className="w-3 h-3 mr-1" />
                            {profile.verified ? "Verified Celebrity" : "Pending Verification"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Basic Information */}
                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                    <CardHeader>
                      <CardTitle className="text-white">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-purple-200">
                            Category
                          </Label>
                          <Select value={profile.category} onValueChange={(value) => updateProfile("category", value)}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Actor">Actor</SelectItem>
                              <SelectItem value="Musician">Musician</SelectItem>
                              <SelectItem value="Athlete">Athlete</SelectItem>
                              <SelectItem value="Comedian">Comedian</SelectItem>
                              <SelectItem value="Influencer">Influencer</SelectItem>
                              <SelectItem value="TV Personality">TV Personality</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="responseTime" className="text-purple-200">
                            Response Time
                          </Label>
                          <Select
                            value={profile.responseTime}
                            onValueChange={(value) => updateProfile("responseTime", value)}
                          >
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select response time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1 hour">1 hour</SelectItem>
                              <SelectItem value="6 hours">6 hours</SelectItem>
                              <SelectItem value="12 hours">12 hours</SelectItem>
                              <SelectItem value="24 hours">24 hours</SelectItem>
                              <SelectItem value="48 hours">48 hours</SelectItem>
                              <SelectItem value="72 hours">72 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-purple-200">
                          Short Bio
                        </Label>
                        <Input
                          id="bio"
                          value={profile.bio}
                          onChange={(e) => updateProfile("bio", e.target.value)}
                          placeholder="A brief description about yourself..."
                          className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                          maxLength={150}
                        />
                        <p className="text-xs text-purple-400">{profile.bio.length}/150 characters</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longBio" className="text-purple-200">
                          Long Bio
                        </Label>
                        <Textarea
                          id="longBio"
                          value={profile.longBio}
                          onChange={(e) => updateProfile("longBio", e.target.value)}
                          placeholder="Tell your fans more about yourself, your career, achievements..."
                          className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 min-h-[120px]"
                          maxLength={1000}
                        />
                        <p className="text-xs text-purple-400">{profile.longBio.length}/1000 characters</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pricing */}
                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Pricing Structure
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pricePersonal" className="text-purple-200">
                            Personal Messages
                          </Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                            <Input
                              id="pricePersonal"
                              type="number"
                              value={profile.pricePersonal}
                              onChange={(e) => updateProfile("pricePersonal", Number.parseFloat(e.target.value) || 0)}
                              className="bg-white/10 border-white/20 text-white pl-10"
                              min="1"
                              step="1"
                            />
                          </div>
                          <p className="text-xs text-purple-400">Birthday wishes, congratulations, etc.</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priceBusiness" className="text-purple-200">
                            Business Messages
                          </Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                            <Input
                              id="priceBusiness"
                              type="number"
                              value={profile.priceBusiness}
                              onChange={(e) => updateProfile("priceBusiness", Number.parseFloat(e.target.value) || 0)}
                              className="bg-white/10 border-white/20 text-white pl-10"
                              min="1"
                              step="1"
                            />
                          </div>
                          <p className="text-xs text-purple-400">Corporate events, promotions, etc.</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priceCharity" className="text-purple-200">
                            Charity Messages
                          </Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                            <Input
                              id="priceCharity"
                              type="number"
                              value={profile.priceCharity}
                              onChange={(e) => updateProfile("priceCharity", Number.parseFloat(e.target.value) || 0)}
                              className="bg-white/10 border-white/20 text-white pl-10"
                              min="1"
                              step="1"
                            />
                          </div>
                          <p className="text-xs text-purple-400">Fundraising, awareness campaigns, etc.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Availability */}
                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Availability Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nextAvailable" className="text-purple-200">
                            Next Available Date
                          </Label>
                          <Input
                            id="nextAvailable"
                            type="date"
                            value={profile.nextAvailable}
                            onChange={(e) => updateProfile("nextAvailable", e.target.value)}
                            className="bg-white/10 border-white/20 text-white"
                          />
                          <p className="text-xs text-purple-400">When you can next fulfill requests</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-purple-200">Accepting New Bookings</Label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={profile.isActive}
                              onCheckedChange={(checked) => updateProfile("isActive", checked)}
                            />
                            <span className="text-white">
                              {profile.isActive ? "Currently accepting" : "Not accepting"}
                            </span>
                          </div>
                          <p className="text-xs text-purple-400">Turn off to pause new booking requests</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={profileSaving}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {profileSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardContent className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Profile Not Found</h3>
                    <p className="text-purple-200">Unable to load your profile information.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

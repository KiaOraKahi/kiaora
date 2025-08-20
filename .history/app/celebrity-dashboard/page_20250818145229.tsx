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
import jsPDF from 'jspdf'
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
  Gift,
  Clock,
  PlayCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface DashboardStats {
  totalEarnings: number
  orderEarnings: number
  tipEarnings: number
  pendingEarnings: number // 🔥 NEW: Money for confirmed but not delivered bookings
  monthlyEarnings: number
  monthlyOrderEarnings: number
  monthlyTipEarnings: number
  monthlyPendingEarnings: number // 🔥 NEW: Monthly pending earnings
  pendingRequests: number
  confirmedBookings: number // 🔥 NEW: Accepted but not delivered
  completedBookings: number
  totalBookings: number
  averageRating: number
  totalReviews: number
  responseRate: number
  averageResponseTime: number
  completionRate: number
  // 🔥 NEW: Approval-related stats
  pendingApprovalCount: number
  approvedThisMonth: number
  declinedThisMonth: number
}

// Mock data for tips and payments
const mockTips = [
  {
    id: "1",
    orderNumber: "REQ-001",
    message: "Amazing video! Thank you!",
    amount: 5000, // $50.00
    status: "PAID",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    orderNumber: "REQ-002",
    message: "Fantastic work!",
    amount: 10000, // $100.00
    status: "PENDING",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    orderNumber: "REQ-003",
    message: "Love it!",
    amount: 2500, // $25.00
    status: "PAID",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const mockPayments = [
  {
    id: "1",
    orderNumber: "REQ-001",
    recipientName: "John Smith",
    amount: 239200, // $2,392.00
    status: "PAID",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    orderNumber: "REQ-002",
    recipientName: "Sarah Johnson",
    amount: 159200, // $1,592.00
    status: "PAID",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    orderNumber: "REQ-003",
    recipientName: "Mike Wilson",
    amount: 119200, // $1,192.00
    status: "PENDING",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

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
  celebrityAmount: number
  tipAmount: number
  totalEarnings: number
  requestedDate: string
  status: string
  createdAt: string
  deadline: string
  paymentStatus: string
  videoUrl?: string
  // 🔥 NEW: Approval fields
  approvalStatus?: string
  approvedAt?: string
  declinedAt?: string
  declineReason?: string
  revisionCount?: number
  tips: Array<{
    id: string
    amount: number
    message: string | null
    createdAt: string
  }>
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
    // fetchReviews()
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
        orderEarnings: data.orderEarnings || 0,
        tipEarnings: data.tipEarnings || 0,
        pendingEarnings: data.pendingEarnings || 0, // 🔥 NEW
        monthlyEarnings: data.monthlyEarnings || 0,
        monthlyOrderEarnings: data.monthlyOrderEarnings || 0,
        monthlyTipEarnings: data.monthlyTipEarnings || 0,
        monthlyPendingEarnings: data.monthlyPendingEarnings || 0, // 🔥 NEW
        pendingRequests: data.pendingRequests || 0,
        confirmedBookings: data.confirmedBookings || 0, // 🔥 NEW
        completedBookings: data.completedBookings || 0,
        totalBookings: data.totalBookings || 0,
        averageRating: data.averageRating || 4.5,
        totalReviews: data.totalReviews || 0,
        responseRate: data.responseRate || 95,
        averageResponseTime: data.averageResponseTime || 24,
        completionRate: data.completionRate || 95,
        // 🔥 NEW: Approval stats
        pendingApprovalCount: data.pendingApprovalCount || 0,
        approvedThisMonth: data.approvedThisMonth || 0,
        declinedThisMonth: data.declinedThisMonth || 0,
      })
    } catch (error) {
      console.error("❌ Celebrity Dashboard - Error fetching stats:", error)
      setError(error instanceof Error ? error.message : "Failed to load dashboard")
      // Set default stats if API fails
      setStats({
        totalEarnings: 0,
        orderEarnings: 0,
        tipEarnings: 0,
        pendingEarnings: 0,
        monthlyEarnings: 0,
        monthlyOrderEarnings: 0,
        monthlyTipEarnings: 0,
        monthlyPendingEarnings: 0,
        pendingRequests: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        totalBookings: 0,
        averageRating: 4.5,
        totalReviews: 0,
        responseRate: 95,
        averageResponseTime: 24,
        completionRate: 95,
        pendingApprovalCount: 0,
        approvedThisMonth: 0,
        declinedThisMonth: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBookingRequests = async () => {
    try {
      setRequestsLoading(true)
      const response = await fetch("/api/celebrity/booking-requests?status=ALL&limit=10")
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
        celebrityAmount: request.celebrityAmount || 0,
        tipAmount: request.tipAmount || 0,
        totalEarnings: request.totalEarnings || 0,
        requestedDate: request.requestedDate,
        status: request.status,
        createdAt: request.createdAt,
        deadline: request.deadline,
        paymentStatus: request.paymentStatus,
        videoUrl: request.videoUrl,
        // 🔥 NEW: Approval fields
        approvalStatus: request.approvalStatus,
        approvedAt: request.approvedAt,
        declinedAt: request.declinedAt,
        declineReason: request.declineReason,
        revisionCount: request.revisionCount || 0,
        tips: request.tips || [],
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
        celebrityAmount: request.celebrityAmount || 0,
        tipAmount: request.tipAmount || 0,
        totalEarnings: request.totalEarnings || 0,
        requestedDate: request.requestedDate,
        status: request.status,
        createdAt: request.createdAt,
        deadline: request.deadline,
        paymentStatus: request.paymentStatus,
        videoUrl: request.videoUrl,
        // 🔥 NEW: Approval fields
        approvalStatus: request.approvalStatus,
        approvedAt: request.approvedAt,
        declinedAt: request.declinedAt,
        declineReason: request.declineReason,
        revisionCount: request.revisionCount || 0,
        tips: request.tips || [],
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

  // const fetchReviews = async () => {
  //   try {
  //     console.log("⭐ Celebrity Dashboard - Fetching reviews...")
  //     setReviewsLoading(true)
  //     const response = await fetch("/api/celebrity/reviews")
  //     if (!response.ok) {
  //       const errorText = await response.text()
  //       console.error("❌ Celebrity Dashboard - Reviews fetch failed:", errorText)
  //       throw new Error(`Failed to fetch reviews: ${response.status} ${errorText}`)
  //     }
  //     const data = await response.json()
  //     setReviews(data.reviews || [])
  //     setReviewStats(data.stats || null)
  //     console.log("✅ Celebrity Dashboard - Reviews loaded successfully")
  //   } catch (error) {
  //     console.error("❌ Celebrity Dashboard - Error fetching reviews:", error)
  //     setReviews([])
  //     setReviewStats(null)
  //   } finally {
  //     setReviewsLoading(false)
  //   }
  // }

  const handleBookingAction = async (requestId: string, action: "accept" | "decline") => {
    console.log(`🔍 handleBookingAction called with:`, { requestId, action })
    
    try {
      console.log(`📡 Making API call to: /api/celebrity/booking-requests/${requestId}`)
      
      const response = await fetch(`/api/celebrity/booking-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })
      
      console.log(`📡 API Response:`, { status: response.status, ok: response.ok })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Celebrity Dashboard - Failed to ${action} booking:`, errorText)
        throw new Error(`Failed to update booking: ${response.status} ${errorText}`)
      }
      
      const result = await response.json()
      console.log(`✅ API Success:`, result)

      // Update local state immediately
      setBookingRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? { ...request, status: action === "accept" ? "confirmed" : "cancelled" } : request,
        ),
      )

      // Refresh stats and all orders
      await fetchDashboardData()
      await fetchAllOrders()
      
      console.log(`🎉 Booking ${action}ed successfully!`)
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
    // 🔥 NEW: Approval-based filters
    if (orderFilter === "pending_approval")
      return allOrders.filter((order) => order.approvalStatus === "PENDING_APPROVAL")
    if (orderFilter === "approved") return allOrders.filter((order) => order.approvalStatus === "APPROVED")
    if (orderFilter === "declined") return allOrders.filter((order) => order.approvalStatus === "DECLINED")
    return allOrders
  }

  // 🔥 NEW: Get declined orders that need revision
  // const getDeclinedOrders = () => {
  //   return allOrders.filter((order) => order.approvalStatus?.toLowerCase() === "declined" && order.revisionCount || 0 < 2)
  // }
  const getDeclinedOrders = () => {
  return allOrders.filter((order) => 
    order.approvalStatus?.toLowerCase() === "declined" && 
    (order.revisionCount || 0) < 2
  )
}
  console.log("Declined orders", getDeclinedOrders());

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

  // 🔥 NEW: Get approval status badge color
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

  const exportToPDF = () => {
    try {
      const doc = new jsPDF()
      
      // Set up colors
      const primaryColor = [79, 70, 229] // Purple
      const greenColor = [34, 197, 94] // Green
      const yellowColor = [234, 179, 8] // Yellow
      const pinkColor = [236, 72, 153] // Pink
      const blueColor = [59, 130, 246] // Blue

      // Title
      doc.setFontSize(24)
      doc.setTextColor(...primaryColor)
      doc.text('Earnings Report', 20, 30)
      
      // Date
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated on: ${format(new Date(), "MMM d, yyyy 'at' h:mm a")}`, 20, 40)

      // Summary section
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text('Financial Summary', 20, 60)

      // Summary data
      doc.setFontSize(12)
      const summaryData = [
        { label: 'Total Earnings', value: stats ? `$${(stats.totalEarnings / 100).toLocaleString()}` : '$0.00', color: greenColor },
        { label: 'Pending Earnings', value: stats ? `$${(stats.pendingEarnings / 100).toLocaleString()}` : '$0.00', color: yellowColor },
        { label: 'Total Tips', value: stats ? `$${(stats.tipEarnings / 100).toLocaleString()}` : '$0.00', color: pinkColor },
        { label: 'Monthly Earnings', value: stats ? `$${(stats.monthlyEarnings / 100).toLocaleString()}` : '$0.00', color: blueColor },
      ]

      let yPos = 75
      summaryData.forEach((item) => {
        doc.setTextColor(0, 0, 0)
        doc.text(item.label, 20, yPos)
        doc.setTextColor(...item.color)
        doc.text(item.value, 120, yPos)
        yPos += 8
      })

      // Bar Chart
      yPos += 10
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text('Earnings Breakdown', 20, yPos)

      yPos += 15
      const chartWidth = 170
      const chartHeight = 60
      const chartX = 20
      const chartY = yPos

      // Chart background
      doc.setDrawColor(200, 200, 200)
      doc.setFillColor(245, 245, 245)
      doc.rect(chartX, chartY, chartWidth, chartHeight, 'F')

      // Calculate max value for scaling
      const maxValue = Math.max(
        stats?.totalEarnings || 0,
        stats?.pendingEarnings || 0,
        stats?.tipEarnings || 0,
        stats?.monthlyEarnings || 0
      )

      // Draw bars
      const barWidth = 30
      const barSpacing = 10
      const startX = chartX + 10
      const barY = chartY + chartHeight - 10

      summaryData.forEach((item, index) => {
        const x = startX + (barWidth + barSpacing) * index
        const value = parseFloat(item.value.replace(/[$,]/g, '')) * 100
        const barHeight = maxValue > 0 ? (value / maxValue) * (chartHeight - 20) : 0
        const barYPos = barY - barHeight

        // Bar
        doc.setFillColor(...item.color)
        doc.rect(x, barYPos, barWidth, barHeight, 'F')

        // Bar label
        doc.setFontSize(8)
        doc.setTextColor(0, 0, 0)
        doc.text(item.label.split(' ')[0], x, barY + 5, { align: 'center' })
        if (item.label.split(' ')[1]) {
          doc.text(item.label.split(' ')[1], x, barY + 10, { align: 'center' })
        }

        // Value on top of bar
        doc.setFontSize(8)
        doc.setTextColor(...item.color)
        doc.text(item.value, x, barYPos - 5, { align: 'center' })
      })

      // Recent transactions table
      yPos = chartY + chartHeight + 30
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text('Recent Transactions', 20, yPos)

      yPos += 10
      if (mockPayments.length > 0) {
        // Table headers
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text('Order', 20, yPos)
        doc.text('Amount', 80, yPos)
        doc.text('Status', 130, yPos)
        doc.text('Date', 170, yPos)

        yPos += 5
        doc.setDrawColor(200, 200, 200)
        doc.line(20, yPos, 190, yPos)

        // Table data
        mockPayments.slice(0, 5).forEach((payment) => {
          yPos += 8
          doc.setFontSize(9)
          doc.setTextColor(0, 0, 0)
          doc.text(payment.orderNumber, 20, yPos)
          doc.setTextColor(...greenColor)
          doc.text(`$${(payment.amount / 100).toFixed(2)}`, 80, yPos)
          const statusColor = payment.status === 'PAID' ? greenColor : yellowColor
          doc.setTextColor(statusColor[0], statusColor[1], statusColor[2])
          doc.text(payment.status, 130, yPos)
          doc.setTextColor(100, 100, 100)
          doc.text(format(new Date(payment.createdAt), "MMM d"), 170, yPos)
        })
      } else {
        yPos += 10
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text('No recent transactions', 20, yPos)
      }

      // Footer
      const pageHeight = doc.internal.pageSize.height
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text('Generated by Kia Ora - Celebrity Video Platform', 20, pageHeight - 20)
      doc.text('This is an automated report for your records', 20, pageHeight - 15)

      // Save the PDF
      const filename = `earnings_report_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(filename)
      
      toast.success('PDF report exported successfully!')
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('Failed to export PDF')
    }
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
              {/* <TabsTrigger value="reviews" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                <Star className="w-4 h-4 mr-2" />
                Reviews ({reviewStats?.totalReviews || 0})
              </TabsTrigger> */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-200 text-sm font-medium">Total Earnings</p>
                          <p className="text-2xl font-bold text-white">
                            ${(stats.totalEarnings || 0).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-green-400">
                              ${(stats.orderEarnings || 0).toLocaleString()} bookings
                            </span>
                            {stats.tipEarnings > 0 && (
                              <span className="text-xs text-yellow-400">
                                +${(stats.tipEarnings || 0).toLocaleString()} tips
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-green-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 🔥 NEW: Pending Approval Card */}
                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-200 text-sm font-medium">Pending Approval</p>
                          <p className="text-2xl font-bold text-orange-400">{stats.pendingApprovalCount || 0}</p>
                          <p className="text-xs text-purple-400 mt-1">Videos awaiting customer review</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                          <PlayCircle className="w-6 h-6 text-orange-400" />
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
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-green-400">{stats.approvedThisMonth || 0} approved</span>
                            {stats.declinedThisMonth > 0 && (
                              <span className="text-xs text-red-400">{stats.declinedThisMonth} declined</span>
                            )}
                          </div>
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
                          <p className="text-purple-200 text-sm font-medium">Tips Received</p>
                          <p className="text-2xl font-bold text-yellow-400">
                            ${(stats.tipEarnings || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-purple-400 mt-1">
                            This month: ${(stats.monthlyTipEarnings || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                          <Gift className="w-6 h-6 text-yellow-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
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
                  </Card> */}

                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-200 text-sm font-medium">Total Orders</p>
                          <p className="text-2xl font-bold text-white">{allOrders.length}</p>
                          <p className="text-xs text-purple-400 mt-1">
                            {allOrders.filter((o) => o.tipAmount > 0).length} with tips
                          </p>
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
                    ) : bookingRequests.length > 0 ? (
                      <>
                        {bookingRequests
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
                                <div className="flex flex-col gap-1">
                                  <Badge className="bg-green-500/20 text-green-300 text-xs">
                                    ${(request.celebrityAmount || 0).toLocaleString()}
                                  </Badge>
                                  {request.tipAmount > 0 && (
                                    <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">
                                      +${request.tipAmount.toLocaleString()} tip
                                    </Badge>
                                  )}
                                  <Badge 
                                    className={`text-xs ${
                                      request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                                      request.status === 'confirmed' ? 'bg-blue-500/20 text-blue-300' :
                                      request.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                                      request.status === 'cancelled' ? 'bg-red-500/20 text-red-300' :
                                      'bg-gray-500/20 text-gray-300'
                                    }`}
                                  >
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                  </Badge>
                                </div>
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
                          View All Requests ({bookingRequests.length})
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <MessageSquare className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-purple-200 text-sm">No recent requests</p>
                        <p className="text-purple-400 text-xs">New requests will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
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
                </Card> */}
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-6">
              <StripeConnectOnboarding />
              
              {/* Tips and Payments Dashboard */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Earnings & Tips</h2>
                    <p className="text-purple-200">Track your earnings and manage payouts</p>
                  </div>
                  <Button
                    onClick={exportToPDF}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-200 text-sm font-medium">Total Earnings</p>
                          <p className="text-2xl font-bold text-white">
                            {stats ? `$${(stats.totalEarnings / 100).toLocaleString()}` : "$0.00"}
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
                          <p className="text-purple-200 text-sm font-medium">Pending Earnings</p>
                          <p className="text-2xl font-bold text-white">
                            {stats ? `$${(stats.pendingEarnings / 100).toLocaleString()}` : "$0.00"}
                          </p>
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
                          <p className="text-purple-200 text-sm font-medium">Total Tips</p>
                          <p className="text-2xl font-bold text-white">
                            {stats ? `$${(stats.tipEarnings / 100).toLocaleString()}` : "$0.00"}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center">
                          <Gift className="w-6 h-6 text-pink-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-200 text-sm font-medium">Monthly Earnings</p>
                          <p className="text-2xl font-bold text-white">
                            {stats ? `$${(stats.monthlyEarnings / 100).toLocaleString()}` : "$0.00"}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tips and Payments Tabs */}
                <Tabs defaultValue="tips" className="space-y-6">
                  <TabsList className="bg-white/10 border-white/20 p-1">
                    <TabsTrigger value="tips" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                      <Gift className="w-4 h-4 mr-2" />
                      Tips
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Payments
                    </TabsTrigger>
                  </TabsList>

                  {/* Tips Tab */}
                  <TabsContent value="tips" className="space-y-6">
                    <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                      <CardHeader>
                        <CardTitle className="text-white">Recent Tips</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {mockTips.map((tip) => (
                            <div key={tip.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <div>
                                <p className="text-white font-medium">{tip.orderNumber}</p>
                                <p className="text-purple-200 text-sm">{tip.message}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-pink-400 font-semibold">${(tip.amount / 100).toFixed(2)}</p>
                                <Badge className={`${tip.status === 'PAID' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'} border-0`}>
                                  {tip.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Payments Tab */}
                  <TabsContent value="payments" className="space-y-6">
                    <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                      <CardHeader>
                        <CardTitle className="text-white">Recent Payments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {mockPayments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <div>
                                <p className="text-white font-medium">{payment.orderNumber}</p>
                                <p className="text-purple-200 text-sm">{payment.recipientName}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-green-400 font-semibold">${(payment.amount / 100).toFixed(2)}</p>
                                <Badge className={`${payment.status === 'PAID' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'} border-0`}>
                                  {payment.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
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
                              <div className="space-y-1">
                                <p className="text-lg font-bold text-green-400">
                                  ${(request.celebrityAmount || 0).toLocaleString()}
                                </p>
                                {request.tipAmount > 0 && (
                                  <p className="text-sm font-semibold text-yellow-400">
                                    +${request.tipAmount.toLocaleString()} tip
                                  </p>
                                )}
                                <p className="text-sm text-white">Total: ${request.totalEarnings.toLocaleString()}</p>
                              </div>
                              <p className="text-purple-200 text-sm mt-2">
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

                          {/* Display tips if any */}
                          {request.tips && request.tips.length > 0 && (
                            <div className="mb-4">
                              <p className="text-purple-200 text-sm font-medium mb-2">Tips Received:</p>
                              <div className="space-y-2">
                                {request.tips.map((tip) => (
                                  <div
                                    key={tip.id}
                                    className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-yellow-300 font-semibold">
                                        +${tip.amount.toLocaleString()} tip
                                      </span>
                                      <span className="text-purple-400 text-xs">
                                        {format(new Date(tip.createdAt), "MMM d, yyyy")}
                                      </span>
                                    </div>
                                    {tip.message && <p className="text-white text-sm mt-2">{tip.message}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {request.status === "pending" && (
                            <div className="flex gap-3">
                              <Button
                                onClick={() => {
                                  console.log(`🟢 Accept button clicked for request:`, request.id)
                                  handleBookingAction(request.id, "accept")
                                }}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Accept Request
                              </Button>
                              <Button
                                onClick={() => {
                                  console.log(`🔴 Decline button clicked for request:`, request.id)
                                  handleBookingAction(request.id, "decline")
                                }}
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
                        <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Orders</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="pending_approval">Pending Approval</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
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
                          : `No ${orderFilter.replace("_", " ")} orders found.`}
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
                                {/* 🔥 NEW: Approval Status Badge */}
                                {order.approvalStatus && (
                                  <Badge className={getApprovalStatusBadgeColor(order.approvalStatus)}>
                                    {order.approvalStatus.replace("_", " ")}
                                  </Badge>
                                )}
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
                            <div className="space-y-1">
                              <p className="text-lg font-bold text-green-400">
                                ${(order.celebrityAmount || 0).toLocaleString()}
                              </p>
                              {order.tipAmount > 0 && (
                                <p className="text-sm font-semibold text-yellow-400">
                                  +${order.tipAmount.toLocaleString()} tip
                                </p>
                              )}
                              <p className="text-sm text-white">Total: ${order.totalEarnings.toLocaleString()}</p>
                            </div>
                            <p className="text-purple-200 text-sm mt-2">
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

                        {/* 🔥 NEW: Decline Reason Display */}
                        {order.approvalStatus === "DECLINED" && order.declineReason && (
                          <div className="mb-4">
                            <p className="text-red-300 text-sm font-medium mb-2">Customer Feedback:</p>
                            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                              <p className="text-red-200 text-sm">{order.declineReason}</p>
                              {order.revisionCount && (
                                <p className="text-red-300 text-xs mt-2">
                                  Revision {order.revisionCount} of 2 requested
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Display tips if any */}
                        {order.tips && order.tips.length > 0 && (
                          <div className="mb-4">
                            <p className="text-purple-200 text-sm font-medium mb-2">Tips Received:</p>
                            <div className="space-y-2">
                              {order.tips.map((tip) => (
                                <div
                                  key={tip.id}
                                  className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-yellow-300 font-semibold">
                                      +${tip.amount.toLocaleString()} tip
                                    </span>
                                    <span className="text-purple-400 text-xs">
                                      {format(new Date(tip.createdAt), "MMM d, yyyy")}
                                    </span>
                                  </div>
                                  {tip.message && <p className="text-white text-sm mt-2">{tip.message}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

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
                          {/* 🔥 NEW: Pending Approval Status */}
                          {order.approvalStatus === "PENDING_APPROVAL" && order.videoUrl && (
                            <div className="flex-1 flex items-center gap-2 p-3 bg-orange-500/20 rounded-lg">
                              <Clock className="w-5 h-5 text-orange-400" />
                              <span className="text-orange-300 font-medium">Awaiting Customer Approval</span>
                            </div>
                          )}
                          {/* 🔥 NEW: Approved Status */}
                          {order.approvalStatus === "APPROVED" && order.videoUrl && (
                            <div className="flex-1 flex items-center gap-2 p-3 bg-green-500/20 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-green-400" />
                              <span className="text-green-300 font-medium">Video Approved & Delivered</span>
                            </div>
                          )}
                          {/* 🔥 NEW: Declined Status - Upload Revision */}
                          {order.approvalStatus === "DECLINED" && (order.revisionCount || 0) < 2 && (
                            <VideoUploadModal
                              bookingId={order.id}
                              orderNumber={order.orderNumber}
                              customerName={order.customerName}
                              onUploadSuccess={handleVideoUploadSuccess}
                            >
                              <Button className="flex-1 bg-yellow-600 hover:bg-yellow-700">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Revision ({(order.revisionCount || 0) + 1}/2)
                              </Button>
                            </VideoUploadModal>
                          )}
                          {/* Legacy completed status */}
                          {order.status === "completed" && !order.approvalStatus && order.videoUrl && (
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
            {/* <TabsContent value="reviews" className="space-y-6"> */}
              {/* Review Stats */}
              {/* {reviewStats && (
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
              )} */}

              {/* All Reviews */}
              {/* <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
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
                        Reviews from your customers will appear here after they approve their videos.
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
              </Card> */}
            {/* </TabsContent> */}

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
                    Edit Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profileLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    </div>
                  ) : profile ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      {profileSuccess && (
                        <div className="p-4 bg-green-500/20 text-green-300 rounded-lg flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Profile updated successfully!
                        </div>
                      )}
                      {profileError && (
                        <div className="p-4 bg-red-500/20 text-red-300 rounded-lg flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Error: {profileError}
                        </div>
                      )}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            type="text"
                            id="name"
                            value={profile.name}
                            onChange={(e) => updateProfile("name", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            type="email"
                            id="email"
                            value={profile.email}
                            onChange={(e) => updateProfile("email", e.target.value)}
                            disabled
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="bio">Short Bio</Label>
                        <Textarea
                          id="bio"
                          value={profile.bio}
                          onChange={(e) => updateProfile("bio", e.target.value)}
                          placeholder="Write a short bio about yourself"
                        />
                      </div>
                      <div>
                        <Label htmlFor="longBio">Long Bio</Label>
                        <Textarea
                          id="longBio"
                          value={profile.longBio}
                          onChange={(e) => updateProfile("longBio", e.target.value)}
                          placeholder="Write a detailed bio about yourself"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          type="text"
                          id="category"
                          value={profile.category}
                          onChange={(e) => updateProfile("category", e.target.value)}
                        />
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="pricePersonal">Price (Personal)</Label>
                          <Input
                            type="number"
                            id="pricePersonal"
                            value={profile.pricePersonal}
                            onChange={(e) => updateProfile("pricePersonal", Number.parseFloat(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="priceBusiness">Price (Business)</Label>
                          <Input
                            type="number"
                            id="priceBusiness"
                            value={profile.priceBusiness}
                            onChange={(e) => updateProfile("priceBusiness", Number.parseFloat(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="priceCharity">Price (Charity)</Label>
                          <Input
                            type="number"
                            id="priceCharity"
                            value={profile.priceCharity}
                            onChange={(e) => updateProfile("priceCharity", Number.parseFloat(e.target.value))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="flex items-center space-x-2">
                          <span>Active</span>
                          <Switch
                            id="active"
                            checked={profile.isActive}
                            onCheckedChange={(checked) => updateProfile("isActive", checked)}
                          />
                        </Label>
                      </div>
                      <div>
                        <Label htmlFor="responseTime">Response Time</Label>
                        <Select
                          value={profile.responseTime}
                          onValueChange={(value) => updateProfile("responseTime", value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select response time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-24 hours">1-24 hours</SelectItem>
                            <SelectItem value="1-3 days">1-3 days</SelectItem>
                            <SelectItem value="3-7 days">3-7 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
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
                            Save Changes
                          </>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-white font-semibold mb-2">Profile not found</p>
                      <p className="text-purple-200">Please try again later.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

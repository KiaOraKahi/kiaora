"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Filter,
  Calendar,
  Clock,
  DollarSign,
  User,
  Package,
  ChevronRight,
  Loader2,
  Settings,
  CreditCard,
  Heart,
  Star,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Play,
  Download,
  Eye,
  MessageSquare,
  Bell,
  Shield,
  Lock,
  Mail,
  Phone,
  MapPin,
  Camera,
  Trash2,
  Plus,
  Minus,
  LogOut,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import MobileNavbar from "@/components/frontend/mobile-navbar"
import { TipModal } from "@/components/tip-modal"
import { ProfileImageUpload } from "@/components/profile-image-upload"
import VideoPlayer from "@/components/frontend/video-player"

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
  approvalStatus?: string
  videoUrl?: string
  tipAmount?: number
}

interface Payment {
  id: string
  orderNumber: string
  amount: number
  status: string
  date: string
  type: "booking" | "tip" | "refund"
  description: string
  celebrityName: string
}

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  preferences: {
    notifications: boolean
    marketing: boolean
    language: string
    timezone: string
  }
}

// Mock data for demonstration
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "KO-1234567890-ABC123",
    status: "completed",
    paymentStatus: "paid",
    totalAmount: 299,
    createdAt: "2024-01-15T10:00:00Z",
    recipientName: "Sarah Johnson",
    occasion: "birthday",
    scheduledDate: "2024-01-20T00:00:00Z",
    scheduledTime: "2:00 PM",
    bookingStatus: "confirmed",
    celebrityName: "Emma Stone",
    celebrityImage: "/celeb1.jpg",
    celebrityCategory: "Actor",
    approvalStatus: "approved",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    tipAmount: 50,
  },
  {
    id: "2",
    orderNumber: "KO-1234567891-DEF456",
    status: "pending_approval",
    paymentStatus: "paid",
    totalAmount: 599,
    createdAt: "2024-01-16T14:30:00Z",
    recipientName: "Michael Chen",
    occasion: "anniversary",
    scheduledDate: "2024-01-25T00:00:00Z",
    scheduledTime: "6:00 PM",
    bookingStatus: "confirmed",
    celebrityName: "John Legend",
    celebrityImage: "/celeb2.jpg",
    celebrityCategory: "Musician",
    approvalStatus: "pending_approval",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
  },
  {
    id: "3",
    orderNumber: "KO-1234567892-GHI789",
    status: "pending",
    paymentStatus: "paid",
    totalAmount: 899,
    createdAt: "2024-01-17T09:15:00Z",
    recipientName: "Lisa Rodriguez",
    occasion: "graduation",
    scheduledDate: "2024-01-30T00:00:00Z",
    scheduledTime: "12:00 PM",
    bookingStatus: "confirmed",
    celebrityName: "Tony Robbins",
    celebrityImage: "/celeb3.jpg",
    celebrityCategory: "Motivator",
  },
]

const mockPayments: Payment[] = [
  {
    id: "1",
    orderNumber: "KO-1234567890-ABC123",
    amount: 299,
    status: "completed",
    date: "2024-01-15T10:00:00Z",
    type: "booking",
    description: "Emma Stone - Personal Video Message",
    celebrityName: "Emma Stone",
  },
  {
    id: "2",
    orderNumber: "KO-1234567890-ABC123",
    amount: 50,
    status: "completed",
    date: "2024-01-22T16:00:00Z",
    type: "tip",
    description: "Tip for Emma Stone",
    celebrityName: "Emma Stone",
  },
  {
    id: "3",
    orderNumber: "KO-1234567891-DEF456",
    amount: 599,
    status: "completed",
    date: "2024-01-16T14:30:00Z",
    type: "booking",
    description: "John Legend - Personal Video Message",
    celebrityName: "John Legend",
  },
]

const mockProfile: UserProfile = {
  id: "1",
  name: "Alex Johnson",
  email: "alex@example.com",
  phone: "+1 (555) 123-4567",
  avatar: "/placeholder.svg",
  preferences: {
    notifications: true,
    marketing: false,
    language: "en",
    timezone: "America/New_York",
  },
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

const approvalStatusColors = {
  pending_approval: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  approved: "bg-green-500/20 text-green-300 border-green-500/30",
  declined: "bg-red-500/20 text-red-300 border-red-500/30",
}

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState("requests")
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [payments, setPayments] = useState<Payment[]>(mockPayments)
  const [profile, setProfile] = useState<UserProfile>(mockProfile)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile>(mockProfile)
  const [isMobile, setIsMobile] = useState(false)
  const [videoModal, setVideoModal] = useState<{ isOpen: boolean; videoUrl?: string; celebrityName?: string }>({
    isOpen: false,
    videoUrl: undefined,
    celebrityName: undefined
  })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Fetch user profile when session is available
  useEffect(() => {
    if (session?.user?.id) {
      const fetchUserProfile = async () => {
        try {
          const response = await fetch("/api/user/profile")
          if (response.ok) {
            const userProfile = await response.json()
            setProfile(userProfile)
            setEditedProfile(userProfile)
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      }
      fetchUserProfile()
    }
  }, [session?.user?.id])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = searchTerm === "" || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.celebrityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleProfileSave = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedProfile),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setEditedProfile(updatedProfile)
        setIsEditingProfile(false)
        toast.success("Profile updated successfully!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile. Please try again.")
    }
  }

  const handleProfileCancel = () => {
    setEditedProfile(profile)
    setIsEditingProfile(false)
  }

  const handleWatchVideo = (videoUrl: string, celebrityName: string) => {
    setVideoModal({
      isOpen: true,
      videoUrl,
      celebrityName
    })
  }

  const handleCloseVideo = () => {
    setVideoModal({
      isOpen: false,
      videoUrl: undefined,
      celebrityName: undefined
    })
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
          <p className="text-purple-200">You need to be signed in to access your dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <SubtleLuxuryStarfield />
      
      <div className="relative z-10">
        {isMobile ? <MobileNavbar /> : <Navbar />}
        
        <div className="container mx-auto px-4 py-8 pt-24">
          {/* Header */}
          <div className="mb-8">
            {/* Demo Data Indicator */}
            <div className="mb-4">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-xs px-3 py-2 shadow-lg">
                <Star className="w-3 h-3 mr-1" />
                Demo Dashboard - Sample Data
              </Badge>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-4xl font-bold text-white">Welcome back, {profile.name}!</h1>
                  <p className="text-purple-200">Manage your celebrity video bookings and account</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30 hover:text-red-200"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">{orders.length}</div>
                  <div className="text-purple-200 text-sm">Total Orders</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {orders.filter(o => o.status === "completed").length}
                  </div>
                  <div className="text-blue-200 text-sm">Completed</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {orders.filter(o => o.status === "in_progress").length}
                  </div>
                  <div className="text-yellow-200 text-sm">In Progress</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    ${payments.reduce((sum, p) => sum + p.amount, 0)}
                  </div>
                  <div className="text-green-200 text-sm">Total Spent</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/10 border-white/20 text-white mb-8">
              <TabsTrigger value="requests" className="data-[state=active]:bg-purple-500 text-white">
                <Package className="w-4 h-4 mr-2" />
                My Requests
              </TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:bg-purple-500 text-white">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment History
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-purple-500 text-white">
                <Settings className="w-4 h-4 mr-2" />
                Profile Settings
              </TabsTrigger>
            </TabsList>

            {/* My Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              {/* Filters and Search */}
              <Card className="bg-slate-900 border-white/20">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                        <Input
                          placeholder="Search by order number, celebrity, or recipient..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20">
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
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
                  {filteredOrders.map((order) => (
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
                              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
                                {order.celebrityImage ? (
                                  <img
                                    src={order.celebrityImage}
                                    alt={order.celebrityName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-8 h-8 text-white" />
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-white">{order.orderNumber}</h3>
                                  <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                                    {order.status.replace("_", " ")}
                                  </Badge>
                                  <Badge className={paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors]}>
                                    {order.paymentStatus}
                                  </Badge>
                                  {order.approvalStatus && (
                                    <Badge className={approvalStatusColors[order.approvalStatus as keyof typeof approvalStatusColors]}>
                                      {order.approvalStatus.replace("_", " ")}
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex items-center gap-6 text-sm text-purple-200 mb-2">
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

                                {order.tipAmount && (
                                  <div className="flex items-center gap-2 text-sm text-pink-300">
                                    <Heart className="w-4 h-4" />
                                    <span>Tip: ${order.tipAmount}</span>
                                  </div>
                                )}
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

                              <div className="flex items-center gap-2">
                                {/* Show Watch button for completed videos */}
                                {order.status === "completed" && order.videoUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-300 hover:text-white hover:bg-green-500/20"
                                    onClick={() => handleWatchVideo(order.videoUrl!, order.celebrityName)}
                                  >
                                    <Play className="w-4 h-4 mr-1" />
                                    Watch
                                  </Button>
                                )}
                                
                                {/* Show Review button for pending approval videos */}
                                {order.status === "pending_approval" && order.videoUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-orange-300 hover:text-white hover:bg-orange-500/20"
                                    onClick={() => handleWatchVideo(order.videoUrl!, order.celebrityName)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Review & Approve
                                  </Button>
                                )}
                                
                                {/* Show Tip button for completed and approved videos */}
                                {order.status === "completed" && order.approvalStatus === "approved" && (
                                  <TipModal
                                    orderNumber={order.orderNumber}
                                    celebrityName={order.celebrityName}
                                    celebrityImage={order.celebrityImage}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-pink-300 hover:text-white hover:bg-pink-500/20"
                                    >
                                      <Heart className="w-4 h-4 mr-1" />
                                      Tip
                                    </Button>
                                  </TipModal>
                                )}

                                <Link href={`/orders/${order.orderNumber}`}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-purple-300 hover:text-white hover:bg-purple-500/20"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Details
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Payment History Tab */}
            <TabsContent value="payments" className="space-y-6">
              <Card className="bg-slate-900 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  {payments.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                      <p className="text-purple-200">No payment history found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {payments.map((payment) => (
                        <motion.div
                          key={payment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              payment.type === "tip" 
                                ? "bg-pink-500/20 text-pink-300" 
                                : payment.type === "refund"
                                ? "bg-red-500/20 text-red-300"
                                : "bg-purple-500/20 text-purple-300"
                            }`}>
                              {payment.type === "tip" ? (
                                <Heart className="w-5 h-5" />
                              ) : payment.type === "refund" ? (
                                <Minus className="w-5 h-5" />
                              ) : (
                                <CreditCard className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <div className="text-white font-semibold">{payment.description}</div>
                              <div className="text-purple-300 text-sm">
                                {payment.orderNumber} • {format(new Date(payment.date), "MMM d, yyyy")}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              payment.type === "refund" ? "text-red-400" : "text-green-400"
                            }`}>
                              {payment.type === "refund" ? "-" : "+"}${payment.amount}
                            </div>
                            <div className="text-purple-300 text-sm capitalize">{payment.status}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Settings Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-slate-900 border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Profile Settings</CardTitle>
                    {!isEditingProfile ? (
                      <Button
                        onClick={() => setIsEditingProfile(true)}
                        variant="outline"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleProfileSave}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          onClick={handleProfileCancel}
                          variant="outline"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={editedProfile.avatar} alt={editedProfile.name} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-3xl">
                        {editedProfile.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditingProfile && (
                      <ProfileImageUpload
                        currentImage={editedProfile.avatar}
                        onImageUpdate={(imageUrl) => setEditedProfile({ ...editedProfile, avatar: imageUrl })}
                        disabled={false}
                      />
                    )}
                  </div>

                  <Separator className="bg-white/20" />

                  {/* Personal Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Full Name</label>
                      {isEditingProfile ? (
                        <Input
                          value={editedProfile.name}
                          onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      ) : (
                        <div className="p-3 bg-white/5 rounded-lg text-white">{profile.name}</div>
                      )}
                    </div>

                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Email</label>
                      {isEditingProfile ? (
                        <Input
                          type="email"
                          value={editedProfile.email}
                          onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      ) : (
                        <div className="p-3 bg-white/5 rounded-lg text-white">{profile.email}</div>
                      )}
                    </div>

                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Phone</label>
                      {isEditingProfile ? (
                        <Input
                          type="tel"
                          value={editedProfile.phone || ""}
                          onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                          className="bg-white/10 border-white/20 text-white"
                          placeholder="+1 (555) 123-4567"
                        />
                      ) : (
                        <div className="p-3 bg-white/5 rounded-lg text-white">{profile.phone || "Not provided"}</div>
                      )}
                    </div>

                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Language</label>
                      {isEditingProfile ? (
                        <Select
                          value={editedProfile.preferences.language}
                          onValueChange={(value) => setEditedProfile({
                            ...editedProfile,
                            preferences: { ...editedProfile.preferences, language: value }
                          })}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-white/20">
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-3 bg-white/5 rounded-lg text-white capitalize">{profile.preferences.language}</div>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-white/20" />

                  {/* Preferences */}
                  <div>
                    <h3 className="text-white font-semibold mb-4">Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-purple-400" />
                          <div>
                            <div className="text-white font-medium">Email Notifications</div>
                            <div className="text-purple-300 text-sm">Receive updates about your orders</div>
                          </div>
                        </div>
                        {isEditingProfile ? (
                          <Button
                            variant={editedProfile.preferences.notifications ? "default" : "outline"}
                            onClick={() => setEditedProfile({
                              ...editedProfile,
                              preferences: { ...editedProfile.preferences, notifications: !editedProfile.preferences.notifications }
                            })}
                            className={editedProfile.preferences.notifications ? "bg-purple-600" : "bg-white/10 border-white/20 text-white"}
                          >
                            {editedProfile.preferences.notifications ? "Enabled" : "Disabled"}
                          </Button>
                        ) : (
                          <Badge className={profile.preferences.notifications ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-300"}>
                            {profile.preferences.notifications ? "Enabled" : "Disabled"}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-purple-400" />
                          <div>
                            <div className="text-white font-medium">Marketing Communications</div>
                            <div className="text-purple-300 text-sm">Receive promotional emails and offers</div>
                          </div>
                        </div>
                        {isEditingProfile ? (
                          <Button
                            variant={editedProfile.preferences.marketing ? "default" : "outline"}
                            onClick={() => setEditedProfile({
                              ...editedProfile,
                              preferences: { ...editedProfile.preferences, marketing: !editedProfile.preferences.marketing }
                            })}
                            className={editedProfile.preferences.marketing ? "bg-purple-600" : "bg-white/10 border-white/20 text-white"}
                          >
                            {editedProfile.preferences.marketing ? "Enabled" : "Disabled"}
                          </Button>
                        ) : (
                          <Badge className={profile.preferences.marketing ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-300"}>
                            {profile.preferences.marketing ? "Enabled" : "Disabled"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/20" />

                  {/* Security */}
                  <div>
                    <h3 className="text-white font-semibold mb-4">Security</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-purple-400" />
                          <div>
                            <div className="text-white font-medium">Change Password</div>
                            <div className="text-purple-300 text-sm">Update your account password</div>
                          </div>
                        </div>
                        <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                          Change
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-purple-400" />
                          <div>
                            <div className="text-white font-medium">Two-Factor Authentication</div>
                            <div className="text-purple-300 text-sm">Add an extra layer of security</div>
                          </div>
                        </div>
                        <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                          Enable
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Footer />
      </div>

      {/* Video Player Modal */}
      <VideoPlayer
        isOpen={videoModal.isOpen}
        onClose={handleCloseVideo}
        videoUrl={videoModal.videoUrl}
        title={`Video from ${videoModal.celebrityName}`}
        celebrity={videoModal.celebrityName}
        description="Your personalized video message"
        autoPlay={true}
      />
    </div>
  )
} 
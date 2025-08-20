"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Settings, 
  TrendingUp, 
  UserPlus, 
  Crown, 
  ShoppingCart,
  Star,
  Activity,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  Download,
  RefreshCw
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const SubtleLuxuryStarfield = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black" />
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            <div
              className={`w-1 h-1 rounded-full ${
                Math.random() > 0.97
                  ? "bg-yellow-400 shadow-lg shadow-yellow-400/50"
                  : Math.random() > 0.93
                  ? "bg-purple-400 shadow-lg shadow-purple-400/50"
                  : "bg-white/60"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

const mockStats = {
  totalUsers: 1247,
  totalCelebrities: 89,
  totalOrders: 3421,
  totalRevenue: 125000,
  celebrityGrowth: 12.5,
  userGrowth: 8.2,
  orderGrowth: 15.7,
  revenueGrowth: 23.1
}

const mockRecentUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "USER", status: "active", joined: "2 hours ago" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "CELEBRITY", status: "pending", joined: "4 hours ago" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "USER", status: "active", joined: "6 hours ago" },
  { id: 4, name: "Sarah Wilson", email: "sarah@example.com", role: "CELEBRITY", status: "active", joined: "1 day ago" },
]

const mockRecentBookings = [
  { id: 1, customer: "John Doe", celebrity: "Emma Stone", amount: 299, status: "CONFIRMED", date: "2 hours ago" },
  { id: 2, customer: "Jane Smith", celebrity: "Ryan Reynolds", amount: 799, status: "PENDING", date: "4 hours ago" },
  { id: 3, customer: "Mike Johnson", celebrity: "Tony Robbins", amount: 899, status: "COMPLETED", date: "1 day ago" },
  { id: 4, customer: "Sarah Wilson", celebrity: "Oprah Winfrey", amount: 1999, status: "CANCELLED", date: "2 days ago" },
]

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState(mockStats)
  const [recentUsers, setRecentUsers] = useState(mockRecentUsers)
  const [recentBookings, setRecentBookings] = useState(mockRecentBookings)
  const [dataLoading, setDataLoading] = useState(true)

  const fetchAdminData = async () => {
    try {
      setDataLoading(true)
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentUsers(data.recentUsers)
        setRecentBookings(data.recentBookings)
      } else {
        console.error("Failed to fetch admin data")
        toast.error("Failed to load admin data")
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
      toast.error("Error loading admin data")
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    if (status === "loading") return
    
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/admin/login")
      toast.error("Access denied. Admin privileges required.")
    } else {
      fetchAdminData()
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!session || session.user?.role !== "ADMIN") {
    return null
  }

  const handleRefresh = () => {
    setIsLoading(true)
    fetchAdminData().finally(() => {
      setIsLoading(false)
      toast.success("Data refreshed successfully")
    })
  }

  const handleExport = () => {
    toast.success("Export started. You'll receive an email when ready.")
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      <SubtleLuxuryStarfield />
      
      <div className="relative z-10">
        <div className="bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-purple-200 mt-1">Welcome back, {session.user?.name}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={handleExport}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-purple-500">
                <Activity className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="text-white data-[state=active]:bg-purple-500">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="bookings" className="text-white data-[state=active]:bg-purple-500">
                <Calendar className="w-4 h-4 mr-2" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-white data-[state=active]:bg-purple-500">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white/80">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                                     <CardContent>
                     <div className="text-2xl font-bold text-white">{dataLoading ? "..." : stats.totalUsers.toLocaleString()}</div>
                     <div className="flex items-center text-xs text-green-400">
                       <ArrowUpRight className="w-3 h-3 mr-1" />
                       +{dataLoading ? "..." : stats.userGrowth}% from last month
                     </div>
                   </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white/80">Celebrities</CardTitle>
                    <Crown className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                                     <CardContent>
                     <div className="text-2xl font-bold text-white">{dataLoading ? "..." : stats.totalCelebrities}</div>
                     <div className="flex items-center text-xs text-green-400">
                       <ArrowUpRight className="w-3 h-3 mr-1" />
                       +{dataLoading ? "..." : stats.celebrityGrowth}% from last month
                     </div>
                   </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white/80">Total Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                                     <CardContent>
                     <div className="text-2xl font-bold text-white">{dataLoading ? "..." : stats.totalOrders.toLocaleString()}</div>
                     <div className="flex items-center text-xs text-green-400">
                       <ArrowUpRight className="w-3 h-3 mr-1" />
                       +{dataLoading ? "..." : stats.orderGrowth}% from last month
                     </div>
                   </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white/80">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-400" />
                  </CardHeader>
                                     <CardContent>
                     <div className="text-2xl font-bold text-white">${dataLoading ? "..." : stats.totalRevenue.toLocaleString()}</div>
                     <div className="flex items-center text-xs text-green-400">
                       <ArrowUpRight className="w-3 h-3 mr-1" />
                       +{dataLoading ? "..." : stats.revenueGrowth}% from last month
                     </div>
                   </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Users</CardTitle>
                  </CardHeader>
                                     <CardContent className="space-y-4">
                     {dataLoading ? (
                       <div className="text-center py-4">
                         <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                         <p className="text-purple-300 text-sm">Loading users...</p>
                       </div>
                     ) : recentUsers.length === 0 ? (
                       <div className="text-center py-4">
                         <p className="text-purple-300 text-sm">No recent users</p>
                       </div>
                     ) : (
                       recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">{user.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-purple-300 text-sm">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={user.role === "CELEBRITY" ? "default" : "secondary"}
                            className={user.role === "CELEBRITY" ? "bg-yellow-500/20 text-yellow-300" : "bg-purple-500/20 text-purple-300"}
                          >
                            {user.role}
                          </Badge>
                          <Badge 
                            variant={user.status === "active" ? "default" : "secondary"}
                            className={user.status === "active" ? "bg-green-500/20 text-green-300" : "bg-orange-500/20 text-orange-300"}
                          >
                            {user.status}
                          </Badge>
                                                 </div>
                       </div>
                       ))
                     )}
                   </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Bookings</CardTitle>
                  </CardHeader>
                                     <CardContent className="space-y-4">
                     {dataLoading ? (
                       <div className="text-center py-4">
                         <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                         <p className="text-purple-300 text-sm">Loading bookings...</p>
                       </div>
                     ) : recentBookings.length === 0 ? (
                       <div className="text-center py-4">
                         <p className="text-purple-300 text-sm">No recent bookings</p>
                       </div>
                     ) : (
                       recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{booking.customer} → {booking.celebrity}</p>
                          <p className="text-purple-300 text-sm">${booking.amount} • {booking.date}</p>
                        </div>
                        <Badge 
                          variant="secondary"
                          className={
                            booking.status === "CONFIRMED" ? "bg-green-500/20 text-green-300" :
                            booking.status === "PENDING" ? "bg-yellow-500/20 text-yellow-300" :
                            booking.status === "COMPLETED" ? "bg-blue-500/20 text-blue-300" :
                            "bg-red-500/20 text-red-300"
                          }
                        >
                          {booking.status}
                                                 </Badge>
                       </div>
                       ))
                     )}
                   </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">User Management</CardTitle>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-purple-300 focus:border-purple-500"
                        />
                      </div>
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dataLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-purple-300">Loading users...</p>
                      </div>
                    ) : recentUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-purple-300">No users found</p>
                      </div>
                    ) : (
                      recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">{user.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-purple-300 text-sm">{user.email}</p>
                            <p className="text-purple-400 text-xs">Joined {user.joined}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={user.role === "CELEBRITY" ? "default" : "secondary"}
                            className={user.role === "CELEBRITY" ? "bg-yellow-500/20 text-yellow-300" : "bg-purple-500/20 text-purple-300"}
                          >
                            {user.role}
                          </Badge>
                          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Booking Oversight</CardTitle>
                    <div className="flex items-center space-x-4">
                      <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dataLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-purple-300">Loading bookings...</p>
                      </div>
                    ) : recentBookings.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-purple-300">No bookings found</p>
                      </div>
                    ) : (
                      recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">{booking.customer.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{booking.customer} → {booking.celebrity}</p>
                            <p className="text-purple-300 text-sm">${booking.amount} • {booking.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="secondary"
                            className={
                              booking.status === "CONFIRMED" ? "bg-green-500/20 text-green-300" :
                              booking.status === "PENDING" ? "bg-yellow-500/20 text-yellow-300" :
                              booking.status === "COMPLETED" ? "bg-blue-500/20 text-blue-300" :
                              "bg-red-500/20 text-red-300"
                            }
                          >
                            {booking.status}
                          </Badge>
                          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white">Site Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Site Name</label>
                      <input
                        type="text"
                        defaultValue="Kia Ora Kahi"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Site Description</label>
                      <textarea
                        defaultValue="Connect with celebrities for personalized video messages"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Contact Email</label>
                      <input
                        type="email"
                        defaultValue="admin@kiaora.com"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500"
                      />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      Save Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white">Financial Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Platform Fee (%)</label>
                      <input
                        type="number"
                        defaultValue="20"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Minimum Payout</label>
                      <input
                        type="number"
                        defaultValue="50"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Payout Schedule</label>
                      <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500">
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      Update Financial Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

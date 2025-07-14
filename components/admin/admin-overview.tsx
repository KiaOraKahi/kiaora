"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Star, DollarSign, TrendingUp, TrendingDown, Activity, Clock, CheckCircle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface OverviewStats {
  totalUsers: number
  totalCelebrities: number
  totalBookings: number
  totalOrders: number
  totalRevenue: number
  pendingApplications: number
  monthlyGrowth: number
  activeUsers: number
  completedBookings: number
  cancelledBookings: number
  averageOrderValue: number
}

export function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock data for charts - you can replace with real data later
  const revenueData = [
    { month: "Jan", revenue: 12000, bookings: 45 },
    { month: "Feb", revenue: 15000, bookings: 52 },
    { month: "Mar", revenue: 18000, bookings: 61 },
    { month: "Apr", revenue: 22000, bookings: 73 },
    { month: "May", revenue: 25000, bookings: 84 },
    { month: "Jun", revenue: 28000, bookings: 92 },
  ]

  const categoryData = [
    { category: "Actors", count: 15, revenue: 45000 },
    { category: "Musicians", count: 12, revenue: 38000 },
    { category: "Athletes", count: 8, revenue: 32000 },
    { category: "Influencers", count: 10, revenue: 28000 },
  ]

  useEffect(() => {
    fetchOverviewStats()
  }, [])

  const fetchOverviewStats = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching overview stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : "$0",
      change: stats && stats.monthlyGrowth > 0 ? `+${stats.monthlyGrowth}%` : stats ? `${stats.monthlyGrowth}%` : "0%",
      changeType: stats && stats.monthlyGrowth >= 0 ? "positive" : "negative",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Active Users",
      value: stats ? stats.activeUsers.toLocaleString() : "0",
      change: "+8.2%",
      changeType: "positive",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Total Celebrities",
      value: stats ? stats.totalCelebrities.toLocaleString() : "0",
      change: "+15.3%",
      changeType: "positive",
      icon: Star,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Completed Bookings",
      value: stats ? stats.completedBookings.toLocaleString() : "0",
      change: "+23.1%",
      changeType: "positive",
      icon: CheckCircle,
      color: "from-green-500 to-teal-500",
    },
    {
      title: "Pending Applications",
      value: stats ? stats.pendingApplications.toLocaleString() : "0",
      change: "-5.4%",
      changeType: "negative",
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Average Order Value",
      value: stats ? `$${stats.averageOrderValue}` : "$0",
      change: "+18.7%",
      changeType: "positive",
      icon: Activity,
      color: "from-indigo-500 to-purple-500",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-400">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30 hover:border-purple-500/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge
                      className={`${
                        stat.changeType === "positive"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }`}
                    >
                      {stat.changeType === "positive" ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {stat.change}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-400">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #6B46C1",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: "#8B5CF6" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="category" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #6B46C1",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                  }}
                />
                <Bar dataKey="revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: "booking", message: "New booking from John Doe for Emma Watson", time: "2 minutes ago" },
              {
                type: "celebrity",
                message: "Celebrity application approved for Ryan Reynolds",
                time: "15 minutes ago",
              },
              { type: "payment", message: "Payment of $250 processed successfully", time: "1 hour ago" },
              { type: "user", message: "New user registration: sarah@example.com", time: "2 hours ago" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.message}</p>
                  <p className="text-gray-400 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

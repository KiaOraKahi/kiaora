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
import { Star, Search, Eye, TrendingUp, Award, Loader2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

interface Celebrity {
  id: string
  name: string
  email: string
  category: string
  basePrice: number
  rating: number
  totalBookings: number
  totalEarnings: number
  completionRate: number
  stripeConnectStatus: string
  status: "ACTIVE" | "SUSPENDED" | "PENDING"
  featured: boolean
  createdAt: string
}

export function AdminCelebrities() {
  const [celebrities, setCelebrities] = useState<Celebrity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedCelebrity, setSelectedCelebrity] = useState<Celebrity | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchCelebrities()
  }, [searchTerm, categoryFilter, statusFilter])

  const fetchCelebrities = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/admin/celebrities?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCelebrities(data.celebrities)
      } else {
        toast.error("Failed to fetch celebrities")
      }
    } catch (error) {
      toast.error("Error fetching celebrities")
    } finally {
      setLoading(false)
    }
  }

  const handleCelebrityAction = async (celebrityId: string, action: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/celebrities/${celebrityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        toast.success(`Celebrity ${action} successfully`)
        fetchCelebrities()
      } else {
        toast.error(`Failed to ${action} celebrity`)
      }
    } catch (error) {
      toast.error("Error updating celebrity")
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: "bg-green-500", text: "Active" },
      SUSPENDED: { color: "bg-red-500", text: "Suspended" },
      PENDING: { color: "bg-yellow-500", text: "Pending" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { color: "bg-gray-500", text: status }
    return <Badge className={`${config.color} text-white hover:${config.color}/80`}>{config.text}</Badge>
  }

  const getStripeStatusBadge = (status: string) => {
    const statusConfig = {
      CONNECTED: { color: "bg-green-500", text: "Connected" },
      PENDING: { color: "bg-yellow-500", text: "Pending" },
      NOT_CONNECTED: { color: "bg-red-500", text: "Not Connected" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { color: "bg-gray-500", text: status }
    return <Badge className={`${config.color} text-white hover:${config.color}/80`}>{config.text}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Celebrity Management
        </h1>
        <p className="text-gray-400">Manage celebrity profiles, performance, and earnings.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Total Celebrities", value: celebrities.length, icon: Star, color: "from-purple-500 to-pink-500" },
          {
            title: "Active",
            value: celebrities.filter((c) => c.status === "ACTIVE").length,
            icon: CheckCircle,
            color: "from-green-500 to-emerald-500",
          },
          {
            title: "Featured",
            value: celebrities.filter((c) => c.featured).length,
            icon: Award,
            color: "from-yellow-500 to-orange-500",
          },
          {
            title: "Avg Rating",
            value: (celebrities.reduce((acc, c) => acc + c.rating, 0) / celebrities.length || 0).toFixed(1),
            icon: TrendingUp,
            color: "from-blue-500 to-cyan-500",
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
                  placeholder="Search celebrities by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500"
                />
              </div>
            </div>
            <div className="w-full md:w-40">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all" className="text-white hover:bg-gray-800">
                    All Categories
                  </SelectItem>
                  <SelectItem value="Actor" className="text-white hover:bg-gray-800">
                    Actors
                  </SelectItem>
                  <SelectItem value="Musician" className="text-white hover:bg-gray-800">
                    Musicians
                  </SelectItem>
                  <SelectItem value="Athlete" className="text-white hover:bg-gray-800">
                    Athletes
                  </SelectItem>
                  <SelectItem value="Influencer" className="text-white hover:bg-gray-800">
                    Influencers
                  </SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="ACTIVE" className="text-white hover:bg-gray-800">
                    Active
                  </SelectItem>
                  <SelectItem value="SUSPENDED" className="text-white hover:bg-gray-800">
                    Suspended
                  </SelectItem>
                  <SelectItem value="PENDING" className="text-white hover:bg-gray-800">
                    Pending
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Celebrities Table */}
      <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white">All Celebrities</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <span className="ml-2 text-gray-300">Loading celebrities...</span>
            </div>
          ) : celebrities.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">No celebrities found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-gray-800/50">
                    <TableHead className="text-gray-300">Celebrity</TableHead>
                    <TableHead className="text-gray-300">Category</TableHead>
                    <TableHead className="text-gray-300">Price</TableHead>
                    <TableHead className="text-gray-300">Rating</TableHead>
                    <TableHead className="text-gray-300">Bookings</TableHead>
                    <TableHead className="text-gray-300">Earnings</TableHead>
                    <TableHead className="text-gray-300">Stripe</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {celebrities.map((celebrity) => (
                    <TableRow key={celebrity.id} className="border-gray-700 hover:bg-gray-800/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                            {celebrity.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium flex items-center gap-2">
                              {celebrity.name}
                              {celebrity.featured && <Award className="w-4 h-4 text-yellow-400" />}
                            </p>
                            <p className="text-gray-400 text-sm">{celebrity.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                          {celebrity.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">${celebrity.basePrice}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white">{celebrity.rating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{celebrity.totalBookings}</TableCell>
                      <TableCell className="text-gray-300">${celebrity.totalEarnings.toLocaleString()}</TableCell>
                      <TableCell>{getStripeStatusBadge(celebrity.stripeConnectStatus)}</TableCell>
                      <TableCell>{getStatusBadge(celebrity.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedCelebrity(celebrity)}
                                className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Celebrity Details - {selectedCelebrity?.name}</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                  View and manage celebrity information
                                </DialogDescription>
                              </DialogHeader>
                              {selectedCelebrity && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                    <Card className="bg-gray-800/50 border-gray-700">
                                      <CardHeader>
                                        <CardTitle className="text-lg">Performance Metrics</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-3">
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Total Bookings:</span>
                                          <span className="text-white">{selectedCelebrity.totalBookings}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Total Earnings:</span>
                                          <span className="text-white">
                                            ${selectedCelebrity.totalEarnings.toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Completion Rate:</span>
                                          <span className="text-white">{selectedCelebrity.completionRate}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Rating:</span>
                                          <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="text-white">{selectedCelebrity.rating.toFixed(1)}</span>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                    <Card className="bg-gray-800/50 border-gray-700">
                                      <CardHeader>
                                        <CardTitle className="text-lg">Account Details</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-3">
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Category:</span>
                                          <span className="text-white">{selectedCelebrity.category}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Base Price:</span>
                                          <span className="text-white">${selectedCelebrity.basePrice}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Status:</span>
                                          {getStatusBadge(selectedCelebrity.status)}
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Stripe Connect:</span>
                                          {getStripeStatusBadge(selectedCelebrity.stripeConnectStatus)}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() =>
                                        handleCelebrityAction(
                                          selectedCelebrity.id,
                                          selectedCelebrity.featured ? "unfeature" : "feature",
                                        )
                                      }
                                      disabled={updating}
                                      className="bg-yellow-600 hover:bg-yellow-700"
                                    >
                                      {updating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Award className="w-4 h-4" />
                                      )}
                                      {selectedCelebrity.featured ? "Unfeature" : "Feature"}
                                    </Button>
                                    {selectedCelebrity.status === "ACTIVE" ? (
                                      <Button
                                        onClick={() => handleCelebrityAction(selectedCelebrity.id, "suspend")}
                                        disabled={updating}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        {updating ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <XCircle className="w-4 h-4" />
                                        )}
                                        Suspend
                                      </Button>
                                    ) : (
                                      <Button
                                        onClick={() => handleCelebrityAction(selectedCelebrity.id, "activate")}
                                        disabled={updating}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        {updating ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <CheckCircle className="w-4 h-4" />
                                        )}
                                        Activate
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
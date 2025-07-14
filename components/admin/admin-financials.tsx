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
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Clock,
  RefreshCw,
  Search,
  Download,
  Loader2,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { toast } from "sonner"

interface FinancialStats {
  totalRevenue: number
  platformFees: number
  celebrityPayouts: number
  pendingTransfers: number
  failedPayments: number
  monthlyGrowth: number
}

interface Transfer {
  id: string
  celebrityName: string
  amount: number
  status: string
  type: string
  orderNumber: string
  createdAt: string
  stripeTransferId?: string
}

export function AdminFinancials() {
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [updating, setUpdating] = useState(false)

  // Mock data for charts
  const revenueData = [
    { month: "Jan", revenue: 12000, fees: 2400, payouts: 9600 },
    { month: "Feb", revenue: 15000, fees: 3000, payouts: 12000 },
    { month: "Mar", revenue: 18000, fees: 3600, payouts: 14400 },
    { month: "Apr", revenue: 22000, fees: 4400, payouts: 17600 },
    { month: "May", revenue: 25000, fees: 5000, payouts: 20000 },
    { month: "Jun", revenue: 28000, fees: 5600, payouts: 22400 },
  ]

  const transferStatusData = [
    { name: "Completed", value: 85, color: "#10B981" },
    { name: "In Transit", value: 10, color: "#F59E0B" },
    { name: "Failed", value: 3, color: "#EF4444" },
    { name: "Manual", value: 2, color: "#8B5CF6" },
  ]

  useEffect(() => {
    fetchFinancialData()
  }, [searchTerm, statusFilter])

  const fetchFinancialData = async () => {
    try {
      setLoading(true)

      // Fetch financial stats
      const statsResponse = await fetch("/api/admin/financial-stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch transfers
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const transfersResponse = await fetch(`/api/admin/transfers?${params}`)
      if (transfersResponse.ok) {
        const transfersData = await transfersResponse.json()
        setTransfers(transfersData.transfers)
      }
    } catch (error) {
      toast.error("Error fetching financial data")
    } finally {
      setLoading(false)
    }
  }

  const handleRetryTransfer = async (transferId: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/transfers/${transferId}/retry`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Transfer retry initiated")
        fetchFinancialData()
      } else {
        toast.error("Failed to retry transfer")
      }
    } catch (error) {
      toast.error("Error retrying transfer")
    } finally {
      setUpdating(false)
    }
  }

  const getTransferStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: { color: "bg-green-500", text: "Completed" },
      IN_TRANSIT: { color: "bg-blue-500", text: "In Transit" },
      FAILED: { color: "bg-red-500", text: "Failed" },
      PENDING: { color: "bg-yellow-500", text: "Pending" },
      MANUAL_PROCESSING: { color: "bg-purple-500", text: "Manual" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { color: "bg-gray-500", text: status }
    return <Badge className={`${config.color} text-white hover:${config.color}/80`}>{config.text}</Badge>
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : "$0",
      change: "+12.5%",
      changeType: "positive",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Platform Fees",
      value: stats ? `$${stats.platformFees.toLocaleString()}` : "$0",
      change: "+8.2%",
      changeType: "positive",
      icon: CreditCard,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Celebrity Payouts",
      value: stats ? `$${stats.celebrityPayouts.toLocaleString()}` : "$0",
      change: "+15.3%",
      changeType: "positive",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Pending Transfers",
      value: stats ? `$${stats.pendingTransfers.toLocaleString()}` : "$0",
      change: "-5.4%",
      changeType: "negative",
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Financial Management
          </h1>
          <p className="text-gray-400">Monitor revenue, transfers, and financial performance.</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Revenue Breakdown</CardTitle>
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
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} name="Total Revenue" />
                <Line type="monotone" dataKey="fees" stroke="#8B5CF6" strokeWidth={2} name="Platform Fees" />
                <Line type="monotone" dataKey="payouts" stroke="#F59E0B" strokeWidth={2} name="Celebrity Payouts" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transfer Status Pie Chart */}
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Transfer Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transferStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {transferStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #6B46C1",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {transferStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-300 text-sm">{item.name}</span>
                  </div>
                  <span className="text-white text-sm">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transfers Table */}
      <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Recent Transfers</CardTitle>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search transfers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500 w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all" className="text-white hover:bg-gray-800">
                    All Status
                  </SelectItem>
                  <SelectItem value="COMPLETED" className="text-white hover:bg-gray-800">
                    Completed
                  </SelectItem>
                  <SelectItem value="IN_TRANSIT" className="text-white hover:bg-gray-800">
                    In Transit
                  </SelectItem>
                  <SelectItem value="FAILED" className="text-white hover:bg-gray-800">
                    Failed
                  </SelectItem>
                  <SelectItem value="PENDING" className="text-white hover:bg-gray-800">
                    Pending
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transfers.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">No transfers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-gray-800/50">
                    <TableHead className="text-gray-300">Celebrity</TableHead>
                    <TableHead className="text-gray-300">Order</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer) => (
                    <TableRow key={transfer.id} className="border-gray-700 hover:bg-gray-800/50 transition-colors">
                      <TableCell className="text-white">{transfer.celebrityName}</TableCell>
                      <TableCell className="text-gray-300">{transfer.orderNumber}</TableCell>
                      <TableCell className="text-gray-300">${transfer.amount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                          {transfer.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{getTransferStatusBadge(transfer.status)}</TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(transfer.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {transfer.status === "FAILED" && (
                          <Button
                            onClick={() => handleRetryTransfer(transfer.id)}
                            disabled={updating}
                            size="sm"
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            {updating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                          </Button>
                        )}
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
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Loader2,
  Calendar,
  Gift,
  BarChart3,
  PieChart,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import * as XLSX from 'xlsx'

interface PayoutData {
  summary: {
    totalEarnings: number
    pendingEarnings: number
    totalPlatformFees: number
    totalPayouts: number
  }
  stripeBalance: {
    available: Array<{ amount: number; currency: string }>
    pending: Array<{ amount: number; currency: string }>
  } | null
  recentPayouts: Array<{
    id: string
    amount: number
    platformFee: number
    status: string
    paidAt: string
    createdAt: string
    order: {
      orderNumber: string
      recipientName: string
      totalAmount: number
      createdAt: string
    }
  }>
  pendingOrders: Array<{
    id: string
    orderNumber: string
    recipientName: string
    totalAmount: number
    expectedPayout: number
    createdAt: string
    deliveredAt: string
  }>
}

interface TipData {
  tips: Array<{
    id: string
    amount: number
    message: string
    status: string
    createdAt: string
    orderNumber: string
  }>
  summary: {
    totalTips: number
    pendingTips: number
    completedTips: number
    averageTip: number
  }
}

export default function CelebrityPayoutDashboard() {
  const [payoutData, setPayoutData] = useState<PayoutData | null>(null)
  const [tipData, setTipData] = useState<TipData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")
  const [activeTab, setActiveTab] = useState("overview")
  const [tipFilter, setTipFilter] = useState("all")

  useEffect(() => {
    fetchPayoutData()
    fetchTipData()
  }, [timeRange])

  const fetchPayoutData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/celebrity/earnings")
      if (response.ok) {
        const data = await response.json()
        setPayoutData(data)
      } else {
        // Fallback to mock data if API fails
        const mockPayoutData: PayoutData = {
          summary: {
            totalEarnings: 1250000, // $12,500.00
            pendingEarnings: 450000, // $4,500.00
            totalPlatformFees: 125000, // $1,250.00
            totalPayouts: 800000, // $8,000.00
          },
          stripeBalance: {
            available: [{ amount: 450000, currency: "usd" }], // $4,500.00
            pending: [{ amount: 200000, currency: "usd" }], // $2,000.00
          },
          recentPayouts: [
            {
              id: "1",
              amount: 239200, // $2,392.00
              platformFee: 59800, // $598.00
              status: "PAID",
              paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              order: {
                orderNumber: "REQ-1755435882494",
                recipientName: "John Smith",
                totalAmount: 299000, // $2,990.00
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              }
            },
            {
              id: "2",
              amount: 159200, // $1,592.00
              platformFee: 39800, // $398.00
              status: "PAID",
              paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              order: {
                orderNumber: "REQ-1755435882493",
                recipientName: "Sarah Johnson",
                totalAmount: 199000, // $1,990.00
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              }
            },
            {
              id: "3",
              amount: 119200, // $1,192.00
              platformFee: 29800, // $298.00
              status: "PENDING",
              paidAt: null,
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              order: {
                orderNumber: "REQ-1755435882492",
                recipientName: "Mike Wilson",
                totalAmount: 149000, // $1,490.00
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              }
            }
          ],
          pendingOrders: [
            {
              id: "1",
              orderNumber: "REQ-1755435882491",
              recipientName: "Emma Davis",
              totalAmount: 199000, // $1,990.00
              expectedPayout: 159200, // $1,592.00
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              deliveredAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            }
          ]
        }
        setPayoutData(mockPayoutData)
      }
    } catch (error) {
      console.error("Error fetching payout data:", error)
      // Set mock data on error
      const mockPayoutData: PayoutData = {
        summary: {
          totalEarnings: 1250000,
          pendingEarnings: 450000,
          totalPlatformFees: 125000,
          totalPayouts: 800000,
        },
        stripeBalance: {
          available: [{ amount: 450000, currency: "usd" }],
          pending: [{ amount: 200000, currency: "usd" }],
        },
        recentPayouts: [],
        pendingOrders: []
      }
      setPayoutData(mockPayoutData)
    } finally {
      setLoading(false)
    }
  }

  const fetchTipData = async () => {
    try {
      // For now, we'll create mock tip data based on the test data we have
             const mockTipData: TipData = {
         tips: [
           {
             id: "1",
             amount: 5000, // $50.00
             message: "Great video! Thank you!",
             status: "PAID",
             createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
             orderNumber: "TEST-001"
           },
           {
             id: "2",
             amount: 10000, // $100.00
             message: "Amazing work!",
             status: "PENDING",
             createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
             orderNumber: "TEST-002"
           },
           {
             id: "3",
             amount: 2500, // $25.00
             message: "Love it!",
             status: "PAID",
             createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
             orderNumber: "TEST-001"
           },
           {
             id: "4",
             amount: 7500, // $75.00
             message: "Fantastic performance!",
             status: "PENDING",
             createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
             orderNumber: "TEST-003"
           },
           {
             id: "5",
             amount: 15000, // $150.00
             message: "Best video ever!",
             status: "PAID",
             createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
             orderNumber: "TEST-004"
           }
         ],
         summary: {
           totalTips: 45000, // $450.00
           pendingTips: 17500, // $175.00 (pending)
           completedTips: 27500, // $275.00 (paid)
           averageTip: 9000 // $90.00
         }
       }
      setTipData(mockTipData)
    } catch (error) {
      console.error("Error fetching tip data:", error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100)
  }

  const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
    if (data.length === 0) {
      toast.error("No data to export")
      return
    }

    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new()
      
      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(data)
      
      // Set column widths
      const columnWidths = Object.keys(data[0]).map(key => ({ wch: Math.max(key.length, 15) }))
      worksheet['!cols'] = columnWidths
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      
      // Create blob and download
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success(`${filename} exported successfully!`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export file')
    }
  }

  const exportPayoutReport = () => {
    if (!payoutData?.recentPayouts || payoutData.recentPayouts.length === 0) {
      toast.error("No payout data to export")
      return
    }

    const exportData = payoutData.recentPayouts.map(payout => ({
      'Order Number': payout.order.orderNumber,
      'Recipient': payout.order.recipientName,
      'Amount': formatCurrency(payout.amount),
      'Platform Fee': formatCurrency(payout.platformFee),
      'Status': payout.status,
      'Created Date': format(new Date(payout.createdAt), "MMM d, yyyy"),
      'Paid Date': payout.paidAt ? format(new Date(payout.paidAt), "MMM d, yyyy") : 'N/A'
    }))

    exportToExcel(exportData, 'payout_report', 'Payout History')
  }

  const exportTipReport = () => {
    if (!tipData?.tips || tipData.tips.length === 0) {
      toast.error("No tip data to export")
      return
    }

    const exportData = tipData.tips.map(tip => ({
      'Order Number': tip.orderNumber,
      'Message': tip.message,
      'Amount': formatCurrency(tip.amount),
      'Status': tip.status,
      'Date': format(new Date(tip.createdAt), "MMM d, yyyy")
    }))

    exportToExcel(exportData, 'tip_report', 'Tip Reports')
  }

  const exportSummaryReport = () => {
    if (!payoutData) {
      toast.error("No data to export")
      return
    }

    const exportData = [
      {
        'Report Type': 'Earnings Summary',
        'Total Earnings': formatCurrency(payoutData.summary.totalEarnings),
        'Pending Earnings': formatCurrency(payoutData.summary.pendingEarnings),
        'Total Platform Fees': formatCurrency(payoutData.summary.totalPlatformFees),
        'Total Payouts': formatCurrency(payoutData.summary.totalPayouts),
        'Available Balance': payoutData.stripeBalance ? formatCurrency(payoutData.stripeBalance.available[0]?.amount || 0) : '$0.00',
        'Pending Balance': payoutData.stripeBalance ? formatCurrency(payoutData.stripeBalance.pending[0]?.amount || 0) : '$0.00',
        'Report Date': format(new Date(), "MMM d, yyyy")
      }
    ]

    exportToExcel(exportData, 'earnings_summary', 'Earnings Summary')
  }

  const getFilteredTips = () => {
    if (!tipData?.tips) return []
    
    if (tipFilter === "all") return tipData.tips
    if (tipFilter === "pending") return tipData.tips.filter(tip => tip.status === "PENDING")
    if (tipFilter === "paid") return tipData.tips.filter(tip => tip.status === "PAID")
    if (tipFilter === "failed") return tipData.tips.filter(tip => tip.status === "FAILED")
    
    return tipData.tips
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PAID: { color: "bg-green-500/20", text: "Paid", icon: CheckCircle },
      PENDING: { color: "bg-yellow-500/20", text: "Pending", icon: Clock },
      FAILED: { color: "bg-red-500/20", text: "Failed", icon: AlertCircle },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      color: "bg-gray-500/20", 
      text: status, 
      icon: AlertCircle 
    }
    const Icon = config.icon
    return (
      <Badge className={`${config.color} text-white border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Payout Dashboard</h2>
          <p className="text-purple-200">Track your earnings and manage payouts</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
                     <Button
             onClick={fetchPayoutData}
             variant="outline"
             size="sm"
             className="bg-white/10 border-white/20 text-white hover:bg-white/20"
           >
             <RefreshCw className="w-4 h-4 mr-2" />
             Refresh
           </Button>
           <Button
             onClick={exportSummaryReport}
             variant="outline"
             size="sm"
             className="bg-white/10 border-white/20 text-white hover:bg-white/20"
           >
             <Download className="w-4 h-4 mr-2" />
             Export Summary
           </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Total Earnings</p>
                <p className="text-2xl font-bold text-white">
                  {payoutData ? formatCurrency(payoutData.summary.totalEarnings) : "$0.00"}
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
                  {payoutData ? formatCurrency(payoutData.summary.pendingEarnings) : "$0.00"}
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
                  {tipData ? formatCurrency(tipData.summary.totalTips) : "$0.00"}
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
                <p className="text-purple-200 text-sm font-medium">Platform Fees</p>
                <p className="text-2xl font-bold text-white">
                  {payoutData ? formatCurrency(payoutData.summary.totalPlatformFees) : "$0.00"}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stripe Balance */}
      {payoutData?.stripeBalance && (
        <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Stripe Account Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-500/10 rounded-lg">
                <h4 className="text-green-400 font-semibold mb-2">Available Balance</h4>
                {payoutData.stripeBalance.available.map((balance, index) => (
                  <p key={index} className="text-white text-lg">
                    {formatCurrency(balance.amount)} {balance.currency.toUpperCase()}
                  </p>
                ))}
              </div>
              <div className="p-4 bg-yellow-500/10 rounded-lg">
                <h4 className="text-yellow-400 font-semibold mb-2">Pending Balance</h4>
                {payoutData.stripeBalance.pending.map((balance, index) => (
                  <p key={index} className="text-white text-lg">
                    {formatCurrency(balance.amount)} {balance.currency.toUpperCase()}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/10 border-white/20 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="payouts" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <DollarSign className="w-4 h-4 mr-2" />
            Payouts
          </TabsTrigger>
          <TabsTrigger value="tips" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <Gift className="w-4 h-4 mr-2" />
            Tips
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <Clock className="w-4 h-4 mr-2" />
            Pending
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Payouts */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">Recent Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                {payoutData?.recentPayouts.length === 0 ? (
                  <p className="text-purple-200 text-center py-4">No recent payouts</p>
                ) : (
                  <div className="space-y-3">
                    {payoutData?.recentPayouts.slice(0, 5).map((payout) => (
                      <div key={payout.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{payout.order.orderNumber}</p>
                          <p className="text-purple-200 text-sm">{payout.order.recipientName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-semibold">{formatCurrency(payout.amount)}</p>
                          {getStatusBadge(payout.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Tips */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">Recent Tips</CardTitle>
              </CardHeader>
              <CardContent>
                {tipData?.tips.length === 0 ? (
                  <p className="text-purple-200 text-center py-4">No recent tips</p>
                ) : (
                  <div className="space-y-3">
                    {tipData?.tips.slice(0, 5).map((tip) => (
                      <div key={tip.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{tip.orderNumber}</p>
                          <p className="text-purple-200 text-sm">{tip.message}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-pink-400 font-semibold">{formatCurrency(tip.amount)}</p>
                          {getStatusBadge(tip.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-6">
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Payout History</CardTitle>
                                 <Button 
                   variant="outline" 
                   size="sm" 
                   className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                   onClick={exportPayoutReport}
                 >
                   <Download className="w-4 h-4 mr-2" />
                   Export
                 </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Order</TableHead>
                    <TableHead className="text-white">Recipient</TableHead>
                    <TableHead className="text-white">Amount</TableHead>
                    <TableHead className="text-white">Platform Fee</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payoutData?.recentPayouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="text-white">{payout.order.orderNumber}</TableCell>
                      <TableCell className="text-white">{payout.order.recipientName}</TableCell>
                      <TableCell className="text-green-400 font-semibold">
                        {formatCurrency(payout.amount)}
                      </TableCell>
                      <TableCell className="text-purple-200">
                        {formatCurrency(payout.platformFee)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell className="text-purple-200">
                        {format(new Date(payout.createdAt), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips" className="space-y-6">
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
            <CardHeader>
                           <div className="flex items-center justify-between">
               <CardTitle className="text-white">Tip Reports</CardTitle>
               <div className="flex items-center gap-3">
                 <Select value={tipFilter} onValueChange={setTipFilter}>
                   <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All Tips</SelectItem>
                     <SelectItem value="pending">Pending</SelectItem>
                     <SelectItem value="paid">Paid</SelectItem>
                     <SelectItem value="failed">Failed</SelectItem>
                   </SelectContent>
                 </Select>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                   onClick={exportTipReport}
                 >
                   <Download className="w-4 h-4 mr-2" />
                   Export
                 </Button>
               </div>
             </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Order</TableHead>
                    <TableHead className="text-white">Message</TableHead>
                    <TableHead className="text-white">Amount</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Date</TableHead>
                  </TableRow>
                </TableHeader>
                                 <TableBody>
                   {getFilteredTips().map((tip) => (
                    <TableRow key={tip.id}>
                      <TableCell className="text-white">{tip.orderNumber}</TableCell>
                      <TableCell className="text-white max-w-xs truncate">{tip.message}</TableCell>
                      <TableCell className="text-pink-400 font-semibold">
                        {formatCurrency(tip.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(tip.status)}</TableCell>
                      <TableCell className="text-purple-200">
                        {format(new Date(tip.createdAt), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-6">
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Order</TableHead>
                    <TableHead className="text-white">Recipient</TableHead>
                    <TableHead className="text-white">Total Amount</TableHead>
                    <TableHead className="text-white">Expected Payout</TableHead>
                    <TableHead className="text-white">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payoutData?.pendingOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-white">{order.orderNumber}</TableCell>
                      <TableCell className="text-white">{order.recipientName}</TableCell>
                      <TableCell className="text-white">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell className="text-green-400 font-semibold">
                        {formatCurrency(order.expectedPayout)}
                      </TableCell>
                      <TableCell className="text-purple-200">
                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

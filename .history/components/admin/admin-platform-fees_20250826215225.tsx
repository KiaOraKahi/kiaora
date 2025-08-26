"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DollarSign, 
  CreditCard, 
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  RefreshCw,
  Settings,
  Banknote,
  TrendingUp
} from "lucide-react"
import { toast } from "sonner"

interface PlatformFeeData {
  financialSettings: {
    id: string
    platformFee: number
    minimumPayout: number
    payoutSchedule: string
    adminStripeAccountId?: string
    adminStripeAccountStatus?: string
    adminStripeAccountEmail?: string
    adminStripeAccountName?: string
    platformFeeBalance: number
    lastPlatformFeePayout?: string
  }
  transfers: Array<{
    id: string
    amount: number
    currency: string
    stripeTransferId?: string
    status: string
    description?: string
    createdAt: string
  }>
  summary: {
    totalPlatformFees: number
    pendingPlatformFees: number
    totalTransfers: number
    successfulTransfers: number
  }
}

export default function AdminPlatformFees() {
  const { data: session, status } = useSession()
  const [data, setData] = useState<PlatformFeeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [transferring, setTransferring] = useState(false)
  const [setupLoading, setSetupLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Admin account setup form
  const [adminAccountForm, setAdminAccountForm] = useState({
    stripeAccountId: "",
    email: "",
    name: "",
  })

  // Manual transfer form
  const [transferForm, setTransferForm] = useState({
    amount: "",
  })

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchPlatformFeeData()
    }
  }, [session])

  const fetchPlatformFeeData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/platform-fees", {
        credentials: "include"
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch platform fee data")
      }
      
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error fetching platform fee data:", error)
      toast.error("Failed to load platform fee data")
    } finally {
      setLoading(false)
    }
  }

  const setupAdminAccount = async () => {
    try {
      setSetupLoading(true)
      
      if (!adminAccountForm.stripeAccountId || !adminAccountForm.email || !adminAccountForm.name) {
        toast.error("Please fill in all fields")
        return
      }

      const response = await fetch("/api/admin/platform-fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "setup_admin_account",
          ...adminAccountForm,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to setup admin account")
      }

      toast.success("Admin Stripe account setup successfully")
      setAdminAccountForm({ stripeAccountId: "", email: "", name: "" })
      fetchPlatformFeeData()
    } catch (error) {
      console.error("Error setting up admin account:", error)
      toast.error(error instanceof Error ? error.message : "Failed to setup admin account")
    } finally {
      setSetupLoading(false)
    }
  }

  const transferPlatformFees = async (customAmount?: number) => {
    try {
      setTransferring(true)
      
      const amount = customAmount || parseFloat(transferForm.amount)
      
      if (!amount || amount <= 0) {
        toast.error("Please enter a valid amount")
        return
      }

      const response = await fetch("/api/admin/platform-fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "transfer_platform_fees",
          amount: customAmount ? undefined : amount,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to transfer platform fees")
      }

      toast.success(`Platform fees transferred successfully: $${result.amount}`)
      setTransferForm({ amount: "" })
      fetchPlatformFeeData()
    } catch (error) {
      console.error("Error transferring platform fees:", error)
      toast.error(error instanceof Error ? error.message : "Failed to transfer platform fees")
    } finally {
      setTransferring(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency: "NZD",
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCEEDED":
        return <Badge className="bg-green-500 text-white">Success</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>
      case "FAILED":
        return <Badge className="bg-red-500 text-white">Failed</Badge>
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== "ADMIN") {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-200">Access denied. Admin privileges required.</p>
      </div>
    )
  }

  if (!data || !data.financialSettings) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-400">Failed to load platform fee data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Platform Fees Management</h2>
          <p className="text-gray-400">Manage 20% platform commission and transfers</p>
        </div>
        <Button
          onClick={fetchPlatformFeeData}
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/10 border-white/20">
          <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">
            Overview
          </TabsTrigger>
          <TabsTrigger value="transfers" className="text-white data-[state=active]:bg-white/20">
            Transfers
          </TabsTrigger>
          <TabsTrigger value="setup" className="text-white data-[state=active]:bg-white/20">
            Setup
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Platform Fees</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(data.summary?.totalPlatformFees || 0)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Pending Transfer</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {formatCurrency(data.summary.pendingPlatformFees)}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Transfers</p>
                    <p className="text-2xl font-bold text-white">
                      {data.summary.totalTransfers}
                    </p>
                  </div>
                  <ArrowUpRight className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Success Rate</p>
                    <p className="text-2xl font-bold text-green-400">
                      {data.summary.totalTransfers > 0 
                        ? Math.round((data.summary.successfulTransfers / data.summary.totalTransfers) * 100)
                        : 0}%
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Account Status */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Admin Stripe Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.financialSettings?.adminStripeAccountId ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Account Status</p>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          data.financialSettings?.adminStripeAccountStatus === "ACTIVE" 
                            ? "bg-green-500 text-white" 
                            : "bg-yellow-500 text-white"
                        }>
                          {data.financialSettings?.adminStripeAccountStatus}
                        </Badge>
                        {data.financialSettings?.adminStripeAccountStatus === "ACTIVE" && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Account Name</p>
                      <p className="text-white">{data.financialSettings?.adminStripeAccountName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{data.financialSettings?.adminStripeAccountEmail}</p>
                    </div>
                  </div>

                  {data.summary.pendingPlatformFees > 0 && (
                    <div className="pt-4">
                      <Button
                        onClick={() => transferPlatformFees()}
                        disabled={transferring || data.financialSettings?.adminStripeAccountStatus !== "ACTIVE"}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                      >
                        {transferring ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Transferring...
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-4 h-4 mr-2" />
                            Transfer All Pending Fees ({formatCurrency(data.summary.pendingPlatformFees)})
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No admin Stripe account configured</p>
                  <Button
                    onClick={() => setActiveTab("setup")}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Setup Admin Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers" className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Banknote className="w-5 h-5 mr-2" />
                Platform Fee Transfers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.transfers.length > 0 ? (
                <div className="space-y-4">
                  {data.transfers.map((transfer) => (
                    <div
                      key={transfer.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <ArrowUpRight className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {formatCurrency(transfer.amount)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {new Date(transfer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(transfer.status)}
                        {transfer.stripeTransferId && (
                          <p className="text-xs text-gray-400">
                            ID: {transfer.stripeTransferId.slice(-8)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No transfers yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Setup Admin Stripe Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stripeAccountId" className="text-white">Stripe Account ID</Label>
                  <Input
                    id="stripeAccountId"
                    type="text"
                    placeholder="acct_1234567890"
                    value={adminAccountForm.stripeAccountId}
                    onChange={(e) => setAdminAccountForm({
                      ...adminAccountForm,
                      stripeAccountId: e.target.value
                    })}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Your Stripe Connect account ID (starts with acct_)
                  </p>
                </div>

                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@yourcompany.com"
                    value={adminAccountForm.email}
                    onChange={(e) => setAdminAccountForm({
                      ...adminAccountForm,
                      email: e.target.value
                    })}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="name" className="text-white">Account Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your Company Name"
                    value={adminAccountForm.name}
                    onChange={(e) => setAdminAccountForm({
                      ...adminAccountForm,
                      name: e.target.value
                    })}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                </div>

                <Button
                  onClick={setupAdminAccount}
                  disabled={setupLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white w-full"
                >
                  {setupLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Setup Admin Account
                    </>
                  )}
                </Button>
              </div>

              {/* Manual Transfer Section */}
                                {data.financialSettings?.adminStripeAccountId && (
                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Manual Transfer</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="transferAmount" className="text-white">Amount (NZD)</Label>
                      <Input
                        id="transferAmount"
                        type="number"
                        step="0.01"
                        placeholder="100.00"
                        value={transferForm.amount}
                        onChange={(e) => setTransferForm({
                          ...transferForm,
                          amount: e.target.value
                        })}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>

                    <Button
                      onClick={() => transferPlatformFees()}
                      disabled={transferring || !transferForm.amount}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white w-full"
                    >
                      {transferring ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Transferring...
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="w-4 h-4 mr-2" />
                          Transfer Platform Fees
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

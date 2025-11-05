"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
  DollarSign,
  CreditCard,
  Shield,
  RefreshCw,
} from "lucide-react"

interface StripeStatus {
  hasAccount: boolean
  accountId?: string
  accountStatus: "PENDING" | "RESTRICTED" | "ACTIVE" | "REJECTED"
  payoutsEnabled: boolean
  chargesEnabled: boolean
  requirementsCount: number
  totalEarnings: number
  pendingEarnings: number
  totalTips: number
}

interface StripeConnectOnboardingProps {
  className?: string
}

export default function StripeConnectOnboarding({ className }: StripeConnectOnboardingProps) {
  const [status, setStatus] = useState<StripeStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStripeStatus()
  }, [])

  const fetchStripeStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/celebrity/stripe-status")
      const data = await response.json()

      if (response.ok) {
        setStatus(data)
      } else {
        setError(data.error || "Failed to fetch Stripe status")
      }
    } catch (error) {
      console.error("Error fetching Stripe status:", error)
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = async () => {
    try {
      setActionLoading(true)
      setError(null)

      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create" }),
      })

      const data = await response.json()

      if (response.ok && data.onboardingUrl) {
        // Redirect to Stripe onboarding
        window.location.href = data.onboardingUrl
      } else {
        setError(data.error || "Failed to create Stripe account")
      }
    } catch (error) {
      console.error("Error creating Stripe account:", error)
      setError("Failed to create account")
    } finally {
      setActionLoading(false)
    }
  }

  const handleContinueOnboarding = async () => {
    try {
      setActionLoading(true)
      setError(null)

      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "continue" }),
      })

      const data = await response.json()

      if (response.ok && data.onboardingUrl) {
        window.location.href = data.onboardingUrl
      } else {
        setError(data.error || "Failed to continue onboarding")
      }
    } catch (error) {
      console.error("Error continuing onboarding:", error)
      setError("Failed to continue onboarding")
    } finally {
      setActionLoading(false)
    }
  }

  const handleAccessDashboard = async () => {
    try {
      setActionLoading(true)
      setError(null)

      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dashboard" }),
      })

      const data = await response.json()

      if (response.ok && data.dashboardUrl) {
        window.open(data.dashboardUrl, "_blank")
      } else {
        setError(data.error || "Failed to access dashboard")
      }
    } catch (error) {
      console.error("Error accessing dashboard:", error)
      setError("Failed to access dashboard")
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (accountStatus: string, payoutsEnabled: boolean) => {
    if (accountStatus === "ACTIVE" && payoutsEnabled) {
      return (
        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      )
    } else if (accountStatus === "RESTRICTED" || !payoutsEnabled) {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
          <AlertCircle className="w-3 h-3 mr-1" />
          Setup Required
        </Badge>
      )
    } else if (accountStatus === "REJECTED") {
      return (
        <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
          <AlertCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Pending
        </Badge>
      )
    }
  }

  if (loading) {
    return (
      <Card className={`bg-white/10 border-white/20 backdrop-blur-lg ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <span className="ml-2 text-white">Loading payment setup...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Payment Setup Status */}
      <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Setup
            </CardTitle>
            <div className="flex items-center gap-2">
              {status && getStatusBadge(status.accountStatus, status.payoutsEnabled)}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStripeStatus}
                disabled={loading}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="bg-red-500/20 border-red-500/30">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          {!status?.hasAccount ? (
            // No Stripe account yet
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Setup Required</h3>
                  <p className="text-blue-200 text-sm mb-3">
                    To receive payments from bookings and tips, you need to set up your payment account with Stripe.
                    This is secure and takes just a few minutes.
                  </p>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>• Verify your identity</li>
                    <li>• Add your bank account details</li>
                    <li>• Start receiving payments</li>
                  </ul>
                </div>
              </div>

              <Button
                onClick={handleCreateAccount}
                disabled={actionLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Setup Payment Account
                  </>
                )}
              </Button>
            </div>
          ) : status.accountStatus === "ACTIVE" && status.payoutsEnabled ? (
            // Account is fully active
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Payment Setup Complete!</h3>
                  <p className="text-green-200 text-sm">
                    Your payment account is active and ready to receive payments from bookings and tips.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 p-4 rounded-lg text-center">
                  <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-white font-semibold">${(status.totalEarnings / 100).toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-purple-200 text-sm">Total Earnings</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg text-center">
                  <Loader2 className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-white font-semibold">${(status.pendingEarnings / 100).toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-purple-200 text-sm">Pending</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg text-center">
                  <DollarSign className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                  <p className="text-white font-semibold">${(status.totalTips / 100).toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-purple-200 text-sm">Tips Received</p>
                </div>
              </div>

              <Button
                onClick={handleAccessDashboard}
                disabled={actionLoading}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Opening Dashboard...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Access Stripe Dashboard
                  </>
                )}
              </Button>
            </div>
          ) : (
            // Account exists but needs completion
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-yellow-500/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Complete Your Setup</h3>
                  <p className="text-yellow-200 text-sm mb-2">
                    Your payment account needs additional information before you can receive payments.
                  </p>
                  {status.requirementsCount > 0 && (
                    <p className="text-yellow-200 text-sm">
                      {status.requirementsCount} requirement{status.requirementsCount !== 1 ? "s" : ""} remaining
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleContinueOnboarding}
                  disabled={actionLoading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Complete Setup
                    </>
                  )}
                </Button>

                {status.accountId && (
                  <Button
                    onClick={handleAccessDashboard}
                    disabled={actionLoading}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white text-lg">How Payments Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">
              1
            </div>
            <div>
              <p className="text-white font-medium">VIP earn 80% after platform fees.</p>
              <p className="text-purple-200 text-sm">Non-VIP earn 73.9% after platform fees.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-white text-sm font-bold">
              2
            </div>
            <div>
              <p className="text-white font-medium">Tips (100% to you)</p>
              <p className="text-purple-200 text-sm">
                All tips from customers go directly to you with no platform fees.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
              3
            </div>
            <div>
              <p className="text-white font-medium">Automatic Transfers</p>
              <p className="text-purple-200 text-sm">
                Payments are automatically transferred to your bank account within 2-7 business days.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
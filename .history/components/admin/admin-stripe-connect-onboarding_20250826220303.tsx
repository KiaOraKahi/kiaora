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
  Building,
} from "lucide-react"

interface AdminStripeStatus {
  hasAccount: boolean
  accountId?: string
  accountStatus: "PENDING" | "RESTRICTED" | "ACTIVE" | "REJECTED"
  payoutsEnabled: boolean
  chargesEnabled: boolean
  requirementsCount: number
  platformFeeBalance: number
  lastPlatformFeePayout?: Date
  accountEmail?: string
  accountName?: string
}

interface AdminStripeConnectOnboardingProps {
  className?: string
}

export default function AdminStripeConnectOnboarding({ className }: AdminStripeConnectOnboardingProps) {
  const [status, setStatus] = useState<AdminStripeStatus | null>(null)
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
      const response = await fetch("/api/admin/stripe-status")
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

      const response = await fetch("/api/admin/stripe-connect", {
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

      const response = await fetch("/api/admin/stripe-connect", {
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

      const response = await fetch("/api/admin/stripe-connect", {
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
              <Building className="w-5 h-5" />
              Admin Payment Setup
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
                    To receive platform fees from bookings and tips, you need to set up your admin payment account with Stripe.
                    This is secure and takes just a few minutes.
                  </p>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>• Verify your business identity</li>
                    <li>• Add your bank account details</li>
                    <li>• Start receiving platform fees</li>
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
                    Setup Admin Payment Account
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
                  <h3 className="text-white font-semibold mb-1">Admin Payment Setup Complete!</h3>
                  <p className="text-green-200 text-sm">
                    Your admin payment account is active and ready to receive platform fees from bookings and tips.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg text-center">
                  <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-white font-semibold">${status.platformFeeBalance.toLocaleString()}</p>
                  <p className="text-purple-200 text-sm">Platform Fee Balance</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg text-center">
                  <CreditCard className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-white font-semibold">{status.accountName || "Admin"}</p>
                  <p className="text-purple-200 text-sm">Account Name</p>
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
            // Account exists but needs setup
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-yellow-500/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Setup Incomplete</h3>
                  <p className="text-yellow-200 text-sm mb-3">
                    Your Stripe account exists but needs additional setup to receive platform fees.
                  </p>
                  {status.requirementsCount > 0 && (
                    <p className="text-yellow-200 text-sm">
                      {status.requirementsCount} requirement(s) still need to be completed.
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleContinueOnboarding}
                disabled={actionLoading}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Continuing Setup...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Complete Setup
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

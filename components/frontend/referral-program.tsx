"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Users,
  Share2,
  Copy,
  Mail,
  MessageCircle,
  Trophy,
  Star,
  Crown,
  Zap,
  DollarSign,
  Calendar,
  TrendingUp,
} from "lucide-react"
import { useToast } from "@/components/frontend/toast-provider"

interface Referral {
  id: string
  name: string
  email: string
  status: "pending" | "signed_up" | "first_purchase" | "active"
  dateReferred: Date
  dateSignedUp?: Date
  dateFirstPurchase?: Date
  totalSpent: number
  reward: number
}

interface ReferralTier {
  name: string
  icon: React.ReactNode
  minReferrals: number
  bonusPercentage: number
  color: string
  gradient: string
  perks: string[]
}

const referralTiers: ReferralTier[] = [
  {
    name: "Bronze Ambassador",
    icon: <Star className="w-6 h-6" />,
    minReferrals: 0,
    bonusPercentage: 10,
    color: "text-amber-600",
    gradient: "from-amber-500 to-orange-500",
    perks: ["10% referral bonus", "Basic support"],
  },
  {
    name: "Silver Champion",
    icon: <Trophy className="w-6 h-6" />,
    minReferrals: 5,
    bonusPercentage: 15,
    color: "text-gray-400",
    gradient: "from-gray-400 to-gray-500",
    perks: ["15% referral bonus", "Priority support", "Exclusive offers"],
  },
  {
    name: "Gold Elite",
    icon: <Crown className="w-6 h-6" />,
    minReferrals: 15,
    bonusPercentage: 20,
    color: "text-yellow-500",
    gradient: "from-yellow-500 to-amber-500",
    perks: ["20% referral bonus", "VIP support", "Early access", "Monthly bonus"],
  },
  {
    name: "Platinum Legend",
    icon: <Zap className="w-6 h-6" />,
    minReferrals: 50,
    bonusPercentage: 25,
    color: "text-purple-400",
    gradient: "from-purple-500 to-pink-500",
    perks: ["25% referral bonus", "Dedicated manager", "Custom rewards", "Exclusive events"],
  },
]

export default function ReferralProgram() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [referralCode, setReferralCode] = useState("KIAORA-USER123")
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [pendingEarnings, setPendingEarnings] = useState(0)
  const [currentTier, setCurrentTier] = useState(referralTiers[0])
  const [nextTier, setNextTier] = useState(referralTiers[1])
  const [emailInput, setEmailInput] = useState("")
  const { addToast } = useToast()

  // Sample referral data
  useEffect(() => {
    const sampleReferrals: Referral[] = [
      {
        id: "1",
        name: "Sarah Johnson",
        email: "sarah@example.com",
        status: "active",
        dateReferred: new Date(2024, 0, 15),
        dateSignedUp: new Date(2024, 0, 16),
        dateFirstPurchase: new Date(2024, 0, 18),
        totalSpent: 249,
        reward: 24.9,
      },
      {
        id: "2",
        name: "Mike Chen",
        email: "mike@example.com",
        status: "first_purchase",
        dateReferred: new Date(2024, 1, 5),
        dateSignedUp: new Date(2024, 1, 6),
        dateFirstPurchase: new Date(2024, 1, 10),
        totalSpent: 149,
        reward: 14.9,
      },
      {
        id: "3",
        name: "Emma Rodriguez",
        email: "emma@example.com",
        status: "signed_up",
        dateReferred: new Date(2024, 1, 20),
        dateSignedUp: new Date(2024, 1, 22),
        totalSpent: 0,
        reward: 0,
      },
      {
        id: "4",
        name: "David Kim",
        email: "david@example.com",
        status: "pending",
        dateReferred: new Date(2024, 2, 1),
        totalSpent: 0,
        reward: 0,
      },
    ]

    setReferrals(sampleReferrals)

    const total = sampleReferrals.reduce((sum, ref) => sum + ref.reward, 0)
    const pending = sampleReferrals
      .filter((ref) => ref.status === "pending" || ref.status === "signed_up")
      .reduce((sum, ref) => sum + (ref.status === "signed_up" ? 10 : 0), 0)

    setTotalEarnings(total)
    setPendingEarnings(pending)

    // Determine current tier
    const activeReferrals = sampleReferrals.filter(
      (ref) => ref.status === "active" || ref.status === "first_purchase",
    ).length
    const tier = referralTiers.reverse().find((t) => activeReferrals >= t.minReferrals) || referralTiers[0]
    const nextTierIndex = referralTiers.findIndex((t) => t.minReferrals > activeReferrals)

    setCurrentTier(tier)
    setNextTier(nextTierIndex !== -1 ? referralTiers[nextTierIndex] : tier)
  }, [])

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode)
    addToast({
      type: "success",
      title: "Code Copied!",
      description: "Your referral code has been copied to clipboard.",
    })
  }

  const copyReferralLink = () => {
    const link = `https://kiaora.com/signup?ref=${referralCode}`
    navigator.clipboard.writeText(link)
    addToast({
      type: "success",
      title: "Link Copied!",
      description: "Your referral link has been copied to clipboard.",
    })
  }

  const shareViaEmail = () => {
    const subject = "Join Kia Ora and get personalized celebrity messages!"
    const body = `Hey! I've been using Kia Ora to get amazing personalized messages from celebrities, and I thought you'd love it too!

Use my referral code: ${referralCode}
Or click this link: https://kiaora.com/signup?ref=${referralCode}

You'll get $10 off your first order, and I'll earn some rewards too. It's a win-win!

Check it out: https://kiaora.com`

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const shareViaWhatsApp = () => {
    const message = `🌟 Hey! Check out Kia Ora - get personalized messages from your favorite celebrities! 

Use my code: ${referralCode} for $10 off your first order!
https://kiaora.com/signup?ref=${referralCode}`

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank")
  }

  const sendInviteEmail = () => {
    if (!emailInput.trim()) {
      addToast({
        type: "error",
        title: "Email Required",
        description: "Please enter an email address to send the invitation.",
      })
      return
    }

    // Simulate sending invitation
    const newReferral: Referral = {
      id: Date.now().toString(),
      name: emailInput.split("@")[0],
      email: emailInput,
      status: "pending",
      dateReferred: new Date(),
      totalSpent: 0,
      reward: 0,
    }

    setReferrals((prev) => [...prev, newReferral])
    setEmailInput("")

    addToast({
      type: "success",
      title: "Invitation Sent!",
      description: `Referral invitation sent to ${emailInput}`,
    })
  }

  const getStatusColor = (status: Referral["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-300"
      case "signed_up":
        return "bg-blue-500/20 text-blue-300"
      case "first_purchase":
        return "bg-purple-500/20 text-purple-300"
      case "active":
        return "bg-green-500/20 text-green-300"
      default:
        return "bg-gray-500/20 text-gray-300"
    }
  }

  const getStatusText = (status: Referral["status"]) => {
    switch (status) {
      case "pending":
        return "Invitation Sent"
      case "signed_up":
        return "Signed Up"
      case "first_purchase":
        return "First Purchase"
      case "active":
        return "Active User"
      default:
        return "Unknown"
    }
  }

  const activeReferrals = referrals.filter((ref) => ref.status === "active" || ref.status === "first_purchase").length
  const progressToNextTier = nextTier
    ? ((activeReferrals - currentTier.minReferrals) / (nextTier.minReferrals - currentTier.minReferrals)) * 100
    : 100

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Referral Program</h2>
        <p className="text-purple-200">Earn rewards by sharing Kia Ora with friends</p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">${totalEarnings.toFixed(2)}</div>
            <div className="text-purple-200 text-sm">Total Earnings</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">${pendingEarnings.toFixed(2)}</div>
            <div className="text-purple-200 text-sm">Pending Earnings</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{referrals.length}</div>
            <div className="text-purple-200 text-sm">Total Referrals</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{activeReferrals}</div>
            <div className="text-purple-200 text-sm">Active Referrals</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Tier & Progress */}
      <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <div
              className={`w-10 h-10 bg-gradient-to-r ${currentTier.gradient} rounded-full flex items-center justify-center`}
            >
              {currentTier.icon}
            </div>
            Current Tier: {currentTier.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-3">Current Benefits</h4>
              <ul className="space-y-2">
                {currentTier.perks.map((perk, index) => (
                  <li key={index} className="text-purple-200 text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>

            {nextTier && nextTier !== currentTier && (
              <div>
                <h4 className="text-white font-semibold mb-3">Next Tier: {nextTier.name}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-200">Progress</span>
                    <span className="text-white">
                      {activeReferrals} / {nextTier.minReferrals} referrals
                    </span>
                  </div>
                  <Progress value={progressToNextTier} className="h-2" />
                  <p className="text-purple-300 text-sm">
                    {nextTier.minReferrals - activeReferrals} more active referrals to unlock {nextTier.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Referral Tools */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Share Your Code */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Your Referral Code</label>
              <div className="flex gap-2">
                <Input
                  value={referralCode}
                  readOnly
                  className="bg-white/10 border-white/20 text-white font-mono text-center"
                />
                <Button
                  onClick={copyReferralCode}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">Your Referral Link</label>
              <div className="flex gap-2">
                <Input
                  value={`https://kiaora.com/signup?ref=${referralCode}`}
                  readOnly
                  className="bg-white/10 border-white/20 text-white text-sm"
                />
                <Button
                  onClick={copyReferralLink}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={shareViaEmail}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Mail className="w-4 h-4 mr-2" />
                Share via Email
              </Button>
              <Button
                onClick={shareViaWhatsApp}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Share via WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Send Invitation */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Send Direct Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Friend's Email</label>
              <Input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter email address"
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
              />
            </div>

            <Button
              onClick={sendInviteEmail}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">How it works:</h4>
              <ul className="space-y-1 text-purple-200 text-sm">
                <li>• Your friend gets $10 off their first order</li>
                <li>• You earn {currentTier.bonusPercentage}% of their purchase</li>
                <li>• Both of you get exclusive offers</li>
                <li>• No limit on referrals!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral History */}
      <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Your Referrals
            </span>
            <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30">{referrals.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h4 className="text-white text-lg font-semibold mb-2">No referrals yet</h4>
              <p className="text-purple-200 mb-4">Start sharing your code to earn rewards!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <motion.div
                  key={referral.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{referral.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{referral.name}</h4>
                      <p className="text-purple-200 text-sm">{referral.email}</p>
                      <p className="text-purple-300 text-xs">Referred: {referral.dateReferred.toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge className={getStatusColor(referral.status)}>{getStatusText(referral.status)}</Badge>
                      {referral.totalSpent > 0 && (
                        <p className="text-purple-200 text-sm mt-1">Spent: ${referral.totalSpent}</p>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-white font-semibold">${referral.reward.toFixed(2)}</div>
                      <div className="text-purple-300 text-xs">earned</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Tiers Overview */}
      <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white">All Referral Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {referralTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl border-2 ${
                  tier.name === currentTier.name ? "border-purple-500 bg-purple-500/10" : "border-white/20 bg-white/5"
                }`}
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${tier.gradient} rounded-full flex items-center justify-center mb-4`}
                >
                  {tier.icon}
                </div>

                <h4 className="text-white font-bold mb-2">{tier.name}</h4>
                <p className="text-purple-200 text-sm mb-3">
                  {tier.minReferrals === 0 ? "Starting tier" : `${tier.minReferrals}+ active referrals`}
                </p>

                <div className="space-y-2">
                  <div className="text-white font-semibold">{tier.bonusPercentage}% referral bonus</div>

                  <ul className="space-y-1">
                    {tier.perks.slice(0, 2).map((perk, perkIndex) => (
                      <li key={perkIndex} className="text-purple-300 text-xs flex items-center gap-1">
                        <div className="w-1 h-1 bg-purple-400 rounded-full" />
                        {perk}
                      </li>
                    ))}
                    {tier.perks.length > 2 && (
                      <li className="text-purple-400 text-xs">+{tier.perks.length - 2} more perks</li>
                    )}
                  </ul>
                </div>

                {tier.name === currentTier.name && (
                  <Badge className="mt-3 bg-purple-500/20 text-purple-200 border-purple-500/30">Current Tier</Badge>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
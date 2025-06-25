"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Gift, CreditCard, Download, Share2, Copy, Calendar, Star, Heart, Sparkles, Crown, Zap } from "lucide-react"
import { useToast } from "@/components/frontend/toast-provider"

interface GiftCard {
  id: string
  amount: number
  design: string
  recipientName: string
  recipientEmail: string
  senderName: string
  message: string
  deliveryDate: Date
  status: "pending" | "sent" | "redeemed" | "expired"
  code: string
  createdAt: Date
  redeemedAt?: Date
  redeemedBy?: string
}

const giftCardDesigns = [
  {
    id: "birthday",
    name: "Birthday Celebration",
    image: "/placeholder.svg?height=200&width=300",
    gradient: "from-pink-500 via-purple-500 to-indigo-500",
    icon: <Gift className="w-6 h-6" />,
    description: "Perfect for birthday surprises",
  },
  {
    id: "anniversary",
    name: "Anniversary Special",
    image: "/placeholder.svg?height=200&width=300",
    gradient: "from-red-500 via-rose-500 to-pink-500",
    icon: <Heart className="w-6 h-6" />,
    description: "Celebrate love and milestones",
  },
  {
    id: "graduation",
    name: "Graduation Achievement",
    image: "/placeholder.svg?height=200&width=300",
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    icon: <Star className="w-6 h-6" />,
    description: "Honor academic success",
  },
  {
    id: "holiday",
    name: "Holiday Magic",
    image: "/placeholder.svg?height=200&width=300",
    gradient: "from-green-500 via-emerald-500 to-teal-500",
    icon: <Sparkles className="w-6 h-6" />,
    description: "Spread holiday cheer",
  },
  {
    id: "premium",
    name: "Premium Gold",
    image: "/placeholder.svg?height=200&width=300",
    gradient: "from-yellow-500 via-amber-500 to-orange-500",
    icon: <Crown className="w-6 h-6" />,
    description: "Luxury gift experience",
  },
  {
    id: "surprise",
    name: "Surprise Delight",
    image: "/placeholder.svg?height=200&width=300",
    gradient: "from-purple-500 via-violet-500 to-purple-600",
    icon: <Zap className="w-6 h-6" />,
    description: "For unexpected moments",
  },
]

const predefinedAmounts = [50, 100, 250, 500, 1000, 2500]

export default function GiftCardSystem() {
  const [activeTab, setActiveTab] = useState<"purchase" | "redeem" | "manage">("purchase")
  const [selectedDesign, setSelectedDesign] = useState(giftCardDesigns[0])
  const [customAmount, setCustomAmount] = useState("")
  const [selectedAmount, setSelectedAmount] = useState(100)
  const [giftCards, setGiftCards] = useState<GiftCard[]>([])
  const [redeemCode, setRedeemCode] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const { addToast } = useToast()

  const [purchaseForm, setPurchaseForm] = useState({
    recipientName: "",
    recipientEmail: "",
    senderName: "",
    message: "",
    deliveryDate: new Date().toISOString().split("T")[0],
    sendImmediately: true,
  })

  // Load gift cards from localStorage
  useEffect(() => {
    const savedCards = localStorage.getItem("kiaora-gift-cards")
    if (savedCards) {
      setGiftCards(JSON.parse(savedCards))
    }
  }, [])

  // Save gift cards to localStorage
  useEffect(() => {
    localStorage.setItem("kiaora-gift-cards", JSON.stringify(giftCards))
  }, [giftCards])

  const generateGiftCardCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = "KO-"
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += "-"
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handlePurchaseGiftCard = () => {
    if (!purchaseForm.recipientName || !purchaseForm.recipientEmail || !purchaseForm.senderName) {
      addToast({
        type: "error",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      })
      return
    }

    const amount = customAmount ? Number.parseInt(customAmount) : selectedAmount
    if (amount < 25 || amount > 5000) {
      addToast({
        type: "error",
        title: "Invalid Amount",
        description: "Gift card amount must be between $25 and $5,000.",
      })
      return
    }

    const newGiftCard: GiftCard = {
      id: Date.now().toString(),
      amount,
      design: selectedDesign.id,
      recipientName: purchaseForm.recipientName,
      recipientEmail: purchaseForm.recipientEmail,
      senderName: purchaseForm.senderName,
      message: purchaseForm.message,
      deliveryDate: new Date(purchaseForm.deliveryDate),
      status: "pending",
      code: generateGiftCardCode(),
      createdAt: new Date(),
    }

    setGiftCards((prev) => [...prev, newGiftCard])

    // Reset form
    setPurchaseForm({
      recipientName: "",
      recipientEmail: "",
      senderName: "",
      message: "",
      deliveryDate: new Date().toISOString().split("T")[0],
      sendImmediately: true,
    })
    setCustomAmount("")

    addToast({
      type: "success",
      title: "Gift Card Purchased!",
      description: `$${amount} gift card created successfully. Code: ${newGiftCard.code}`,
    })

    // Simulate sending email
    setTimeout(() => {
      setGiftCards((prev) => prev.map((card) => (card.id === newGiftCard.id ? { ...card, status: "sent" } : card)))
      addToast({
        type: "success",
        title: "Gift Card Sent",
        description: `Gift card has been sent to ${purchaseForm.recipientEmail}`,
      })
    }, 2000)
  }

  const handleRedeemGiftCard = () => {
    const card = giftCards.find((c) => c.code === redeemCode.toUpperCase())

    if (!card) {
      addToast({
        type: "error",
        title: "Invalid Code",
        description: "Gift card code not found. Please check and try again.",
      })
      return
    }

    if (card.status === "redeemed") {
      addToast({
        type: "error",
        title: "Already Redeemed",
        description: "This gift card has already been redeemed.",
      })
      return
    }

    if (card.status === "expired") {
      addToast({
        type: "error",
        title: "Expired",
        description: "This gift card has expired.",
      })
      return
    }

    // Redeem the gift card
    setGiftCards((prev) =>
      prev.map((c) =>
        c.id === card.id ? { ...c, status: "redeemed", redeemedAt: new Date(), redeemedBy: "Current User" } : c,
      ),
    )

    setRedeemCode("")

    addToast({
      type: "success",
      title: "Gift Card Redeemed!",
      description: `$${card.amount} has been added to your account balance.`,
    })
  }

  const copyGiftCardCode = (code: string) => {
    navigator.clipboard.writeText(code)
    addToast({
      type: "success",
      title: "Code Copied",
      description: "Gift card code copied to clipboard!",
    })
  }

  const downloadGiftCard = (card: GiftCard) => {
    // In a real app, this would generate a PDF or image
    addToast({
      type: "success",
      title: "Download Started",
      description: "Gift card is being downloaded as PDF.",
    })
  }

  const shareGiftCard = (card: GiftCard) => {
    const shareText = `I got you a $${card.amount} Kia Ora gift card! Use code: ${card.code}`

    if (navigator.share) {
      navigator.share({
        title: "Kia Ora Gift Card",
        text: shareText,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(shareText)
      addToast({
        type: "success",
        title: "Gift Card Shared",
        description: "Gift card details copied to clipboard!",
      })
    }
  }

  const getStatusColor = (status: GiftCard["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-300"
      case "sent":
        return "bg-blue-500/20 text-blue-300"
      case "redeemed":
        return "bg-green-500/20 text-green-300"
      case "expired":
        return "bg-red-500/20 text-red-300"
      default:
        return "bg-gray-500/20 text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Gift Cards</h2>
        <p className="text-purple-200">Give the gift of personalized celebrity messages</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-1 border border-white/20">
          {[
            { id: "purchase", label: "Purchase", icon: <CreditCard className="w-4 h-4" /> },
            { id: "redeem", label: "Redeem", icon: <Gift className="w-4 h-4" /> },
            { id: "manage", label: "Manage", icon: <Calendar className="w-4 h-4" /> },
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={`${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "text-purple-200 hover:text-white hover:bg-white/10"
              } flex items-center gap-2`}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Purchase Tab */}
      {activeTab === "purchase" && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Design Selection */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Choose Design</h3>
              <div className="grid grid-cols-2 gap-4">
                {giftCardDesigns.map((design) => (
                  <motion.div
                    key={design.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                      selectedDesign.id === design.id
                        ? "border-purple-500 ring-2 ring-purple-500/50"
                        : "border-white/20 hover:border-white/40"
                    }`}
                    onClick={() => setSelectedDesign(design)}
                  >
                    <div className={`h-24 bg-gradient-to-br ${design.gradient} flex items-center justify-center`}>
                      <div className="text-white">{design.icon}</div>
                    </div>
                    <div className="p-3 bg-white/10 backdrop-blur-lg">
                      <h4 className="text-white font-semibold text-sm">{design.name}</h4>
                      <p className="text-purple-200 text-xs">{design.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Amount Selection */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Select Amount</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {predefinedAmounts.map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount)
                      setCustomAmount("")
                    }}
                    variant={selectedAmount === amount && !customAmount ? "default" : "outline"}
                    className={`${
                      selectedAmount === amount && !customAmount
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    }`}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-white text-sm">Custom amount:</span>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                  min="25"
                  max="5000"
                />
              </div>
              <p className="text-purple-300 text-xs mt-2">Amount must be between $25 and $5,000</p>
            </div>
          </div>

          {/* Purchase Form */}
          <div className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">Gift Card Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Recipient Name *</label>
                    <Input
                      value={purchaseForm.recipientName}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, recipientName: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                      placeholder="Enter recipient name"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Your Name *</label>
                    <Input
                      value={purchaseForm.senderName}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, senderName: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Recipient Email *</label>
                  <Input
                    type="email"
                    value={purchaseForm.recipientEmail}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, recipientEmail: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                    placeholder="Enter recipient email"
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Personal Message</label>
                  <textarea
                    value={purchaseForm.message}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, message: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-purple-300 resize-none"
                    rows={3}
                    placeholder="Add a personal message (optional)"
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Delivery Date</label>
                  <Input
                    type="date"
                    value={purchaseForm.deliveryDate}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, deliveryDate: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <div className="text-white">
                    <span className="text-2xl font-bold">${customAmount || selectedAmount}</span>
                    <span className="text-purple-200 text-sm ml-2">USD</span>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowPreview(true)}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Preview
                    </Button>
                    <Button
                      onClick={handlePurchaseGiftCard}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      Purchase Gift Card
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Redeem Tab */}
      {activeTab === "redeem" && (
        <div className="max-w-md mx-auto">
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white text-2xl">Redeem Gift Card</CardTitle>
              <p className="text-purple-200">Enter your gift card code to add credit to your account</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Gift Card Code</label>
                <Input
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 text-center font-mono"
                  placeholder="KO-XXXX-XXXX-XXXX"
                  maxLength={17}
                />
                <p className="text-purple-300 text-xs mt-2 text-center">
                  Enter the code exactly as shown on your gift card
                </p>
              </div>

              <Button
                onClick={handleRedeemGiftCard}
                disabled={!redeemCode.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Redeem Gift Card
              </Button>

              <div className="text-center">
                <p className="text-purple-200 text-sm">
                  Need help?{" "}
                  <a href="/help" className="text-purple-400 hover:text-purple-300 underline">
                    Contact Support
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manage Tab */}
      {activeTab === "manage" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Your Gift Cards</h3>
            <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30">{giftCards.length} total</Badge>
          </div>

          {giftCards.length === 0 ? (
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardContent className="text-center py-12">
                <Gift className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h4 className="text-white text-xl font-semibold mb-2">No Gift Cards Yet</h4>
                <p className="text-purple-200 mb-6">Purchase your first gift card to get started</p>
                <Button
                  onClick={() => setActiveTab("purchase")}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Purchase Gift Card
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {giftCards.map((card) => {
                const design = giftCardDesigns.find((d) => d.id === card.design) || giftCardDesigns[0]

                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-200">
                      <div
                        className={`h-32 bg-gradient-to-br ${design.gradient} flex items-center justify-center relative overflow-hidden`}
                      >
                        <div className="text-white text-center">
                          {design.icon}
                          <div className="text-2xl font-bold mt-2">${card.amount}</div>
                        </div>
                        <Badge className={`absolute top-3 right-3 ${getStatusColor(card.status)}`}>{card.status}</Badge>
                      </div>

                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h4 className="text-white font-semibold">{design.name}</h4>
                          <p className="text-purple-200 text-sm">To: {card.recipientName}</p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-purple-300">
                          <span>Code: {card.code}</span>
                          <Button
                            onClick={() => copyGiftCardCode(card.code)}
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 text-purple-300 hover:text-white hover:bg-white/10"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>

                        {card.message && <p className="text-purple-200 text-sm italic">"{card.message}"</p>}

                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => downloadGiftCard(card)}
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <Button
                            onClick={() => shareGiftCard(card)}
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Gift Card Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gift Card Preview */}
              <div
                className={`h-48 bg-gradient-to-br ${selectedDesign.gradient} flex flex-col items-center justify-center text-white relative`}
              >
                <div className="text-center">
                  {selectedDesign.icon}
                  <div className="text-3xl font-bold mt-2">${customAmount || selectedAmount}</div>
                  <div className="text-sm opacity-90 mt-1">Kia Ora Gift Card</div>
                </div>
                <div className="absolute bottom-4 left-4 text-xs opacity-75">
                  From: {purchaseForm.senderName || "Your Name"}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  To: {purchaseForm.recipientName || "Recipient Name"}
                </h3>
                {purchaseForm.message && <p className="text-gray-600 italic mb-4">"{purchaseForm.message}"</p>}
                <p className="text-gray-500 text-sm mb-6">
                  This gift card can be used to purchase any celebrity message on Kia Ora.
                </p>

                <div className="flex gap-3">
                  <Button onClick={() => setShowPreview(false)} variant="outline" className="flex-1">
                    Close Preview
                  </Button>
                  <Button
                    onClick={() => {
                      setShowPreview(false)
                      handlePurchaseGiftCard()
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    Purchase Now
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
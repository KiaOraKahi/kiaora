"use client"

import type React from "react"

import { useState } from "react"
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, DollarSign, Loader2, CheckCircle, Star, Gift } from "lucide-react"
import { toast } from "sonner"

interface TipModalProps {
  orderNumber: string
  celebrityName: string
  celebrityImage?: string
  onTipSuccess?: () => void
  children: React.ReactNode
}

const PRESET_AMOUNTS = [5, 10, 25, 50, 100]

export function TipModal({ orderNumber, celebrityName, celebrityImage, onTipSuccess, children }: TipModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [message, setMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<"amount" | "payment" | "success">("amount")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [tipId, setTipId] = useState<string | null>(null)

  const stripe = useStripe()
  const elements = useElements()

  const getTipAmount = () => {
    if (selectedAmount) return selectedAmount
    const custom = Number.parseFloat(customAmount)
    return isNaN(custom) ? 0 : custom
  }

  const isValidAmount = () => {
    const amount = getTipAmount()
    return amount >= 1 && amount <= 1000
  }

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount(null)
  }

  const handleCreateTipPayment = async () => {
    if (!isValidAmount()) {
      toast.success("Please enter a tip amount between $1 and $1000")
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          amount: getTipAmount(),
          message: message.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create tip payment")
      }

      setClientSecret(data.clientSecret)
      setTipId(data.tipId)
      setPaymentStep("payment")

      toast.success(`Ready to process $${getTipAmount()} tip for ${celebrityName}`)
    } catch (error) {
      console.error("Error creating tip payment:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create tip payment")
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentSubmit = async () => {
    if (!stripe || !elements || !clientSecret) {
      toast.error("Payment system not ready. Please try again.")
      return
    }

    setIsProcessing(true)

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error("Card element not found")
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })

      if (error) {
        throw new Error(error.message || "Payment failed")
      }

      if (paymentIntent?.status === "succeeded") {
        setPaymentStep("success")
        toast.success(`Your $${getTipAmount()} tip has been sent to ${celebrityName}`)
        onTipSuccess?.()
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error(error instanceof Error ? error.message : "Payment processing failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const resetModal = () => {
    setPaymentStep("amount")
    setSelectedAmount(null)
    setCustomAmount("")
    setMessage("")
    setClientSecret(null)
    setTipId(null)
    setIsProcessing(false)
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(resetModal, 300) // Reset after modal closes
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-lg border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Heart className="w-6 h-6 text-pink-500" />
            Tip {celebrityName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Celebrity Info */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg">
            <Avatar className="w-12 h-12">
              <AvatarImage src={celebrityImage || "/placeholder.svg"} />
              <AvatarFallback>{celebrityName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{celebrityName}</h3>
              <p className="text-sm text-gray-600">Show your appreciation</p>
            </div>
          </div>

          {/* Amount Selection Step */}
          {paymentStep === "amount" && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Choose tip amount</Label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {PRESET_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount ? "default" : "outline"}
                      className={`h-12 ${
                        selectedAmount === amount
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                      onClick={() => handleAmountSelect(amount)}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>

                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="1"
                    max="1000"
                  />
                </div>

                {getTipAmount() > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Tip amount: <span className="font-semibold">${getTipAmount()}</span>
                    <span className="text-xs text-gray-500 ml-2">(100% goes to {celebrityName})</span>
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Add a message (optional)</Label>
                <Textarea
                  placeholder={`Thank you ${celebrityName}! Your video was amazing...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{message.length}/500 characters</p>
              </div>

              <Button
                onClick={handleCreateTipPayment}
                disabled={!isValidAmount() || isProcessing}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4 mr-2" />
                    Continue to Payment
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Payment Step */}
          {paymentStep === "payment" && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Tip Amount:</span>
                  <span className="font-semibold">${getTipAmount()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Goes to Celebrity:</span>
                  <span className="font-semibold text-green-600">${getTipAmount()}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-lg">${getTipAmount()}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Payment Details</Label>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#374151",
                          "::placeholder": {
                            color: "#9CA3AF",
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPaymentStep("amount")}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Back
                </Button>
                <Button
                  onClick={handlePaymentSubmit}
                  disabled={isProcessing || !stripe || !elements}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Send Tip
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {paymentStep === "success" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tip Sent Successfully!</h3>
                <p className="text-gray-600">
                  Your ${getTipAmount()} tip has been sent to {celebrityName}. They'll receive it directly in their
                  account.
                </p>
              </div>
              {message && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Your message:</strong> "{message}"
                  </p>
                </div>
              )}
              <Button onClick={handleClose} className="w-full">
                <Star className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

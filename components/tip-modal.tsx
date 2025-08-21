"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { Loader2, Heart, AlertCircle, CheckCircle, Clock, Lock } from "lucide-react"
import { toast } from "sonner"

// Stripe will be initialized lazily inside the component to avoid issues when the key is missing

// Tip amounts in dollars
const TIP_AMOUNTS = [5, 10, 20, 50, 100]

interface TipModalProps {
  children: React.ReactNode
  orderNumber: string
  celebrityName: string
  celebrityImage?: string
  onTipSuccess?: () => void
}

// Wrapper component that provides Stripe Elements context
export function TipModal({ children, orderNumber, celebrityName, celebrityImage, onTipSuccess }: TipModalProps) {
  const [open, setOpen] = useState(false)
  const [orderStatus, setOrderStatus] = useState<{
    status: string
    approvalStatus: string
    isApproved: boolean
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  const stripePromise = useMemo(() => (pk ? loadStripe(pk) : null), [pk])

  // Check order approval status when modal opens
  useEffect(() => {
    if (open && orderNumber) {
      checkOrderApprovalStatus()
    }
  }, [open, orderNumber])

  const checkOrderApprovalStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderNumber}`)
      if (response.ok) {
        const data = await response.json()
        setOrderStatus({
          status: data.status,
          approvalStatus: data.approvalStatus,
          isApproved: data.approvalStatus === "approved",
        })
      }
    } catch (error) {
      console.error("Error checking order status:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!pk) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogTitle></DialogTitle>
        <DialogContent className="sm:max-w-md">
          <div className="p-4 text-red-500 bg-red-50 rounded-lg">
            Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogTitle></DialogTitle>
      {stripePromise && (
        <Elements stripe={stripePromise}>
          <TipModalContent
            orderNumber={orderNumber}
            celebrityName={celebrityName}
            celebrityImage={celebrityImage}
            orderStatus={orderStatus}
            loading={loading}
            onTipSuccess={() => {
              setOpen(false)
              onTipSuccess?.()
            }}
          />
        </Elements>
      )}
    </Dialog>
  )
}

// Inner content component that uses Stripe hooks
function TipModalContent({
  orderNumber,
  celebrityName,
  celebrityImage,
  orderStatus,
  loading: statusLoading,
  onTipSuccess,
}: Omit<TipModalProps, "children"> & {
  orderStatus: { status: string; approvalStatus: string; isApproved: boolean } | null
  loading: boolean
}) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()

  const [customAmount, setCustomAmount] = useState("")
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "")
    setCustomAmount(value)
    setSelectedAmount(null)
  }

  const getSelectedAmount = (): number => {
    if (selectedAmount) return selectedAmount
    if (customAmount) {
      const parsed = Number.parseFloat(customAmount)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet. Please try again.")
      return
    }

    // Check approval status before allowing tip
    if (!orderStatus?.isApproved) {
      setError("Tips can only be sent after the video has been approved.")
      return
    }

    const amount = getSelectedAmount()

    if (!amount || amount < 1) {
      setError("Please select or enter a valid tip amount (minimum $1)")
      return
    }

    if (amount > 1000) {
      setError("Maximum tip amount is $1,000")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // 1. Create payment intent on the server
      const response = await fetch("/api/tips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber,
          amount,
          message: message.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to create tip payment")
      }

      if (!data.clientSecret) {
        throw new Error("No client secret returned from the server")
      }

      // 2. Confirm the payment with Stripe.js
      const cardElement = elements.getElement(CardElement)

      if (!cardElement) {
        throw new Error("Card element not found")
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })

      if (stripeError) {
        throw new Error(stripeError.message || "Payment failed")
      }

      if (paymentIntent?.status === "succeeded") {
        setPaymentSuccess(true)
        toast.success(`Thank you for your $${amount} tip to ${celebrityName}`)

        // Refresh the page data
        router.refresh()

        // Call the success callback
        if (onTipSuccess) {
          setTimeout(() => {
            onTipSuccess()
          }, 2000)
        }
      } else {
        throw new Error("Payment was not successful")
      }
    } catch (err) {
      console.error("Tip payment error:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking order status
  if (statusLoading) {
    return (
      <DialogContent className="sm:max-w-md">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          <span className="ml-2 text-muted-foreground">Checking order status...</span>
        </div>
      </DialogContent>
    )
  }

  // Show approval required message if video not approved
  if (orderStatus && !orderStatus.isApproved) {
    return (
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-orange-500" />
            Tips Not Available Yet
          </DialogTitle>
          <DialogDescription>
            Tips can only be sent after you've approved the video from {celebrityName}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="rounded-full bg-orange-100 p-3">
            <Clock className="h-8 w-8 text-orange-600" />
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Video Approval Required</h3>
            <p className="text-muted-foreground text-sm">
              {orderStatus.approvalStatus === "PENDING_APPROVAL"
                ? `${celebrityName} has uploaded your video and it's ready for review. Please approve it first to unlock tipping.`
                : orderStatus.approvalStatus === "DECLINED"
                  ? `You've requested revisions for this video. Tips will be available after you approve the final version.`
                  : `This video is still being processed. Tips will be available once the video is approved.`}
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 w-full">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
              </div>
              <div className="text-sm">
                <p className="font-medium text-orange-800">Current Status:</p>
                <p className="text-orange-700 capitalize">
                  {orderStatus.approvalStatus.replace("_", " ").toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
            Refresh Status
          </Button>
        </DialogFooter>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          Send a Tip to {celebrityName}
        </DialogTitle>
        <DialogDescription>Show your appreciation with a tip. 100% goes directly to {celebrityName}.</DialogDescription>
      </DialogHeader>

      {paymentSuccess ? (
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-center">Thank You!</h3>
          <p className="text-center text-muted-foreground">
            Your tip has been sent to {celebrityName}. They'll really appreciate your support!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Celebrity Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={celebrityImage || "/placeholder.svg"} alt={celebrityName} />
              <AvatarFallback>{celebrityName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{celebrityName}</p>
              <p className="text-sm text-muted-foreground">Order #{orderNumber}</p>
              {orderStatus?.isApproved && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Video approved
                </p>
              )}
            </div>
          </div>

          {/* Tip Amount Selection */}
          <div className="space-y-2">
            <Label>Select Tip Amount</Label>
            <div className="grid grid-cols-3 gap-2">
              {TIP_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={selectedAmount === amount ? "default" : "outline"}
                  onClick={() => handleAmountSelect(amount)}
                  className={selectedAmount === amount ? "bg-pink-500 hover:bg-pink-600" : ""}
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Custom Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="custom-amount"
                placeholder="Enter amount"
                className="pl-7"
                value={customAmount}
                onChange={handleCustomAmountChange}
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">{message.length}/200</p>
          </div>

          {/* Payment */}
          <div className="space-y-2">
            <Label>Card Details</Label>
            <div className="border rounded-md p-3">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#424770",
                      "::placeholder": {
                        color: "#aab7c4",
                      },
                    },
                    invalid: {
                      color: "#9e2146",
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={loading || !stripe || !elements || getSelectedAmount() <= 0}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Send ${getSelectedAmount() > 0 ? getSelectedAmount().toFixed(2) : "0.00"} Tip</>
              )}
            </Button>
          </DialogFooter>
        </form>
      )}
    </DialogContent>
  )
}

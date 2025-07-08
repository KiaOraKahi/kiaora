"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { CreditCard, Loader2, Shield, AlertCircle } from "lucide-react"

interface PaymentFormProps {
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  amount: number
  orderNumber: string
  paymentType?: "booking" | "tip"
}

export default function PaymentForm({
  onSuccess,
  onError,
  amount,
  orderNumber,
  paymentType = "booking",
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [paymentError, setPaymentError] = useState<string>("")

  // Check if Stripe and Elements are ready
  useEffect(() => {
    if (stripe && elements) {
      setIsReady(true)
    }
  }, [stripe, elements])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      onError("Payment system not ready. Please try again.")
      return
    }

    setIsLoading(true)
    setPaymentError("")

    try {
      console.log(`🔄 Processing ${paymentType} payment for order:`, orderNumber)

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderNumber}`,
        },
        redirect: "if_required",
      })

      if (error) {
        console.error("❌ Payment error:", error)
        const errorMessage = error.message || "An unexpected error occurred during payment."
        setPaymentError(errorMessage)
        onError(errorMessage)
      } else if (paymentIntent) {
        console.log("✅ Payment successful:", paymentIntent.status)

        if (paymentIntent.status === "succeeded") {
          onSuccess(paymentIntent)
        } else if (paymentIntent.status === "requires_action") {
          // Handle 3D Secure or other authentication
          console.log("🔐 Payment requires additional authentication")
          setPaymentError("Payment requires additional authentication. Please complete the verification.")
        } else {
          console.log("⏳ Payment status:", paymentIntent.status)
          setPaymentError("Payment is being processed. Please wait...")
        }
      }
    } catch (err) {
      console.error("❌ Payment processing error:", err)
      const errorMessage = err instanceof Error ? err.message : "Payment processing failed"
      setPaymentError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setPaymentError("")
    setIsLoading(false)
  }

  if (!isReady) {
    return (
      <div className="space-y-6">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-purple-200">Loading payment form...</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
        <PaymentElement
          options={{
            layout: "tabs",
            paymentMethodOrder: ["card", "apple_pay", "google_pay"],
          }}
        />
      </div>

      {/* Error Display */}
      {paymentError && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-red-300 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-semibold">Payment Error</span>
          </div>
          <p className="text-red-200 text-sm mb-3">{paymentError}</p>
          <Button
            type="button"
            onClick={handleRetry}
            variant="outline"
            size="sm"
            className="bg-red-500/20 border-red-500/30 text-red-200 hover:bg-red-500/30"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-purple-300 text-sm">
        <Shield className="w-4 h-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      {/* Payment Summary and Submit */}
      <div className="flex items-center justify-between pt-4 border-t border-white/20">
        <div className="text-purple-200">
          <p className="text-sm">{paymentType === "tip" ? "Tip Amount" : "Total Amount"}</p>
          <p className="text-2xl font-bold text-white">${amount}</p>
          {paymentType === "booking" && <p className="text-xs text-purple-300 mt-1">Includes platform fee</p>}
        </div>

        <Button
          type="submit"
          disabled={!stripe || !elements || isLoading}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              {paymentType === "tip" ? `Tip $${amount}` : `Pay $${amount}`}
            </>
          )}
        </Button>
      </div>

      {/* Payment Methods Info */}
      <div className="text-center text-purple-300 text-xs">
        <p>We accept all major credit cards, Apple Pay, and Google Pay</p>
      </div>
    </form>
  )
}

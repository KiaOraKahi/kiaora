"use client"

import type React from "react"

import { useState } from "react"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard, Shield } from "lucide-react"

interface PaymentFormProps {
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  amount: number
  orderNumber: string
}

export default function PaymentForm({ onSuccess, onError, amount, orderNumber }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      })

      if (error) {
        onError(error.message || "Payment failed")
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent)
      }
    } catch (err) {
      onError("An unexpected error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/10 rounded-lg p-6">
        <h5 className="text-white font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Details
        </h5>

        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-300 mb-2">
          <Shield className="w-4 h-4" />
          <span className="font-semibold">Secure Payment</span>
        </div>
        <p className="text-blue-200 text-sm">
          Your payment information is encrypted and secure. We use Stripe for processing payments.
        </p>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-12"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pay ${amount} - {orderNumber}
          </>
        )}
      </Button>

      <p className="text-purple-300 text-xs text-center">
        By completing this payment, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  )
}
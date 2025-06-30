"use client"

import type React from "react"

import { useState } from "react"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { CreditCard, Loader2 } from "lucide-react"

interface PaymentFormProps {
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
  amount: number
  orderNumber: string
}

export default function PaymentForm({ onSuccess, onError, amount, orderNumber }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderNumber}`,
      },
      redirect: "if_required",
    })

    if (error) {
      onError(error.message || "An unexpected error occurred.")
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent)
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/20">
        <div className="text-purple-200">
          <p className="text-sm">Total Amount</p>
          <p className="text-2xl font-bold text-white">${amount}</p>
        </div>
        <Button
          type="submit"
          disabled={!stripe || isLoading}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay ${amount}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

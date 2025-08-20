"use client"

import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import type { ReactNode } from "react"
import { useMemo } from "react"
import type { StripeElementsOptions } from "@stripe/stripe-js"

interface StripeProviderProps {
  children: ReactNode
  clientSecret: string
  theme?: "stripe" | "night" | "flat"
}

export default function StripeProvider({ children, clientSecret, theme = "night" }: StripeProviderProps) {
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  if (!pk) {
    console.error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable")
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        Stripe configuration error. Please check your environment variables.
      </div>
    )
  }

  if (!clientSecret) {
    return <div className="p-4 text-gray-500 bg-gray-50 rounded-lg">Loading payment form...</div>
  }

  const stripePromise = useMemo(() => loadStripe(pk), [pk])

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: theme,
      variables: {
        colorPrimary: "#8b5cf6",
        colorBackground: theme === "night" ? "#1e293b" : "#ffffff",
        colorText: theme === "night" ? "#ffffff" : "#1f2937",
        colorDanger: "#ef4444",
        colorSuccess: "#10b981",
        fontFamily: "Inter, system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
        focusBoxShadow: "0 0 0 2px rgba(139, 92, 246, 0.3)",
      },
      rules: {
        ".Input": {
          backgroundColor: theme === "night" ? "#334155" : "#f9fafb",
          border: `1px solid ${theme === "night" ? "#475569" : "#d1d5db"}`,
          padding: "12px",
          fontSize: "14px",
        },
        ".Input:focus": {
          border: "1px solid #8b5cf6",
          boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.1)",
        },
        ".Label": {
          color: theme === "night" ? "#e2e8f0" : "#374151",
          fontSize: "14px",
          fontWeight: "500",
          marginBottom: "6px",
        },
        ".Error": {
          color: "#ef4444",
          fontSize: "13px",
          marginTop: "4px",
        },
      },
    },
    loader: "auto",
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  )
}

// Export a hook for easier Stripe context access
export { useStripe, useElements } from "@stripe/react-stripe-js"

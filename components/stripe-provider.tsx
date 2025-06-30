"use client"

import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import type { ReactNode } from "react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeProviderProps {
  children: ReactNode
  clientSecret: string
}

export default function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: "night" as const,
      variables: {
        colorPrimary: "#8b5cf6",
        colorBackground: "#1e293b",
        colorText: "#ffffff",
        colorDanger: "#ef4444",
        fontFamily: "Inter, system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link")
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const result = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage(result.message)
        } else {
          setStatus("error")
          setMessage(result.error)
        }
      } catch (error) {
        setStatus("error")
        setMessage("Something went wrong. Please try again.")
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md bg-black/50 border-2 border-purple-500/50 backdrop-blur-lg">
          <CardContent className="p-8 text-center">
            {status === "loading" && (
              <>
                <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Verifying Email</h1>
                <p className="text-purple-200">Please wait while we verify your email address...</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
                <p className="text-purple-200 mb-6">{message}</p>
                <Button
                  onClick={() => router.push("/")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Continue to Kia Ora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
                <p className="text-purple-200 mb-6">{message}</p>
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Back to Home
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

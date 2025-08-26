"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "logging-in">("loading")
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

    const verifyEmailAndLogin = async () => {
      try {
        // First verify the email
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const result = await response.json()

        if (response.ok) {
          setStatus("logging-in")
          setMessage("Email verified! Logging you in...")

          // Auto-login using the returned login token
          if (result.loginToken) {
            try {
              const loginResponse = await fetch("/api/auth/auto-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ loginToken: result.loginToken }),
              })

              if (loginResponse.ok) {
                // Use NextAuth signIn with credentials
                const signInResult = await signIn("credentials", {
                  email: result.user.email,
                  password: "auto-login", // Special flag for auto-login
                  redirect: false,
                })

                if (signInResult?.ok) {
                  setStatus("success")
                  setMessage("Welcome to Kia Ora! You're now logged in.")
                  toast.success("Successfully logged in!")

                  // Redirect after a short delay
                  setTimeout(() => {
                    router.push("/")
                  }, 2000)
                } else {
                  // Verification successful but auto-login failed
                  setStatus("success")
                  setMessage("Email verified successfully! Please sign in to continue.")
                }
              } else {
                // Verification successful but auto-login failed
                setStatus("success")
                setMessage("Email verified successfully! Please sign in to continue.")
              }
            } catch (loginError) {
              console.error("Auto-login error:", loginError)
              setStatus("success")
              setMessage("Email verified successfully! Please sign in to continue.")
            }
          } else {
            setStatus("success")
            setMessage("Email verified successfully! Please sign in to continue.")
          }
        } else {
          setStatus("error")
          setMessage(result.error)
        }
      } catch (error) {
        console.error("Verification error:", error)
        setStatus("error")
        setMessage("Something went wrong. Please try again.")
      }
    }

    verifyEmailAndLogin()
  }, [token, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md bg-black/50 border-2 border-purple-500/50 backdrop-blur-lg">
          <CardContent className="p-8 text-center">
            {(status === "loading" || status === "logging-in") && (
              <>
                <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">
                  {status === "loading" ? "Verifying Email" : "Logging You In"}
                </h1>
                <p className="text-purple-200">
                  {status === "loading"
                    ? "Please wait while we verify your email address..."
                    : "Almost done! Setting up your session..."}
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Welcome to Kia Ora!</h1>
                <p className="text-purple-200 mb-6">{message}</p>
                <Button
                  onClick={() => router.push("/")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Continue to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
                <p className="text-purple-200 mb-6">{message}</p>
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/")}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Back to Home
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    Try Again
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
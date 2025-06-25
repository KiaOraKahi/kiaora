"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { RefreshCw, Home, AlertTriangle, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {/* Error icon */}
          <motion.div
            className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <AlertTriangle className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Something Went Wrong
          </motion.h1>

          <motion.p
            className="text-xl text-purple-200 mb-8 max-w-lg mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            We encountered an unexpected error. Our team has been notified and is working to fix this issue.
          </motion.p>

          {/* Error details for development */}
          {process.env.NODE_ENV === "development" && (
            <motion.div
              className="mb-8 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <h3 className="text-red-300 font-semibold mb-2">Error Details:</h3>
              <p className="text-red-200 text-sm font-mono">{error.message}</p>
              {error.digest && <p className="text-red-200 text-xs mt-2">Error ID: {error.digest}</p>}
            </motion.div>
          )}

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Button
              onClick={reset}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </Button>

            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-3"
              >
                <Home className="w-5 h-5 mr-2" />
                Go Home
              </Button>
            </Link>

            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-3"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Support
              </Button>
            </Link>
          </motion.div>

          {/* Help section */}
          <motion.div
            className="mt-12 p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <h3 className="text-white font-semibold mb-4">Need Help?</h3>
            <p className="text-purple-200 text-sm mb-4">
              If this problem persists, please contact our support team with the error details above.
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <Link href="/help" className="text-purple-300 hover:text-white transition-colors">
                Help Center
              </Link>
              <Link href="/contact" className="text-purple-300 hover:text-white transition-colors">
                Contact Support
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
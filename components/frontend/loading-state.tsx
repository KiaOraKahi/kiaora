"use client"

import { motion } from "framer-motion"
import { Loader2, Star, Sparkles } from "lucide-react"

export function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Animated logo */}
        <motion.div
          className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            scale: { duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          }}
        >
          <Star className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h2
          className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          Kia Ora
        </motion.h2>

        <motion.p
          className="text-purple-200 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Loading amazing content...
        </motion.p>

        {/* Loading dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-purple-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export function ButtonLoader({ children, isLoading, ...props }: any) {
  return (
    <button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export function SearchLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        <p className="text-purple-200">Searching celebrities...</p>
      </motion.div>
    </div>
  )
}

export function BookingLoader() {
  return (
    <div className="flex items-center justify-center py-8">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        <h3 className="text-white font-semibold mb-2">Processing Your Booking</h3>
        <p className="text-purple-200 text-sm">This may take a few moments...</p>
      </motion.div>
    </div>
  )
}
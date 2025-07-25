"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { heroGreetings } from "@/lib/services-data"

export default function AnimatedHeroTitle() {
  const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGreetingIndex((prev) => (prev + 1) % heroGreetings.length)
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-24 sm:h-32 lg:h-40 xl:h-48 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.h1
          key={currentGreetingIndex}
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
            backgroundPosition: {
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
          }}
          className="relative text-4xl sm:text-6xl lg:text-8xl xl:text-9xl font-bold bg-gradient-to-r from-white via-yellow-200 to-purple-200 bg-clip-text text-transparent"
          style={{
            backgroundSize: "200% 200%",
            filter: "drop-shadow(0 0 20px rgba(255, 215, 0, 0.3))",
          }}
        >
          <motion.span
            animate={{
              textShadow: [
                "0 0 20px rgba(255, 215, 0, 0.5)",
                "0 0 40px rgba(138, 43, 226, 0.5)",
                "0 0 20px rgba(255, 215, 0, 0.5)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            {heroGreetings[currentGreetingIndex]} Kahi
          </motion.span>
        </motion.h1>
      </AnimatePresence>
    </div>
  )
}

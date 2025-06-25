"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Home, Search, ArrowLeft, Star } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {/* Animated 404 */}
          <motion.div
            className="text-8xl sm:text-9xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-8"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            style={{
              backgroundSize: "200% 200%",
            }}
          >
            404
          </motion.div>

          {/* Floating stars */}
          <div className="relative mb-8">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 180, 360],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              >
                <Star className="w-6 h-6 text-purple-400" />
              </motion.div>
            ))}
          </div>

          <motion.h1
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Oops! Page Not Found
          </motion.h1>

          <motion.p
            className="text-xl text-purple-200 mb-8 max-w-lg mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            The celebrity you're looking for seems to have left the building. Don't worry, there are plenty more stars
            waiting to connect with you!
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="lg"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-3"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>

            <Link href="/">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3"
              >
                <Home className="w-5 h-5 mr-2" />
                Go Home
              </Button>
            </Link>

            <Link href="/search">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-3"
              >
                <Search className="w-5 h-5 mr-2" />
                Search Celebrities
              </Button>
            </Link>
          </motion.div>

          {/* Suggested actions */}
          <motion.div
            className="mt-12 p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <h3 className="text-white font-semibold mb-4">Popular Destinations</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Link href="/celebrities" className="text-purple-200 hover:text-white transition-colors">
                Browse All Celebrities
              </Link>
              <Link href="/categories" className="text-purple-200 hover:text-white transition-colors">
                Explore Categories
              </Link>
              <Link href="/how-it-works" className="text-purple-200 hover:text-white transition-colors">
                How It Works
              </Link>
              <Link href="/contact" className="text-purple-200 hover:text-white transition-colors">
                Contact Support
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
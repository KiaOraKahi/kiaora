"use client"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, Zap, Shield, TrendingUp, ArrowRight, Star, Users, Globe, CheckCircle } from "lucide-react"
import Navbar from "@/components/frontend/navbar"
import MobileNavbar from "@/components/frontend/mobile-navbar"
import Footer from "@/components/frontend/footer"
import Link from "next/link"

const features = [
  {
    icon: Crown,
    title: "Premium Platform",
    description: "Join an exclusive platform for verified celebrities and creators",
    gradient: "from-pink-500 to-purple-500"
  },
  {
    icon: Zap,
    title: "Easy Setup",
    description: "Quick onboarding process with dedicated support team",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Shield,
    title: "Secure & Safe",
    description: "Advanced security measures to protect your privacy and earnings",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: TrendingUp,
    title: "Grow Your Brand",
    description: "Expand your reach and connect with fans in a meaningful way",
    gradient: "from-purple-500 to-pink-500"
  }
]

const stats = [
  { number: "10K+", label: "Happy Celebrities", icon: Star },
  { number: "1M+", label: "Fans Connected", icon: Users },
  { number: "50+", label: "Countries Served", icon: Globe },
  { number: "99.9%", label: "Uptime", icon: CheckCircle }
]

export default function PlatformPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <MobileNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              The Ultimate
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Platform</span>
              <br />
              for Celebrity Engagement
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Connect with your favorite celebrities through personalized video messages. 
              Our platform brings fans and stars together in meaningful ways.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/celebrities">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  Browse Celebrities
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/join-celebrity">
                <Button size="lg" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white">
                  Join as Celebrity
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We've built the most trusted platform for celebrity interactions with these key benefits.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30 shadow-lg shadow-purple-500/10 h-full hover:border-purple-400/50 transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Join thousands of celebrities and fans who are already using our platform to create meaningful connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/celebrities">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  Find Your Celebrity
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/join-celebrity">
                <Button size="lg" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white">
                  Become a Celebrity
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

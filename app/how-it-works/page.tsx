"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  MessageSquare,
  CreditCard,
  Video,
  Star,
  Clock,
  Shield,
  Heart,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import Image from "next/image"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import { useEffect, useState } from "react"
import MobileNavbar from "@/components/frontend/mobile-navbar"

const steps = [
  {
    number: "01",
    icon: <Search className="w-8 h-8" />,
    title: "Browse & Discover",
    description: "Explore our list of celebrities across entertainment, sports, business, social media and more.",
    details: [
      "Filter by category, price, or rating",
      "View celebrity profiles and sample videos",
    ],
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    icon: <MessageSquare className="w-8 h-8" />,
    title: "Personalise Your Request",
    description: "Tell us exactly what you want your celebrity to say and who it's for.",
    details: [
      "Choose from birthday, motivation, business, or custom messages",
      "Add personal details to make it special",
      "Include pronunciation guides for names",
    ],
    color: "from-purple-500 to-indigo-500",
  },
  {
    number: "03",
    icon: <CreditCard className="w-8 h-8" />,
    title: "Secure Payment",
    description: "Complete your booking with our secure payment system.",
    details: [
      "Multiple payment options available",
      "100% secure and encrypted transactions",
      "Money-back guarantee if not delivered",
    ],
    color: "from-green-500 to-emerald-500",
  },
  {
    number: "04",
    icon: <Video className="w-8 h-8" />,
    title: "Receive Your Video",
    description: "Get your personalised video message within the promised timeframe.",
    details: [
      "High-quality video delivered to your email",
      "Download and share with friends and family",
      "Keep forever as a cherished memory",
    ],
    color: "from-pink-500 to-rose-500",
  },
]

const features = [
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Fast Delivery",
    description: "Most videos delivered within 7 days",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Satisfaction Guaranteed",
    description: "100% money-back guarantee",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Quality Assured",
    description: "All celebrities are verified",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Personal Touch",
    description: "Every message is personalised",
  },
]

const faqs = [
  {
    question: "How long does it take to receive my video?",
    answer:
      "Most celebrities deliver within 7 days, though some may be faster. You'll see the expected delivery time on each celebrity's profile.",
  },
  {
    question: "What if I'm not satisfied with my video?",
    answer:
      "We offer a 100% satisfaction guarantee. If you're not happy with your video, we'll work with the celebrity to make it right or provide a full refund.",
  },
  {
    question: "Can I request a specific message or script?",
    answer:
      "You can provide detailed instructions about what you'd like the celebrity to say, including specific names, occasions, and personal touches.",
  },
  {
    question: "Are the celebrities really doing the videos themselves?",
    answer:
      "Yes! All our celebrities are verified and create their own videos. We have strict quality controls to ensure authenticity.",
  },
]

// Subtle starfield component
const SubtleLuxuryStarfield = () => {
  useEffect(() => {
    const existingStarfield = document.querySelector(".starfield")
    if (existingStarfield) {
      existingStarfield.remove()
    }

    const createStar = () => {
      const star = document.createElement("div")
      const size = Math.random() * 2 + 1
      const type = Math.random()

      if (type > 0.97) {
        star.className = "star diamond"
        star.style.width = `${size * 1.5}px`
        star.style.height = `${size * 1.5}px`
      } else if (type > 0.93) {
        star.className = "star sapphire"
        star.style.width = `${size * 1.2}px`
        star.style.height = `${size * 1.2}px`
      } else {
        star.className = "star"
        star.style.width = `${size}px`
        star.style.height = `${size}px`
      }

      star.style.left = `${Math.random() * 100}%`
      star.style.top = `${Math.random() * 100}%`
      star.style.animationDelay = `${Math.random() * 5}s`

      return star
    }

    const starfield = document.createElement("div")
    starfield.className = "starfield"

    for (let i = 0; i < 60; i++) {
      starfield.appendChild(createStar())
    }

    document.body.appendChild(starfield)

    return () => {
      const starfieldToRemove = document.querySelector(".starfield")
      if (starfieldToRemove && document.body.contains(starfieldToRemove)) {
        document.body.removeChild(starfieldToRemove)
      }
    }
  }, [])

  return null
}

export default function HowItWorksPage() {
  const [isMobile, setIsMobile] = useState(false)
    
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {isMobile ? <MobileNavbar /> : <Navbar />}

      <SubtleLuxuryStarfield />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.5),transparent)]" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {/* <Badge className="mb-6 bg-purple-500/20 text-purple-200 border-purple-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              How It Works
            </Badge> */}
            <motion.h1
                  className="relative text-4xl sm:text-6xl lg:text-8xl xl:text-9xl font-bold bg-gradient-to-r from-white via-yellow-200 to-purple-200 bg-clip-text text-transparent mb-2"
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
                    filter: "drop-shadow(0 0 20px rgba(255, 215, 0, 0.3))",
                  }}
                >
                  How It Works
                </motion.h1>
            {/* <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              How It Works
            </h1> */}
            {/* <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              Simple Steps to Celebrity Magic
            </h1> */}
            <p className="text-xl sm:text-2xl text-purple-200 max-w-4xl mx-auto leading-relaxed">
              Getting a personalised message from your favorite celebrity is easier than you think. Here's how it works.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-20">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`grid lg:grid-cols-2 gap-16 items-center ${index % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}
              >
                <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                  <div className="flex items-center mb-6">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center mr-4`}
                    >
                      <div className="text-white">{step.icon}</div>
                    </div>
                    <div className="text-6xl font-bold text-white/10">{step.number}</div>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-xl text-purple-200 mb-6 leading-relaxed">{step.description}</p>
                  <ul className="space-y-3">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center text-purple-200">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={index % 2 === 1 ? "lg:col-start-1" : ""}>
                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg overflow-hidden">
                    <CardContent className="p-0">
                      <Image
                        src={`/placeholder.svg?height=400&width=600&text=Step ${step.number}`}
                        alt={step.title}
                        width={600}
                        height={400}
                        className="w-full h-auto"
                      />
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Why Choose Kia Ora?</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              We've built the most trusted platform for celebrity interactions with these key benefits.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300 text-center h-full">
                  <CardContent className="p-8">
                    <div className="text-purple-400 mb-4 flex justify-center">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-purple-200">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-purple-200">Got questions? We've got answers to help you get started.</p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold text-white mb-4">{faq.question}</h3>
                    <p className="text-purple-200 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-white/20 rounded-3xl p-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Join thousands of happy customers who have received amazing personalised messages from their favorite
              celebrities.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-4 text-lg"
            >
              Browse Celebrities
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}

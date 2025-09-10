"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Shield,
  AlertTriangle,
  Eye,
  Lock,
  Users,
  MessageCircle,
  Flag,
  CheckCircle,
  Sparkles,
} from "lucide-react"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import { useEffect, useState } from "react"
import MobileNavbar from "@/components/frontend/mobile-navbar"

const safetyGuidelines = [
  {
    id: "appropriate-content",
    title: "Appropriate Content Guidelines",
    icon: <CheckCircle className="w-6 h-6" />,
    color: "from-green-500 to-emerald-500",
    guidelines: [
      "Keep all requests family-friendly and appropriate",
      "No requests for illegal, harmful, or offensive content",
      "Respect celebrity boundaries and personal limits",
      "Avoid sharing sensitive personal information",
      "No harassment, bullying, or threatening language",
    ],
  },
  {
    id: "privacy-protection",
    title: "Privacy & Personal Information",
    icon: <Lock className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500",
    guidelines: [
      "Never share passwords or account credentials",
      "Be cautious about sharing personal details in messages",
      "Don't include private contact information in requests",
      "Report any suspicious activity immediately",
      "Use secure payment methods only",
    ],
  },
  {
    id: "respectful-interaction",
    title: "Respectful Interactions",
    icon: <Users className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500",
    guidelines: [
      "Treat all celebrities with respect and kindness",
      "Understand that celebrities may decline certain requests",
      "Be patient with delivery timeframes",
      "Provide clear, polite instructions in your requests",
      "Respect intellectual property and usage rights",
    ],
  },
  {
    id: "platform-security",
    title: "Platform Security",
    icon: <Shield className="w-6 h-6" />,
    color: "from-orange-500 to-red-500",
    guidelines: [
      "Only use official Kia Ora channels for bookings",
      "Verify celebrity authenticity through our verification badges",
      "Report fake profiles or suspicious accounts",
      "Keep your account information up to date",
      "Log out from shared or public devices",
    ],
  },
]

const reportingProcess = [
  {
    step: 1,
    title: "Identify the Issue",
    description: "Determine what type of safety concern you're reporting",
    icon: <Eye className="w-6 h-6" />,
  },
  {
    step: 2,
    title: "Gather Information",
    description: "Collect relevant details, screenshots, or evidence",
    icon: <MessageCircle className="w-6 h-6" />,
  },
  {
    step: 3,
    title: "Submit Report",
    description: "Use our reporting tools or contact support directly",
    icon: <Flag className="w-6 h-6" />,
  },
  {
    step: 4,
    title: "Follow Up",
    description: "We'll investigate and respond within 24-48 hours",
    icon: <CheckCircle className="w-6 h-6" />,
  },
]

export default function SafetyPage() {
  const [isMobile, setIsMobile] = useState(false)
        
      useEffect(() => {
        const checkMobile = () => {
          setIsMobile(window.innerWidth < 1024)
        }
    
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
      }, [])

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

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {isMobile ? <MobileNavbar /> : <Navbar />}

      <SubtleLuxuryStarfield />
      {/* Starfield Background */}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-purple-500/20 text-purple-200 border-purple-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Safety Guidelines
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              Your Safety is Our Priority
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
              Learn about our safety guidelines and best practices to ensure a positive experience for everyone on our
              platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Safety Guidelines */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Community Guidelines</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Follow these guidelines to ensure a safe and positive experience for all users.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {safetyGuidelines.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${section.color} rounded-full flex items-center justify-center`}
                      >
                        <div className="text-white">{section.icon}</div>
                      </div>
                      <h3 className="text-2xl font-bold text-white">{section.title}</h3>
                    </div>

                    <ul className="space-y-3">
                      {section.guidelines.map((guideline, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-purple-200">{guideline}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reporting Process */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">How to Report Safety Concerns</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              If you encounter any safety issues, follow these steps to report them to our team.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {reportingProcess.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg text-center h-full">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">{step.step}</span>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="text-purple-400">{step.icon}</div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-purple-200 text-sm">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Report Safety Issues */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-purple-500/30 rounded-3xl p-12">
            <AlertTriangle className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Report Safety Issues</h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              If you encounter any safety concerns or inappropriate behavior, please report it to our support team immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-4 text-lg"
                onClick={() => (window.location.href = "/contact")}
              >
                <Flag className="w-5 h-5 mr-2" />
                Report Issue
              </Button>
            </div>
            <div className="mt-8 space-y-2 text-purple-200">
              <p>
                <strong>Support Email:</strong> support@kiaora.com
              </p>
              <p className="text-sm">
                We respond to all safety reports within 24 hours and take immediate action when necessary.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}

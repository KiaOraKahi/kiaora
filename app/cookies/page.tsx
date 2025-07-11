"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Cookie, Settings, BarChart, Target, Shield, Sparkles } from "lucide-react"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import { useEffect, useState } from "react"
import MobileNavbar from "@/components/frontend/mobile-navbar"

const cookieTypes = [
  {
    id: "essential",
    title: "Essential Cookies",
    icon: <Shield className="w-6 h-6" />,
    description: "These cookies are necessary for the website to function and cannot be switched off.",
    color: "from-green-500 to-emerald-500",
    required: true,
    examples: [
      "Authentication and security",
      "Shopping cart functionality",
      "Form submission data",
      "Session management",
    ],
  },
  {
    id: "analytics",
    title: "Analytics Cookies",
    icon: <BarChart className="w-6 h-6" />,
    description: "These cookies help us understand how visitors interact with our website.",
    color: "from-blue-500 to-cyan-500",
    required: false,
    examples: ["Page views and traffic sources", "User behavior patterns", "Performance metrics", "Error tracking"],
  },
  {
    id: "marketing",
    title: "Marketing Cookies",
    icon: <Target className="w-6 h-6" />,
    description: "These cookies are used to deliver personalized advertisements and track campaign effectiveness.",
    color: "from-purple-500 to-pink-500",
    required: false,
    examples: ["Personalized advertisements", "Social media integration", "Campaign tracking", "Retargeting pixels"],
  },
  {
    id: "preferences",
    title: "Preference Cookies",
    icon: <Settings className="w-6 h-6" />,
    description: "These cookies remember your preferences and settings to enhance your experience.",
    color: "from-orange-500 to-red-500",
    required: false,
    examples: ["Language preferences", "Theme settings", "Notification preferences", "Customization options"],
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

export default function CookiesPage() {
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
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-purple-500/20 text-purple-200 border-purple-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Cookie Policy
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              Cookie Policy
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
              Learn about how we use cookies and similar technologies to improve your experience on our platform.
            </p>
            <div className="text-purple-300">
              <p>Last updated: June 24, 2025</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What Are Cookies Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg mb-12">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">What Are Cookies?</h2>
                </div>
                <div className="space-y-4 text-purple-200 leading-relaxed">
                  <p>
                    Cookies are small text files that are stored on your device when you visit our website. They help us
                    provide you with a better experience by remembering your preferences, keeping you logged in, and
                    understanding how you use our platform.
                  </p>
                  <p>
                    We use both first-party cookies (set by Kia Ora) and third-party cookies (set by our partners) to
                    enhance functionality, analyze usage, and deliver personalized content.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Cookie Types */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Types of Cookies We Use</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              We use different types of cookies for various purposes. Here's what each type does and how you can control
              them.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {cookieTypes.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 bg-gradient-to-r ${type.color} rounded-full flex items-center justify-center`}
                        >
                          <div className="text-white">{type.icon}</div>
                        </div>
                        <h3 className="text-2xl font-bold text-white">{type.title}</h3>
                      </div>
                      {type.required && (
                        <Badge className="bg-green-500/20 text-green-200 border-green-500/30">Required</Badge>
                      )}
                    </div>

                    <p className="text-purple-200 mb-6 leading-relaxed">{type.description}</p>

                    <div className="space-y-3">
                      <h4 className="text-white font-semibold">Examples:</h4>
                      <ul className="space-y-2">
                        {type.examples.map((example, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-purple-200 text-sm">
                            <div className="w-1 h-1 bg-purple-400 rounded-full" />
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Managing Cookies */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Managing Your Cookie Preferences</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Cookie Consent Banner</h3>
                    <p className="text-purple-200 leading-relaxed">
                      When you first visit our website, you'll see a cookie consent banner where you can choose which
                      types of cookies to accept. You can change these preferences at any time.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Browser Settings</h3>
                    <p className="text-purple-200 leading-relaxed">
                      You can also manage cookies through your browser settings. Most browsers allow you to block or
                      delete cookies, though this may affect your experience on our website.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Third-Party Opt-Outs</h3>
                    <p className="text-purple-200 leading-relaxed">
                      For third-party cookies, you can opt out directly with the service providers or use industry
                      opt-out tools like the Digital Advertising Alliance's opt-out page.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/20">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Cookie Preferences
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-white/20 rounded-3xl p-12">
            <Cookie className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Questions About Cookies?</h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              If you have any questions about our use of cookies or this policy, please don't hesitate to contact us.
            </p>
            <div className="space-y-4">
              <p className="text-purple-200">
                <strong>Email:</strong> privacy@kiaora.com
              </p>
              <p className="text-purple-200">
                <strong>Address:</strong> 1234 Hollywood Blvd, Suite 567, Los Angeles, CA 90028
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
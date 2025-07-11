"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Eye, Lock, Users, Database, Globe, Sparkles } from "lucide-react"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import { useEffect, useState } from "react"
import MobileNavbar from "@/components/frontend/mobile-navbar"

const privacySections = [
  {
    id: "information-collection",
    title: "Information We Collect",
    icon: <Database className="w-6 h-6" />,
    content: [
      {
        subtitle: "Personal Information",
        text: "We collect information you provide directly to us, such as when you create an account, book a celebrity message, or contact us for support. This includes your name, email address, phone number, and payment information.",
      },
      {
        subtitle: "Usage Information",
        text: "We automatically collect certain information about your use of our platform, including your IP address, browser type, device information, and how you interact with our services.",
      },
      {
        subtitle: "Message Content",
        text: "We collect the content of your message requests to celebrities, including any personal details you provide to make the message more personalized.",
      },
    ],
  },
  {
    id: "information-use",
    title: "How We Use Your Information",
    icon: <Eye className="w-6 h-6" />,
    content: [
      {
        subtitle: "Service Delivery",
        text: "We use your information to process your bookings, facilitate communication with celebrities, deliver your personalized videos, and provide customer support.",
      },
      {
        subtitle: "Platform Improvement",
        text: "We analyze usage patterns to improve our platform, develop new features, and enhance user experience while maintaining your privacy.",
      },
      {
        subtitle: "Communication",
        text: "We may send you service-related emails, order updates, and promotional communications (which you can opt out of at any time).",
      },
    ],
  },
  {
    id: "information-sharing",
    title: "Information Sharing",
    icon: <Users className="w-6 h-6" />,
    content: [
      {
        subtitle: "With Celebrities",
        text: "We share your message requests and relevant personal details with the celebrities you book to enable them to create personalized content for you.",
      },
      {
        subtitle: "Service Providers",
        text: "We work with trusted third-party service providers for payment processing, email delivery, and analytics. These providers are bound by strict confidentiality agreements.",
      },
      {
        subtitle: "Legal Requirements",
        text: "We may disclose your information if required by law, to protect our rights, or to ensure the safety of our users and platform.",
      },
    ],
  },
  {
    id: "data-security",
    title: "Data Security",
    icon: <Lock className="w-6 h-6" />,
    content: [
      {
        subtitle: "Encryption",
        text: "All sensitive data is encrypted both in transit and at rest using industry-standard encryption protocols to protect your information from unauthorized access.",
      },
      {
        subtitle: "Access Controls",
        text: "We implement strict access controls and regularly audit our systems to ensure only authorized personnel can access your personal information.",
      },
      {
        subtitle: "Regular Security Updates",
        text: "Our security measures are continuously updated to address emerging threats and maintain the highest level of protection for your data.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "Your Privacy Rights",
    icon: <Shield className="w-6 h-6" />,
    content: [
      {
        subtitle: "Access and Correction",
        text: "You have the right to access, update, or correct your personal information at any time through your account settings or by contacting our support team.",
      },
      {
        subtitle: "Data Deletion",
        text: "You can request deletion of your personal data, subject to certain legal and operational requirements. Some information may be retained for legitimate business purposes.",
      },
      {
        subtitle: "Marketing Opt-out",
        text: "You can opt out of marketing communications at any time by clicking the unsubscribe link in our emails or updating your preferences in your account.",
      },
    ],
  },
  {
    id: "international-transfers",
    title: "International Data Transfers",
    icon: <Globe className="w-6 h-6" />,
    content: [
      {
        subtitle: "Global Operations",
        text: "As we operate globally, your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.",
      },
      {
        subtitle: "Compliance Standards",
        text: "We comply with applicable data protection laws, including GDPR for European users and CCPA for California residents, regardless of where your data is processed.",
      },
    ],
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

export default function PrivacyPage() {
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
      {/* Navbar */}

      <SubtleLuxuryStarfield />
      {/* Starfield Background */}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-purple-500/20 text-purple-200 border-purple-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Privacy Policy
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              Your Privacy Matters
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
              We're committed to protecting your privacy and being transparent about how we collect, use, and protect
              your personal information.
            </p>
            <div className="text-purple-300">
              <p>Last updated: June 24, 2025</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            {privacySections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <div className="text-white">{section.icon}</div>
                      </div>
                      <h2 className="text-3xl font-bold text-white">{section.title}</h2>
                    </div>

                    <div className="space-y-6">
                      {section.content.map((item, idx) => (
                        <div key={idx}>
                          <h3 className="text-xl font-semibold text-white mb-3">{item.subtitle}</h3>
                          <p className="text-purple-200 leading-relaxed">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-white/20 rounded-3xl p-12">
            <Shield className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Questions About Privacy?</h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              If you have any questions about this Privacy Policy or how we handle your data, please don't hesitate to
              contact us.
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
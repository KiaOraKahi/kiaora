"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, Heart, Star, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import { useEffect, useState } from "react"
import MobileNavbar from "@/components/frontend/mobile-navbar"

const guidelineSections = [
  {
    id: "respect-and-kindness",
    title: "Respect & Kindness",
    icon: <Heart className="w-6 h-6" />,
    content: [
      {
        subtitle: "Treat Everyone with Respect",
        text: "We believe in creating a positive, inclusive environment where everyone feels valued and respected. Treat all users, celebrities, and staff with kindness and courtesy.",
      },
      {
        subtitle: "Inclusive Language",
        text: "Use inclusive language that welcomes people of all backgrounds, abilities, and identities. Avoid discriminatory language, slurs, or offensive comments.",
      },
      {
        subtitle: "Cultural Sensitivity",
        text: "Be mindful of cultural differences and traditions. Respect the diverse backgrounds of our community members and avoid making assumptions or stereotypes.",
      },
    ],
  },
  {
    id: "content-standards",
    title: "Content Standards",
    icon: <Star className="w-6 h-6" />,
    content: [
      {
        subtitle: "Appropriate Content",
        text: "All content must be appropriate for all audiences. Avoid explicit, violent, or disturbing content. Keep messages positive, uplifting, and suitable for the intended recipient.",
      },
      {
        subtitle: "Original Content",
        text: "Celebrities should create original, personalized content for each request. Avoid using generic templates or recycled content that doesn't address the specific request.",
      },
      {
        subtitle: "Quality Standards",
        text: "Maintain high quality in all content. Videos should be clear, well-lit, and audible. Written content should be grammatically correct and well-structured.",
      },
    ],
  },
  {
    id: "safety-guidelines",
    title: "Safety Guidelines",
    icon: <Shield className="w-6 h-6" />,
    content: [
      {
        subtitle: "Personal Information",
        text: "Never share personal information such as addresses, phone numbers, or financial details. Keep all communication within the platform's secure messaging system.",
      },
      {
        subtitle: "Meeting in Person",
        text: "Our platform is for virtual interactions only. Never arrange to meet users or celebrities in person. All communication should remain within the platform.",
      },
      {
        subtitle: "Reporting Concerns",
        text: "If you encounter any inappropriate behavior, harassment, or safety concerns, report them immediately to our support team at safety@kiaora.com.",
      },
    ],
  },
  {
    id: "celebrity-guidelines",
    title: "Celebrity Guidelines",
    icon: <Users className="w-6 h-6" />,
    content: [
      {
        subtitle: "Professional Conduct",
        text: "Maintain professional behavior at all times. Respond to booking requests promptly and deliver content within the agreed timeframe.",
      },
      {
        subtitle: "Authentic Representation",
        text: "Be authentic in your profile and interactions. Don't misrepresent your identity, skills, or availability. Keep your profile information accurate and up-to-date.",
      },
      {
        subtitle: "Content Delivery",
        text: "Deliver high-quality, personalized content that meets the specific requirements of each booking. If you cannot fulfill a request, communicate this clearly and promptly.",
      },
    ],
  },
  {
    id: "prohibited-behavior",
    title: "Prohibited Behavior",
    icon: <XCircle className="w-6 h-6" />,
    content: [
      {
        subtitle: "Harassment and Bullying",
        text: "Harassment, bullying, intimidation, or any form of abusive behavior is strictly prohibited. This includes repeated unwanted contact, threats, or personal attacks.",
      },
      {
        subtitle: "Inappropriate Content",
        text: "Content that is sexually explicit, violent, discriminatory, or otherwise inappropriate is not allowed. This includes content that promotes illegal activities or harmful behavior.",
      },
      {
        subtitle: "Spam and Scams",
        text: "Spamming, phishing, or any form of fraudulent activity is prohibited. Don't send unsolicited messages or attempt to deceive other users.",
      },
    ],
  },
  {
    id: "enforcement",
    title: "Enforcement",
    icon: <AlertTriangle className="w-6 h-6" />,
    content: [
      {
        subtitle: "Violation Consequences",
        text: "Violations of these guidelines may result in warnings, temporary suspensions, or permanent bans from the platform, depending on the severity of the violation.",
      },
      {
        subtitle: "Appeals Process",
        text: "If you believe you've been unfairly penalized, you can appeal the decision by contacting our support team with a detailed explanation of your situation.",
      },
      {
        subtitle: "Continuous Improvement",
        text: "These guidelines are regularly reviewed and updated to ensure they remain relevant and effective in maintaining a positive community environment.",
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

export default function CommunityGuidelinesPage() {
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
              <Users className="w-4 h-4 mr-2" />
              Community Guidelines
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              Building a Positive Community
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
              These guidelines help us maintain a safe, respectful, and enjoyable environment for everyone in our community.
            </p>
            <div className="text-purple-300">
              <p>Last updated: June 24, 2025</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Guidelines Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            {guidelineSections.map((section, index) => (
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
            <CheckCircle className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Questions About Guidelines?</h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              If you have any questions about these guidelines or need to report a violation, please contact our support team.
            </p>
            <div className="space-y-4">
              <p className="text-purple-200">
                <strong>Email:</strong> community@kiaora.com
              </p>
              <p className="text-purple-200">
                <strong>Safety Concerns:</strong> safety@kiaora.com
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}

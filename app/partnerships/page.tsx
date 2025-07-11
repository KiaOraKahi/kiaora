"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Handshake, Users, Globe, Star, Award, Sparkles, ArrowRight, Building, Megaphone } from "lucide-react"
import Image from "next/image"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import { useEffect, useState } from "react"
import MobileNavbar from "@/components/frontend/mobile-navbar"

const partnershipTypes = [
  {
    id: "brand-partnerships",
    title: "Brand Partnerships",
    icon: <Building className="w-8 h-8" />,
    description: "Collaborate with us to create unique celebrity endorsement campaigns",
    color: "from-blue-500 to-cyan-500",
    benefits: [
      "Access to 500+ verified celebrities",
      "Custom campaign development",
      "Performance analytics and reporting",
      "Dedicated account management",
    ],
    examples: ["Product launches", "Brand awareness campaigns", "Seasonal promotions", "Event marketing"],
  },
  {
    id: "talent-agencies",
    title: "Talent Agencies",
    icon: <Users className="w-8 h-8" />,
    description: "Partner with us to expand your talent's earning opportunities",
    color: "from-purple-500 to-pink-500",
    benefits: [
      "Additional revenue stream for talent",
      "Flexible scheduling options",
      "Professional platform management",
      "Transparent payment processing",
    ],
    examples: [
      "Celebrity roster expansion",
      "Fan engagement programs",
      "Digital presence growth",
      "Revenue diversification",
    ],
  },
  {
    id: "media-companies",
    title: "Media Companies",
    icon: <Megaphone className="w-8 h-8" />,
    description: "Integrate celebrity messages into your content and platforms",
    color: "from-green-500 to-emerald-500",
    benefits: [
      "API integration capabilities",
      "White-label solutions",
      "Content licensing options",
      "Technical support and documentation",
    ],
    examples: ["App integrations", "Content platforms", "Social media tools", "Entertainment apps"],
  },
  {
    id: "enterprise",
    title: "Enterprise Solutions",
    icon: <Globe className="w-8 h-8" />,
    description: "Custom celebrity engagement solutions for large organizations",
    color: "from-orange-500 to-red-500",
    benefits: [
      "Bulk booking discounts",
      "Custom pricing structures",
      "Priority celebrity access",
      "Dedicated support team",
    ],
    examples: ["Corporate events", "Employee recognition", "Customer rewards", "Marketing campaigns"],
  },
]

const partnerLogos = [
  { name: "Netflix", logo: "/placeholder.svg?height=60&width=120&text=Netflix" },
  { name: "Disney", logo: "/placeholder.svg?height=60&width=120&text=Disney" },
  { name: "Warner Bros", logo: "/placeholder.svg?height=60&width=120&text=Warner" },
  { name: "Universal", logo: "/placeholder.svg?height=60&width=120&text=Universal" },
  { name: "Sony", logo: "/placeholder.svg?height=60&width=120&text=Sony" },
  { name: "Paramount", logo: "/placeholder.svg?height=60&width=120&text=Paramount" },
]

const stats = [
  { number: "500+", label: "Celebrity Partners", icon: <Star className="w-6 h-6" /> },
  { number: "50M+", label: "Total Reach", icon: <Users className="w-6 h-6" /> },
  { number: "98%", label: "Partner Satisfaction", icon: <Award className="w-6 h-6" /> },
  { number: "150+", label: "Brand Collaborations", icon: <Handshake className="w-6 h-6" /> },
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

export default function PartnershipsPage() {
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
              Brand Partnerships
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              Partner with Kia Ora
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
              Join forces with the leading celebrity engagement platform to create unforgettable brand experiences and
              drive meaningful connections.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-4 text-lg"
            >
              Become a Partner
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg text-center">
                  <CardContent className="p-6">
                    <div className="text-purple-400 mb-4 flex justify-center">{stat.icon}</div>
                    <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                    <div className="text-purple-200">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Partnership Opportunities</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Discover how we can work together to create exceptional celebrity experiences.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {partnershipTypes.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-r ${type.color} flex items-center justify-center`}
                      >
                        <div className="text-white">{type.icon}</div>
                      </div>
                      <h3 className="text-2xl font-bold text-white">{type.title}</h3>
                    </div>

                    <p className="text-purple-200 mb-6 leading-relaxed">{type.description}</p>

                    <div className="space-y-4 mb-6">
                      <h4 className="text-white font-semibold">Key Benefits:</h4>
                      <ul className="space-y-2">
                        {type.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-purple-200 text-sm">
                            <div className="w-1 h-1 bg-purple-400 rounded-full" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-semibold">Use Cases:</h4>
                      <div className="flex flex-wrap gap-2">
                        {type.examples.map((example, idx) => (
                          <Badge key={idx} variant="outline" className="border-purple-500/30 text-purple-200">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Logos */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Trusted by Industry Leaders</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Join the brands and organizations already partnering with Kia Ora.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {partnerLogos.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex justify-center"
              >
                <div className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors duration-300">
                  <Image
                    src={partner.logo || "/placeholder.svg"}
                    alt={partner.name}
                    width={120}
                    height={60}
                    className="opacity-70 hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
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
            <Handshake className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready to Partner with Us?</h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Let's discuss how we can work together to create amazing celebrity experiences for your audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-4 text-lg"
                onClick={() => (window.location.href = "/contact")}
              >
                Contact Partnerships Team
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-12 py-4 text-lg"
              >
                Download Partnership Guide
              </Button>
            </div>
            <div className="mt-8 space-y-2 text-purple-200">
              <p>
                <strong>Partnerships Email:</strong> partnerships@kiaora.com
              </p>
              <p>
                <strong>Business Development:</strong> +1 (555) 123-BDEV
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
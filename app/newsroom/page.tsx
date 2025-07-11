"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowRight, Download, ExternalLink, Award, Sparkles } from "lucide-react"
import Image from "next/image"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import { useEffect, useState } from "react"
import MobileNavbar from "@/components/frontend/mobile-navbar"

const pressReleases = [
  {
    id: 1,
    title: "Kia Ora Reaches 1 Million Celebrity Messages Delivered Milestone",
    excerpt: "Platform celebrates major milestone as celebrity engagement continues to grow globally",
    date: "December 15, 2024",
    category: "Company News",
    image: "/placeholder.svg?height=200&width=400&text=Milestone",
    featured: true,
  },
  {
    id: 2,
    title: "Partnership with Major Entertainment Studios Announced",
    excerpt: "New partnerships bring A-list celebrities to the platform for exclusive fan experiences",
    date: "November 28, 2024",
    category: "Partnerships",
    image: "/placeholder.svg?height=200&width=400&text=Partnership",
    featured: false,
  },
  {
    id: 3,
    title: "Kia Ora Launches AI-Powered Celebrity Matching Technology",
    excerpt: "Revolutionary technology helps fans find the perfect celebrity for their message needs",
    date: "January 10, 2025",
    category: "Product",
    image: "/placeholder.svg?height=200&width=400&text=AI+Tech",
    featured: false,
  },
  {
    id: 4,
    title: "Celebrity Earnings on Platform Exceed $50 Million",
    excerpt: "Platform continues to provide significant income opportunities for talent partners",
    date: "May 22, 2025",
    category: "Financial",
    image: "/placeholder.svg?height=200&width=400&text=Earnings",
    featured: false,
  },
]

const awards = [
  {
    title: "Best Celebrity Engagement Platform 2024",
    organization: "Digital Innovation Awards",
    date: "2025",
    image: "/placeholder.svg?height=100&width=100&text=Award",
  },
  {
    title: "Top 50 Most Innovative Companies",
    organization: "Tech Innovator Magazine",
    date: "2025",
    image: "/placeholder.svg?height=100&width=100&text=Top50",
  },
  {
    title: "Excellence in Fan Experience",
    organization: "Entertainment Technology Awards",
    date: "2023",
    image: "/placeholder.svg?height=100&width=100&text=Excellence",
  },
]

const mediaKit = [
  {
    title: "Company Fact Sheet",
    description: "Key statistics and company information",
    type: "PDF",
    size: "2.1 MB",
  },
  {
    title: "High-Resolution Logos",
    description: "Brand assets and logo variations",
    type: "ZIP",
    size: "15.3 MB",
  },
  {
    title: "Executive Photos",
    description: "Professional headshots of leadership team",
    type: "ZIP",
    size: "8.7 MB",
  },
  {
    title: "Product Screenshots",
    description: "Platform interface and feature highlights",
    type: "ZIP",
    size: "12.4 MB",
  },
]

const companyStats = [
  { number: "500+", label: "Celebrity Partners" },
  { number: "1M+", label: "Messages Delivered" },
  { number: "150+", label: "Countries Served" },
  { number: "99%", label: "Customer Satisfaction" },
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

export default function NewsroomPage() {
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
              Newsroom
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              Latest News & Updates
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
              Stay up to date with the latest news, announcements, and milestones from Kia Ora.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Press Release */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {pressReleases
            .filter((release) => release.featured)
            .map((release) => (
              <motion.div
                key={release.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid lg:grid-cols-2 gap-0">
                      <div className="relative h-64 lg:h-auto">
                        <Image
                          src={release.image || "/placeholder.svg"}
                          alt={release.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Featured</Badge>
                        </div>
                      </div>
                      <div className="p-8 flex flex-col justify-center">
                        <Badge className="w-fit mb-4 bg-purple-500/20 text-purple-200 border-purple-500/30">
                          {release.category}
                        </Badge>
                        <h2 className="text-3xl font-bold text-white mb-4">{release.title}</h2>
                        <p className="text-purple-200 mb-6 leading-relaxed">{release.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-purple-300 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{release.date}</span>
                          </div>
                          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                            Read Full Story
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>
      </section>

      {/* Recent Press Releases */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Recent Press Releases</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Catch up on our latest announcements and company updates.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pressReleases
              .filter((release) => !release.featured)
              .map((release, index) => (
                <motion.div
                  key={release.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300 h-full cursor-pointer">
                    <CardContent className="p-0">
                      <div className="relative h-48">
                        <Image
                          src={release.image || "/placeholder.svg"}
                          alt={release.title}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                      </div>
                      <div className="p-6">
                        <Badge className="mb-3 bg-purple-500/20 text-purple-200 border-purple-500/30">
                          {release.category}
                        </Badge>
                        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{release.title}</h3>
                        <p className="text-purple-200 mb-4 text-sm line-clamp-3">{release.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-purple-300 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{release.date}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 p-0">
                            Read More
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Company at a Glance</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Key metrics that showcase our growth and impact in the celebrity engagement space.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {companyStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg text-center">
                  <CardContent className="p-6">
                    <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                    <div className="text-purple-200">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Awards & Recognition</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Industry recognition for our innovation and excellence in celebrity engagement.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {awards.map((award, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg text-center h-full">
                  <CardContent className="p-8">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Award className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{award.title}</h3>
                    <p className="text-purple-200 mb-2">{award.organization}</p>
                    <p className="text-purple-300 text-sm">{award.date}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Media Kit</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Download our media resources for press coverage and brand materials.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mediaKit.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-purple-200 text-sm mb-3">{item.description}</p>
                    <div className="flex items-center justify-between text-purple-300 text-xs">
                      <span>{item.type}</span>
                      <span>{item.size}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
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
            <User className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Media Inquiries</h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              For press inquiries, interview requests, or additional information, please contact our media team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-4 text-lg"
              >
                Contact Media Team
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-12 py-4 text-lg"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Download Media Kit
              </Button>
            </div>
            <div className="mt-8 space-y-2 text-purple-200">
              <p>
                <strong>Media Contact:</strong> press@kiaora.com
              </p>
              <p>
                <strong>Press Hotline:</strong> +1 (555) 123-PRESS
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}

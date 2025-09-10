"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
  Star,
  Clock,
  CreditCard,
  Shield,
  Sparkles,
} from "lucide-react"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import MobileNavbar from "@/components/frontend/mobile-navbar"

const faqCategories = [
  {
    id: "general",
    name: "General Questions",
    icon: <HelpCircle className="w-5 h-5" />,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "booking",
    name: "Booking Process",
    icon: <Star className="w-5 h-5" />,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "payment",
    name: "Payment & Billing",
    icon: <CreditCard className="w-5 h-5" />,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "delivery",
    name: "Delivery & Timeline",
    icon: <Clock className="w-5 h-5" />,
    color: "from-orange-500 to-red-500",
  },
  {
    id: "support",
    name: "Support & Policies",
    icon: <Shield className="w-5 h-5" />,
    color: "from-indigo-500 to-purple-500",
  },
]

const faqs = [
  {
    id: 1,
    category: "general",
    question: "What is Kia Ora and how does it work?",
    answer:
      "Kia Ora is a platform that connects fans with their favorite celebrities for personalized video messages. You browse our celebrity roster, select your favorite, provide details about what you'd like them to say, complete payment, and receive your custom video message within the promised timeframe.",
  },
  {
    id: 2,
    category: "general",
    question: "How do I know the celebrities are real?",
    answer:
      "All celebrities on our platform are verified through a rigorous authentication process. We verify their identity, social media accounts, and work directly with their representatives. You'll see a verification badge on authentic celebrity profiles.",
  },
  {
    id: 3,
    category: "booking",
    question: "How do I book a celebrity message?",
    answer:
      "Simply browse our celebrity list, click on your chosen celebrity, fill out the booking form with your message details, select any add-ons you want, and complete payment. You'll receive a confirmation email immediately after booking.",
  },
  {
    id: 4,
    category: "booking",
    question: "Can I request specific content in my message?",
    answer:
      "You can provide detailed instructions about what you'd like the celebrity to say, including names, occasions, personal touches, and specific messages. The more detail you provide, the more personalized your video will be.",
  },
  {
    id: 5,
    category: "booking",
    question: "What if a celebrity declines my request?",
    answer:
      "While rare, if a celebrity declines your request, you'll receive a full refund within 3-5 business days. We'll also help you find an alternative celebrity who might be a good fit for your message.",
  },
  {
    id: 6,
    category: "payment",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, and Google Pay. All transactions are processed securely through our encrypted payment system.",
  },
  {
    id: 7,
    category: "payment",
    question: "When am I charged for my order?",
    answer:
      "You're charged immediately upon completing your booking. However, if a celebrity declines your request or doesn't deliver within the promised timeframe, you'll receive a full refund automatically.",
  },
  {
    id: 8,
    category: "payment",
    question: "Can I get a refund if I'm not satisfied?",
    answer:
      "Yes! We offer a 100% satisfaction guarantee. If you're not happy with your video message, contact our support team within 7 days of delivery, and we'll work to make it right or provide a full refund.",
  },
  {
    id: 9,
    category: "delivery",
    question: "How long does it take to receive my video?",
    answer:
      "Delivery times vary by celebrity, typically ranging from 1-14 days. You'll see the expected delivery time on each celebrity's profile before booking. Rush delivery options are available for an additional fee.",
  },
  {
    id: 10,
    category: "delivery",
    question: "How will I receive my video message?",
    answer:
      "Your video will be delivered via email as a high-quality MP4 file. You'll also have access to download it from your account dashboard. The video is yours to keep forever and share as you wish (for personal use).",
  },
  {
    id: 11,
    category: "delivery",
    question: "What if my video is late?",
    answer:
      "If your video isn't delivered within the promised timeframe, you'll automatically receive a full refund. We also offer rush delivery options if you need your video by a specific date.",
  },
  {
    id: 12,
    category: "support",
    question: "Can I use the video for commercial purposes?",
    answer:
      "Standard bookings are for personal use only. If you need commercial usage rights for business, marketing, or promotional purposes, you can purchase a commercial license add-on during booking.",
  },
  {
    id: 13,
    category: "support",
    question: "What's your privacy policy?",
    answer:
      "We take privacy seriously. Your personal information is never shared with third parties except as necessary to fulfill your order. Celebrity messages are private between you and the celebrity unless you choose to share them.",
  },
  {
    id: 14,
    category: "support",
    question: "How can I contact customer support?",
    answer:
      "We offer comprehensive email support 24/7 through multiple specialized channels:\n\n• General Support: support@kiaora.com - For booking issues, account problems, and general inquiries\n• General Questions: hello@kiaora.com - For information about our services and platform\n• Billing Support: billing@kiaora.com - For payment issues, refunds, and billing questions\n• Accessibility Support: accessibility@kiaora.com - For sign language support and accessibility needs\n\nWe respond to all emails within 24 hours and are committed to providing excellent customer service. You can also visit our Contact page for more detailed information and to submit a support request form.",
  },
  {
    id: 15,
    category: "general",
    question: "Do celebrities write their own messages?",
    answer:
      "Yes! All messages are personally created by the celebrities themselves. They read your instructions and create a custom video message based on your specific requests. This ensures authenticity and a personal touch.",
  },
  {
    id: 16,
    category: "booking",
    question: "Can I book multiple celebrities for one occasion?",
    answer:
      "You can book as many celebrities as you'd like. Each booking is separate, but you can coordinate delivery dates if you're planning a special surprise with multiple messages.",
  },
  {
    id: 17,
    category: "delivery",
    question: "What video quality can I expect?",
    answer:
      "All videos are delivered in high-definition (1080p) quality as standard. 4K Ultra HD is available as an add-on for select celebrities. Videos are professionally shot with good lighting and clear audio.",
  },
  {
    id: 18,
    category: "payment",
    question: "Are there any hidden fees?",
    answer:
      "No hidden fees! The price you see is what you pay, unless you choose optional add-ons like rush delivery, extended length, or commercial licensing. All fees are clearly displayed before checkout.",
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

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

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
              Help Center
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
              Find answers to common questions about booking celebrity messages, payments, delivery, and more.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }
            >
              All Questions
            </Button>
            {faqCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                }
              >
                {category.icon}
                <span className="ml-2">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length > 0 ? (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300">
                    <CardContent className="p-0">
                      <button
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
                        onClick={() => toggleFAQ(faq.id)}
                      >
                        <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                        {expandedFAQ === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        )}
                      </button>

                      {expandedFAQ === faq.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-white/10"
                        >
                          <div className="p-6 pt-4">
                            <p className="text-purple-200 leading-relaxed">{faq.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
              <p className="text-purple-200">Try adjusting your search terms or browse different categories</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-white/20 rounded-3xl p-12">
            <MessageCircle className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Still Have Questions?</h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-4 text-lg"
                onClick={() => (window.location.href = "/contact")}
              >
                Contact Support
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-12 py-4 text-lg"
                onClick={() => (window.location.href = "/how-it-works")}
              >
                How It Works
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
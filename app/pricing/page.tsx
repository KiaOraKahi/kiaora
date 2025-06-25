"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, X, Star, Zap, Crown, Gift, Sparkles } from "lucide-react"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"

const pricingTiers = [
  {
    name: "Basic",
    price: 99,
    originalPrice: null,
    description: "Perfect for personal messages and birthday wishes",
    color: "from-blue-500 to-cyan-500",
    popular: false,
    features: [
      "1-2 minute personalized video",
      "HD quality (1080p)",
      "Standard delivery (5-7 days)",
      "Digital download",
      "Personal use license",
      "Email support",
    ],
    notIncluded: ["Rush delivery", "4K quality", "Commercial use", "Extended length"],
    celebrities: "Emerging influencers, local celebrities",
  },
  {
    name: "Premium",
    price: 299,
    originalPrice: 399,
    description: "Most popular choice for special occasions",
    color: "from-purple-500 to-pink-500",
    popular: true,
    features: [
      "2-4 minute personalized video",
      "4K Ultra HD quality",
      "Priority delivery (3-5 days)",
      "Digital download + cloud storage",
      "Personal use license",
      "Priority email support",
      "Custom background music",
      "Multiple takes if needed",
    ],
    notIncluded: ["Rush delivery (24-48h)", "Commercial use license"],
    celebrities: "A-list actors, chart-topping musicians, sports stars",
  },
  {
    name: "VIP",
    price: 999,
    originalPrice: null,
    description: "Ultimate celebrity experience with premium features",
    color: "from-yellow-500 to-orange-500",
    popular: false,
    features: [
      "5-10 minute personalized video",
      "4K Ultra HD quality",
      "Rush delivery (24-48 hours)",
      "Digital download + cloud storage",
      "Commercial use license",
      "Dedicated account manager",
      "Custom background music",
      "Multiple takes guaranteed",
      "Live video call option",
      "Signed digital certificate",
    ],
    notIncluded: [],
    celebrities: "Hollywood A-listers, Grammy winners, Olympic champions",
  },
]

const addOns = [
  {
    name: "Rush Delivery",
    price: 99,
    description: "Get your video in 24-48 hours",
    icon: <Zap className="w-5 h-5" />,
  },
  {
    name: "Extended Length",
    price: 199,
    description: "Up to 10 minutes instead of standard length",
    icon: <Star className="w-5 h-5" />,
  },
  {
    name: "Commercial License",
    price: 299,
    description: "Use for business, marketing, or commercial purposes",
    icon: <Crown className="w-5 h-5" />,
  },
  {
    name: "Gift Packaging",
    price: 49,
    description: "Beautiful digital gift presentation",
    icon: <Gift className="w-5 h-5" />,
  },
]

const faqs = [
  {
    question: "What's included in each pricing tier?",
    answer:
      "Each tier includes a personalized video message, digital download, and email support. Higher tiers offer better quality, faster delivery, and additional features like commercial licensing.",
  },
  {
    question: "Can I upgrade my order after booking?",
    answer:
      "Yes, you can upgrade your order within 24 hours of booking by contacting our support team. Additional charges may apply.",
  },
  {
    question: "What if the celebrity doesn't deliver?",
    answer:
      "We have a 100% delivery guarantee. If a celebrity doesn't fulfill your request, we'll provide a full refund or help you book with another celebrity.",
  },
  {
    question: "Are there any hidden fees?",
    answer:
      "No hidden fees! The price you see is what you pay, unless you choose to add optional extras like rush delivery or extended length.",
  },
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"one-time" | "subscription">("one-time")
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-purple-500/20 text-purple-200 border-purple-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Transparent Pricing
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              Simple, Fair Pricing
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
              Choose the perfect plan for your celebrity message needs. No hidden fees, no surprises.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className={`relative ${tier.popular ? "scale-105" : ""}`}
              >
                <Card
                  className={`bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300 h-full overflow-hidden ${tier.popular ? "border-purple-500/50" : ""}`}
                >
                  {tier.popular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                      <p className="text-purple-200 mb-6">{tier.description}</p>

                      <div className="mb-6">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-5xl font-bold text-white">${tier.price}</span>
                          {tier.originalPrice && (
                            <span className="text-2xl text-purple-300 line-through">${tier.originalPrice}</span>
                          )}
                        </div>
                        <p className="text-purple-200 text-sm mt-2">per message</p>
                      </div>

                      <p className="text-purple-300 text-sm mb-6">{tier.celebrities}</p>
                    </div>

                    <div className="space-y-4 mb-8">
                      <h4 className="text-white font-semibold">What's included:</h4>
                      {tier.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-purple-200 text-sm">{feature}</span>
                        </div>
                      ))}

                      {tier.notIncluded.length > 0 && (
                        <>
                          <h4 className="text-white font-semibold mt-6">Not included:</h4>
                          {tier.notIncluded.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                              <span className="text-purple-300 text-sm">{feature}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>

                    <Button
                      className={`w-full ${tier.popular ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" : "bg-white/10 border border-white/20 hover:bg-white/20"} text-white`}
                      onClick={() => setSelectedTier(tier.name)}
                    >
                      Choose {tier.name}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Optional Add-ons</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Enhance your celebrity message with these premium features.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addOn, index) => (
              <motion.div
                key={addOn.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="text-white">{addOn.icon}</div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{addOn.name}</h3>
                    <p className="text-purple-200 text-sm mb-4">{addOn.description}</p>
                    <div className="text-2xl font-bold text-purple-300">+${addOn.price}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
            <p className="text-xl text-purple-200">Everything you need to know about our pricing.</p>
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
              Choose your plan and start creating unforgettable moments with your favorite celebrities.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-4 text-lg"
              onClick={() => (window.location.href = "/celebrities")}
            >
              Browse Celebrities
            </Button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}

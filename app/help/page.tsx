"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  BookOpen,
  Video,
  Users,
  Settings,
  Sparkles,
  ArrowRight,
  Clock,
  Shield,
  Star,
} from "lucide-react"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"

const helpCategories = [
  {
    icon: <HelpCircle className="w-8 h-8" />,
    title: "Getting Started",
    description: "Learn the basics of using Kia Ora",
    color: "from-blue-500 to-cyan-500",
    articles: [
      "How to create your first booking",
      "Understanding celebrity profiles",
      "Choosing the right service type",
      "Setting up your account",
    ],
    link: "/help/getting-started",
  },
  {
    icon: <Star className="w-8 h-8" />,
    title: "Booking Process",
    description: "Step-by-step booking guidance",
    color: "from-purple-500 to-pink-500",
    articles: [
      "How to book a celebrity message",
      "Writing effective message requests",
      "Selecting add-ons and upgrades",
      "Payment and checkout process",
    ],
    link: "/help/booking",
  },
  {
    icon: <Video className="w-8 h-8" />,
    title: "Video Messages",
    description: "Everything about your video content",
    color: "from-green-500 to-emerald-500",
    articles: [
      "Video quality and formats",
      "Download and sharing options",
      "Delivery timeframes",
      "What to expect in your video",
    ],
    link: "/help/videos",
  },
  {
    icon: <Settings className="w-8 h-8" />,
    title: "Account Management",
    description: "Managing your Kia Ora account",
    color: "from-orange-500 to-red-500",
    articles: [
      "Updating your profile",
      "Order history and tracking",
      "Notification preferences",
      "Account security settings",
    ],
    link: "/help/account",
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Policies & Safety",
    description: "Our policies and safety guidelines",
    color: "from-indigo-500 to-purple-500",
    articles: ["Terms of service", "Privacy policy", "Refund and cancellation policy", "Community guidelines"],
    link: "/help/policies",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "For Celebrities",
    description: "Information for talent partners",
    color: "from-pink-500 to-rose-500",
    articles: [
      "Joining as a celebrity",
      "Setting your rates and availability",
      "Managing requests",
      "Payment and earnings",
    ],
    link: "/help/celebrities",
  },
]

const quickActions = [
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Live Chat",
    description: "Get instant help from our support team",
    action: "Start Chat",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: <Phone className="w-6 h-6" />,
    title: "Call Support",
    description: "Speak directly with a support agent",
    action: "Call Now",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Email Support",
    description: "Send us a detailed message",
    action: "Send Email",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Browse FAQ",
    description: "Find answers to common questions",
    action: "View FAQ",
    color: "from-orange-500 to-red-500",
  },
]

const popularArticles = [
  {
    title: "How to book your first celebrity message",
    category: "Getting Started",
    readTime: "3 min read",
    views: "12.5k views",
  },
  {
    title: "What to include in your message request",
    category: "Booking Process",
    readTime: "5 min read",
    views: "8.2k views",
  },
  {
    title: "Understanding delivery timeframes",
    category: "Video Messages",
    readTime: "2 min read",
    views: "6.8k views",
  },
  {
    title: "Refund and cancellation policy explained",
    category: "Policies",
    readTime: "4 min read",
    views: "5.1k views",
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-purple-500/20 text-purple-200 border-purple-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Help Center
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              How Can We Help You?
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
              Find answers, get support, and learn everything you need to know about using Kia Ora.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Get Help Right Away</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Choose the support method that works best for you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center mx-auto mb-4`}
                    >
                      <div className="text-white">{action.icon}</div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{action.title}</h3>
                    <p className="text-purple-200 text-sm mb-4">{action.description}</p>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      {action.action}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Browse Help Topics</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Explore our comprehensive help documentation organized by topic.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {helpCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300 h-full">
                  <CardContent className="p-8">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center mb-6`}
                    >
                      <div className="text-white">{category.icon}</div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3">{category.title}</h3>
                    <p className="text-purple-200 mb-6">{category.description}</p>

                    <div className="space-y-2 mb-6">
                      {category.articles.map((article, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-purple-300 text-sm">
                          <div className="w-1 h-1 bg-purple-400 rounded-full" />
                          <span>{article}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Explore {category.title}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Popular Articles</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              The most helpful articles based on what other users are reading.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {popularArticles.map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30">
                        {article.category}
                      </Badge>
                      <div className="flex items-center gap-4 text-purple-300 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{article.readTime}</span>
                        </div>
                        <span>{article.views}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{article.title}</h3>
                    <Button variant="ghost" className="text-purple-400 hover:text-purple-300 p-0 h-auto">
                      Read article
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-white/20 rounded-3xl p-12">
            <MessageCircle className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Still Need Help?</h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Our support team is available 24/7 to help you with any questions or issues you might have.
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
                onClick={() => (window.location.href = "/faq")}
              >
                Browse FAQ
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}

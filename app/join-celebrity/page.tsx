"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Star,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  Shield,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Send,
} from "lucide-react"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"

const benefits = [
  {
    icon: <DollarSign className="w-8 h-8" />,
    title: "Earn Extra Income",
    description: "Set your own rates and earn money from your fanbase",
    color: "from-green-500 to-emerald-500",
    details: ["Keep 80% of your earnings", "Weekly payouts", "No hidden fees", "Transparent pricing"],
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Connect with Fans",
    description: "Build deeper relationships with your audience",
    color: "from-blue-500 to-cyan-500",
    details: ["Direct fan interaction", "Personalized messages", "Global reach", "Meaningful connections"],
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: "Flexible Schedule",
    description: "Work on your own time and terms",
    color: "from-purple-500 to-pink-500",
    details: ["Set your availability", "Choose request types", "Work from anywhere", "No minimum commitments"],
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Safe & Secure",
    description: "Protected platform with verified users",
    color: "from-orange-500 to-red-500",
    details: ["Verified user base", "Content moderation", "Secure payments", "Privacy protection"],
  },
]

const requirements = [
  "Verified social media presence with 10K+ followers",
  "Professional experience in entertainment, sports, or business",
  "Ability to create high-quality video content",
  "Commitment to responding to requests within stated timeframes",
  "Agreement to platform terms and community guidelines",
]

const steps = [
  {
    step: 1,
    title: "Submit Application",
    description: "Fill out our celebrity application form",
    icon: <Send className="w-6 h-6" />,
  },
  {
    step: 2,
    title: "Verification Process",
    description: "We verify your identity and credentials",
    icon: <Shield className="w-6 h-6" />,
  },
  {
    step: 3,
    title: "Profile Setup",
    description: "Create your celebrity profile and set rates",
    icon: <Star className="w-6 h-6" />,
  },
  {
    step: 4,
    title: "Start Earning",
    description: "Begin receiving and fulfilling fan requests",
    icon: <TrendingUp className="w-6 h-6" />,
  },
]

export default function JoinCelebrityPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    profession: "",
    socialMedia: "",
    followers: "",
    experience: "",
    motivation: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setIsSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        profession: "",
        socialMedia: "",
        followers: "",
        experience: "",
        motivation: "",
      })
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-purple-500/20 text-purple-200 border-purple-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Join Our Platform
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              Become a Kia Ora Celebrity
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
              Join thousands of celebrities earning extra income while connecting with fans through personalized video
              messages.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-4 text-lg"
              onClick={() => document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth" })}
            >
              Apply Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Why Join Kia Ora?</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Discover the benefits of becoming a Kia Ora celebrity partner.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg h-full">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-r ${benefit.color} flex items-center justify-center mx-auto mb-4`}
                    >
                      <div className="text-white">{benefit.icon}</div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                    <p className="text-purple-200 mb-4">{benefit.description}</p>
                    <ul className="space-y-2">
                      {benefit.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-purple-300 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span>{detail}</span>
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

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">How to Get Started</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Follow these simple steps to join our celebrity community.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
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

      {/* Requirements */}
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
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Eligibility Requirements</h2>
                <ul className="space-y-4">
                  {requirements.map((requirement, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-purple-200">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Application Form */}
      <section id="application-form" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Celebrity Application</h2>
                <p className="text-purple-200 mb-8 text-center">
                  Fill out this form to apply to become a Kia Ora celebrity partner.
                </p>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Application Submitted!</h3>
                    <p className="text-purple-200">
                      Thank you for your interest. We'll review your application and get back to you within 5-7 business
                      days.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="fullName" className="text-white mb-2 block">
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
                          placeholder="Your full legal name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-white mb-2 block">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phone" className="text-white mb-2 block">
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="profession" className="text-white mb-2 block">
                          Profession/Industry *
                        </Label>
                        <select
                          id="profession"
                          name="profession"
                          required
                          value={formData.profession}
                          onChange={handleInputChange}
                          className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:border-purple-500"
                        >
                          <option value="" className="bg-slate-800">
                            Select your profession
                          </option>
                          <option value="actor" className="bg-slate-800">
                            Actor/Actress
                          </option>
                          <option value="musician" className="bg-slate-800">
                            Musician/Artist
                          </option>
                          <option value="athlete" className="bg-slate-800">
                            Athlete
                          </option>
                          <option value="influencer" className="bg-slate-800">
                            Social Media Influencer
                          </option>
                          <option value="comedian" className="bg-slate-800">
                            Comedian
                          </option>
                          <option value="author" className="bg-slate-800">
                            Author/Writer
                          </option>
                          <option value="business" className="bg-slate-800">
                            Business Leader
                          </option>
                          <option value="other" className="bg-slate-800">
                            Other
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="socialMedia" className="text-white mb-2 block">
                          Primary Social Media Handle *
                        </Label>
                        <Input
                          id="socialMedia"
                          name="socialMedia"
                          type="text"
                          required
                          value={formData.socialMedia}
                          onChange={handleInputChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
                          placeholder="@yourusername or profile URL"
                        />
                      </div>
                      <div>
                        <Label htmlFor="followers" className="text-white mb-2 block">
                          Follower Count *
                        </Label>
                        <select
                          id="followers"
                          name="followers"
                          required
                          value={formData.followers}
                          onChange={handleInputChange}
                          className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:border-purple-500"
                        >
                          <option value="" className="bg-slate-800">
                            Select follower range
                          </option>
                          <option value="10k-50k" className="bg-slate-800">
                            10K - 50K
                          </option>
                          <option value="50k-100k" className="bg-slate-800">
                            50K - 100K
                          </option>
                          <option value="100k-500k" className="bg-slate-800">
                            100K - 500K
                          </option>
                          <option value="500k-1m" className="bg-slate-800">
                            500K - 1M
                          </option>
                          <option value="1m+" className="bg-slate-800">
                            1M+
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="experience" className="text-white mb-2 block">
                        Professional Experience *
                      </Label>
                      <Textarea
                        id="experience"
                        name="experience"
                        required
                        rows={4}
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500 resize-none"
                        placeholder="Describe your professional background, notable achievements, and relevant experience..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="motivation" className="text-white mb-2 block">
                        Why do you want to join Kia Ora? *
                      </Label>
                      <Textarea
                        id="motivation"
                        name="motivation"
                        required
                        rows={3}
                        value={formData.motivation}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500 resize-none"
                        placeholder="Tell us why you're interested in connecting with fans through personalized messages..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 text-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Submitting Application...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
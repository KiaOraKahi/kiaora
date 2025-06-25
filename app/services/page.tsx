"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Calendar,
  MessageCircle,
  Video,
  Heart,
  Briefcase,
  Gift,
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  Play,
  Sparkles,
  X,
  Send,
  Camera,
  Music,
  Zap,
} from "lucide-react"
import Image from "next/image"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"

const services = [
  {
    id: "birthday",
    icon: <Calendar className="w-8 h-8" />,
    title: "Birthday Messages",
    shortDescription: "Personalized birthday greetings from your favorite celebrities",
    fullDescription:
      "Make someone's birthday unforgettable with a personalized video message from their favorite celebrity. Our birthday messages are custom-tailored with the recipient's name, age, and special details you provide.",
    color: "from-pink-500 to-rose-500",
    price: "Starting at $99",
    duration: "1-3 minutes",
    deliveryTime: "3-7 days",
    features: [
      "Personalized birthday wishes",
      "Mention recipient's name and age",
      "Custom birthday song (optional)",
      "HD video quality",
      "Unlimited replays",
      "Digital download included",
    ],
    popular: true,
    samples: [
      { celebrity: "Emma Stone", thumbnail: "/placeholder.svg?height=200&width=300" },
      { celebrity: "Ryan Reynolds", thumbnail: "/placeholder.svg?height=200&width=300" },
      { celebrity: "John Legend", thumbnail: "/placeholder.svg?height=200&width=300" },
    ],
  },
  {
    id: "personal",
    icon: <MessageCircle className="w-8 h-8" />,
    title: "Personal Messages",
    shortDescription: "Custom video messages for any special occasion",
    fullDescription:
      "Whether it's congratulations, encouragement, or just a hello, get a personalized message for any occasion. Perfect for graduations, anniversaries, achievements, or just to brighten someone's day.",
    color: "from-blue-500 to-cyan-500",
    price: "Starting at $149",
    duration: "2-5 minutes",
    deliveryTime: "3-7 days",
    features: [
      "Fully customizable content",
      "Any occasion or purpose",
      "Personal anecdotes (when possible)",
      "HD video quality",
      "Rush delivery available",
      "Satisfaction guarantee",
    ],
    popular: false,
    samples: [
      { celebrity: "Tony Robbins", thumbnail: "/placeholder.svg?height=200&width=300" },
      { celebrity: "Oprah Winfrey", thumbnail: "/placeholder.svg?height=200&width=300" },
      { celebrity: "MrBeast", thumbnail: "/placeholder.svg?height=200&width=300" },
    ],
  },
  {
    id: "live",
    icon: <Video className="w-8 h-8" />,
    title: "Live Video Calls",
    shortDescription: "Real-time video calls with celebrities",
    fullDescription:
      "Experience the ultimate fan interaction with live video calls. Have a real conversation, ask questions, and create memories that will last a lifetime. Perfect for special occasions or once-in-a-lifetime experiences.",
    color: "from-purple-500 to-indigo-500",
    price: "Starting at $999",
    duration: "5-15 minutes",
    deliveryTime: "Schedule in advance",
    features: [
      "Real-time video conversation",
      "Interactive Q&A session",
      "Screen recording included",
      "Flexible scheduling",
      "Technical support provided",
      "Exclusive experience",
    ],
    popular: false,
    samples: [
      { celebrity: "Celebrity Chef", thumbnail: "/placeholder.svg?height=200&width=300" },
      { celebrity: "Sports Legend", thumbnail: "/placeholder.svg?height=200&width=300" },
      { celebrity: "Music Artist", thumbnail: "/placeholder.svg?height=200&width=300" },
    ],
  },
  {
    id: "motivation",
    icon: <Heart className="w-8 h-8" />,
    title: "Motivational Messages",
    shortDescription: "Inspiring words to boost confidence and motivation",
    fullDescription:
      "Get the motivation you need from world-renowned speakers, athletes, and successful entrepreneurs. Perfect for overcoming challenges, achieving goals, or starting new ventures.",
    color: "from-green-500 to-emerald-500",
    price: "Starting at $199",
    duration: "3-7 minutes",
    deliveryTime: "2-5 days",
    features: [
      "Personalized motivational content",
      "Goal-specific encouragement",
      "Success strategies shared",
      "Confidence-building messages",
      "Life coaching insights",
      "Inspirational quotes included",
    ],
    popular: true,
    samples: [
      { celebrity: "Tony Robbins", thumbnail: "/placeholder.svg?height=200&width=300" },
      { celebrity: "Gary Vaynerchuk", thumbnail: "/placeholder.svg?height=200&width=300" },
      { celebrity: "Mel Robbins", thumbnail: "/placeholder.svg?height=200&width=300" },
    ],
  },
  {
    id: "business",
    icon: <Briefcase className="w-8 h-8" />,
    title: "Business Endorsements",
    shortDescription: "Professional shoutouts for your business or brand",
    fullDescription:
      "Boost your business credibility with celebrity endorsements. Perfect for product launches, company milestones, team motivation, or marketing campaigns.",
    color: "from-orange-500 to-amber-500",
    price: "Starting at $499",
    duration: "1-3 minutes",
    deliveryTime: "5-10 days",
    features: [
      "Professional business endorsement",
      "Brand/product mentions",
      "Company milestone celebrations",
      "Team motivation messages",
      "Marketing campaign content",
      "Commercial usage rights",
    ],
    popular: false,
    samples: [
      { celebrity: "Shark Tank Investor", thumbnail: "/placeholder.svg?height=200&width=300" },
      { celebrity: "Tech CEO", thumbnail: "/placeholder.svg?height=200&width=300" },
      { celebrity: "Business Author", thumbnail: "/placeholder.svg?height=200&width=300" },
    ],
  },
  {
    id: "special",
    icon: <Gift className="w-8 h-8" />,
    title: "Special Occasions",
    shortDescription: "Custom messages for weddings, graduations, and more",
    fullDescription:
      "Celebrate life's biggest moments with celebrity messages for weddings, graduations, promotions, retirements, and other milestone events.",
    color: "from-violet-500 to-purple-500",
    price: "Starting at $179",
    duration: "2-4 minutes",
    deliveryTime: "3-7 days",
    features: [
      "Wedding congratulations",
      "Graduation celebrations",
      "Retirement wishes",
      "Promotion acknowledgments",
      "Anniversary messages",
      "Custom occasion content",
    ],
    popular: false,
    samples: [
      { celebrity: "Wedding Planner", thumbnail: "/placeholder.svg?height=200&width=300" },
      { celebrity: "Life Coach", thumbnail: "/placeholder.svg?height=200&width=300" },
      { celebrity: "Motivational Speaker", thumbnail: "/placeholder.svg?height=200&width=300" },
    ],
  },
]

const addOns = [
  {
    id: "rush",
    icon: <Zap className="w-6 h-6" />,
    title: "Rush Delivery",
    description: "Get your video in 24-48 hours",
    price: "+$99",
  },
  {
    id: "hd",
    icon: <Camera className="w-6 h-6" />,
    title: "4K HD Quality",
    description: "Ultra-high definition video",
    price: "+$49",
  },
  {
    id: "music",
    icon: <Music className="w-6 h-6" />,
    title: "Background Music",
    description: "Custom soundtrack for your video",
    price: "+$29",
  },
  {
    id: "extended",
    icon: <Clock className="w-6 h-6" />,
    title: "Extended Length",
    description: "Up to 10 minutes instead of standard",
    price: "+$199",
  },
]

const testimonials = [
  {
    name: "Sarah Johnson",
    service: "Birthday Message",
    rating: 5,
    comment: "My daughter was absolutely thrilled! Emma Stone's birthday message made her day unforgettable.",
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Mike Chen",
    service: "Motivational Message",
    rating: 5,
    comment: "Tony Robbins' motivational message helped me through a tough time. Worth every penny!",
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Lisa Rodriguez",
    service: "Business Endorsement",
    rating: 5,
    comment: "The celebrity endorsement boosted our product launch beyond expectations. Amazing service!",
    avatar: "/placeholder.svg?height=60&width=60",
  },
]

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showSampleModal, setShowSampleModal] = useState(false)
  const [selectedSample, setSelectedSample] = useState<any>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])

  const [bookingData, setBookingData] = useState({
    recipientName: "",
    occasion: "",
    personalMessage: "",
    specialInstructions: "",
    deliveryDate: "",
    email: "",
    phone: "",
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add useEffect to handle URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const serviceParam = urlParams.get("service")
    if (serviceParam) {
      setSelectedService(serviceParam)
      // Scroll to service details section
      setTimeout(() => {
        document.getElementById("service-details")?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [])

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
    setShowBookingModal(true)
    setCurrentStep(1)
  }

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns((prev) => (prev.includes(addOnId) ? prev.filter((id) => id !== addOnId) : [...prev, addOnId]))
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate booking submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setCurrentStep(4) // Success step

    // Reset after showing success
    setTimeout(() => {
      setShowBookingModal(false)
      setCurrentStep(1)
      setBookingData({
        recipientName: "",
        occasion: "",
        personalMessage: "",
        specialInstructions: "",
        deliveryDate: "",
        email: "",
        phone: "",
      })
      setSelectedAddOns([])
    }, 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setBookingData((prev) => ({ ...prev, [name]: value }))
  }

  const calculateTotal = () => {
    const service = services.find((s) => s.id === selectedService)
    if (!service) return 0

    const basePrice = Number.parseInt(service.price.replace(/[^\d]/g, ""))
    const addOnTotal = selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOns.find((a) => a.id === addOnId)
      return total + (addOn ? Number.parseInt(addOn.price.replace(/[^\d]/g, "")) : 0)
    }, 0)

    return basePrice + addOnTotal
  }

  const selectedServiceData = services.find((s) => s.id === selectedService)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent)]" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-purple-500/20 text-purple-200 border-purple-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Our Services
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              Celebrity Experiences for Every Occasion
            </h1>
            <p className="text-xl sm:text-2xl text-purple-200 max-w-4xl mx-auto leading-relaxed">
              From birthday wishes to business endorsements, discover the perfect celebrity service for your needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="group relative"
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300 h-full overflow-hidden">
                  {service.popular && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Most Popular</Badge>
                    </div>
                  )}

                  <CardContent className="p-8">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <div className="text-white">{service.icon}</div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3">{service.title}</h3>
                    <p className="text-purple-200 mb-6 leading-relaxed">{service.shortDescription}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-300">Starting Price:</span>
                        <span className="text-white font-semibold">{service.price}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-300">Duration:</span>
                        <span className="text-white">{service.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-300">Delivery:</span>
                        <span className="text-white">{service.deliveryTime}</span>
                      </div>
                    </div>

                    {/* Sample Videos */}
                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-3">Sample Videos</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {service.samples.map((sample, idx) => (
                          <div
                            key={idx}
                            className="relative cursor-pointer group/sample"
                            onClick={() => {
                              setSelectedSample({ ...sample, service: service.title })
                              setShowSampleModal(true)
                            }}
                          >
                            <Image
                              src={sample.thumbnail || "/placeholder.svg"}
                              alt={sample.celebrity}
                              width={100}
                              height={60}
                              className="w-full h-12 object-cover rounded"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/sample:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center">
                              <Play className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        onClick={() => handleServiceSelect(service.id)}
                      >
                        Book Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                        onClick={() => {
                          setSelectedService(service.id)
                          // Scroll to details section
                          document.getElementById("service-details")?.scrollIntoView({ behavior: "smooth" })
                        }}
                      >
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Details Section */}
      {selectedService && (
        <section id="service-details" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardContent className="p-12">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div
                          className={`w-16 h-16 rounded-full bg-gradient-to-r ${selectedServiceData?.color} flex items-center justify-center`}
                        >
                          <div className="text-white">{selectedServiceData?.icon}</div>
                        </div>
                        <div>
                          <h2 className="text-4xl font-bold text-white">{selectedServiceData?.title}</h2>
                          <p className="text-purple-200">{selectedServiceData?.price}</p>
                        </div>
                      </div>

                      <p className="text-lg text-purple-200 mb-8 leading-relaxed">
                        {selectedServiceData?.fullDescription}
                      </p>

                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-white">What's Included:</h3>
                        <div className="grid gap-3">
                          {selectedServiceData?.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                              <span className="text-purple-200">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <Card className="bg-white/10 border-white/20">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-white mb-4">Service Details</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-purple-200">Duration:</span>
                              <span className="text-white font-semibold">{selectedServiceData?.duration}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-purple-200">Delivery Time:</span>
                              <span className="text-white font-semibold">{selectedServiceData?.deliveryTime}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-purple-200">Format:</span>
                              <span className="text-white font-semibold">HD Video (MP4)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-purple-200">Usage Rights:</span>
                              <span className="text-white font-semibold">Personal Use</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 text-lg"
                        onClick={() => handleServiceSelect(selectedService)}
                      >
                        Book This Service
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )}

      {/* Add-ons Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Enhance Your Experience</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Add these premium features to make your celebrity message even more special.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addOn, index) => (
              <motion.div
                key={addOn.id}
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
                    <h3 className="text-lg font-bold text-white mb-2">{addOn.title}</h3>
                    <p className="text-purple-200 text-sm mb-4">{addOn.description}</p>
                    <div className="text-2xl font-bold text-purple-300">{addOn.price}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">What Our Customers Say</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Real stories from satisfied customers who've experienced the magic of celebrity messages.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-purple-200 mb-6 leading-relaxed">"{testimonial.comment}"</p>
                    <div className="flex items-center gap-4">
                      <Image
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-white font-semibold">{testimonial.name}</div>
                        <div className="text-purple-300 text-sm">{testimonial.service}</div>
                      </div>
                    </div>
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
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready to Create Magic?</h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have created unforgettable moments with their favorite
              celebrities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-4 text-lg"
                onClick={() => (window.location.href = "/celebrities")}
              >
                Browse Celebrities
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

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedServiceData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-r ${selectedServiceData.color} flex items-center justify-center`}
                  >
                    <div className="text-white">{selectedServiceData.icon}</div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Book {selectedServiceData.title}</h3>
                    <p className="text-purple-200">Step {currentStep} of 3</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowBookingModal(false)}>
                  <X className="w-5 h-5 text-white" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="px-6 py-4">
                <div className="flex items-center gap-4">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          currentStep >= step ? "bg-purple-500 text-white" : "bg-white/20 text-purple-300"
                        }`}
                      >
                        {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                      </div>
                      {step < 3 && (
                        <div className={`flex-1 h-1 mx-2 ${currentStep > step ? "bg-purple-500" : "bg-white/20"}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="p-6">
                {/* Step 1: Service Details */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-white mb-4">Service Details</h4>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-white mb-2 block">Recipient Name *</Label>
                        <Input
                          name="recipientName"
                          required
                          value={bookingData.recipientName}
                          onChange={handleInputChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                          placeholder="Who is this message for?"
                        />
                      </div>
                      <div>
                        <Label className="text-white mb-2 block">Occasion *</Label>
                        <select
                          name="occasion"
                          required
                          value={bookingData.occasion}
                          onChange={handleInputChange}
                          className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2"
                        >
                          <option value="" className="bg-slate-800">
                            Select occasion
                          </option>
                          <option value="birthday" className="bg-slate-800">
                            Birthday
                          </option>
                          <option value="graduation" className="bg-slate-800">
                            Graduation
                          </option>
                          <option value="wedding" className="bg-slate-800">
                            Wedding
                          </option>
                          <option value="anniversary" className="bg-slate-800">
                            Anniversary
                          </option>
                          <option value="promotion" className="bg-slate-800">
                            Promotion
                          </option>
                          <option value="motivation" className="bg-slate-800">
                            Motivation
                          </option>
                          <option value="other" className="bg-slate-800">
                            Other
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">Personal Message *</Label>
                      <Textarea
                        name="personalMessage"
                        required
                        rows={4}
                        value={bookingData.personalMessage}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 resize-none"
                        placeholder="What would you like the celebrity to say? Include specific details, names, and any personal touches..."
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">Special Instructions</Label>
                      <Textarea
                        name="specialInstructions"
                        rows={3}
                        value={bookingData.specialInstructions}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 resize-none"
                        placeholder="Any specific requests, pronunciation guides, or additional information..."
                      />
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">Preferred Delivery Date</Label>
                      <Input
                        name="deliveryDate"
                        type="date"
                        value={bookingData.deliveryDate}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/20 text-white"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    <Button
                      type="button"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                      onClick={() => setCurrentStep(2)}
                    >
                      Continue to Add-ons
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

                {/* Step 2: Add-ons */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-white mb-4">Enhance Your Experience</h4>

                    <div className="grid md:grid-cols-2 gap-4">
                      {addOns.map((addOn) => (
                        <div
                          key={addOn.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                            selectedAddOns.includes(addOn.id)
                              ? "border-purple-500 bg-purple-500/20"
                              : "border-white/20 bg-white/10 hover:bg-white/20"
                          }`}
                          onClick={() => handleAddOnToggle(addOn.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-purple-400">{addOn.icon}</div>
                              <div>
                                <h5 className="text-white font-semibold">{addOn.title}</h5>
                                <p className="text-purple-200 text-sm">{addOn.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-purple-300 font-semibold">{addOn.price}</div>
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  selectedAddOns.includes(addOn.id)
                                    ? "border-purple-500 bg-purple-500"
                                    : "border-white/40"
                                }`}
                              >
                                {selectedAddOns.includes(addOn.id) && <CheckCircle className="w-3 h-3 text-white" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white/10 rounded-lg p-6">
                      <h5 className="text-white font-semibold mb-4">Order Summary</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-purple-200">
                          <span>{selectedServiceData.title}</span>
                          <span>{selectedServiceData.price}</span>
                        </div>
                        {selectedAddOns.map((addOnId) => {
                          const addOn = addOns.find((a) => a.id === addOnId)
                          return addOn ? (
                            <div key={addOnId} className="flex justify-between text-purple-200">
                              <span>{addOn.title}</span>
                              <span>{addOn.price}</span>
                            </div>
                          ) : null
                        })}
                        <div className="border-t border-white/20 pt-2 mt-4">
                          <div className="flex justify-between text-white font-bold text-lg">
                            <span>Total</span>
                            <span>${calculateTotal()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                        onClick={() => setCurrentStep(1)}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                        onClick={() => setCurrentStep(3)}
                      >
                        Continue to Payment
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Contact & Payment */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-bold text-white mb-4">Contact Information</h4>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-white mb-2 block">Email Address *</Label>
                        <Input
                          name="email"
                          type="email"
                          required
                          value={bookingData.email}
                          onChange={handleInputChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <Label className="text-white mb-2 block">Phone Number</Label>
                        <Input
                          name="phone"
                          type="tel"
                          value={bookingData.phone}
                          onChange={handleInputChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-6">
                      <h5 className="text-white font-semibold mb-4">Final Order Summary</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between text-purple-200">
                          <span>Service: {selectedServiceData.title}</span>
                          <span>{selectedServiceData.price}</span>
                        </div>
                        <div className="flex justify-between text-purple-200">
                          <span>Recipient: {bookingData.recipientName}</span>
                        </div>
                        <div className="flex justify-between text-purple-200">
                          <span>Occasion: {bookingData.occasion}</span>
                        </div>
                        {selectedAddOns.map((addOnId) => {
                          const addOn = addOns.find((a) => a.id === addOnId)
                          return addOn ? (
                            <div key={addOnId} className="flex justify-between text-purple-200">
                              <span>Add-on: {addOn.title}</span>
                              <span>{addOn.price}</span>
                            </div>
                          ) : null
                        })}
                        <div className="border-t border-white/20 pt-3 mt-4">
                          <div className="flex justify-between text-white font-bold text-xl">
                            <span>Total Amount</span>
                            <span>${calculateTotal()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                        onClick={() => setCurrentStep(2)}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Complete Booking
                            <Send className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Success */}
                {currentStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
                    <h4 className="text-3xl font-bold text-white mb-4">Booking Confirmed!</h4>
                    <p className="text-purple-200 mb-6 max-w-md mx-auto">
                      Your booking has been submitted successfully. You'll receive a confirmation email shortly with all
                      the details.
                    </p>
                    <div className="bg-white/10 rounded-lg p-6 max-w-md mx-auto">
                      <h5 className="text-white font-semibold mb-2">What's Next?</h5>
                      <div className="text-purple-200 text-sm space-y-2">
                        <p>• You'll receive a confirmation email within 5 minutes</p>
                        <p>• Your celebrity will be notified of your request</p>
                        <p>• Expect delivery within {selectedServiceData.deliveryTime}</p>
                        <p>• We'll send updates on your order status</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sample Video Modal */}
      <AnimatePresence>
        {showSampleModal && selectedSample && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSampleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/20 rounded-2xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedSample.celebrity}</h3>
                  <p className="text-purple-200">Sample {selectedSample.service}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowSampleModal(false)}>
                  <X className="w-5 h-5 text-white" />
                </Button>
              </div>

              <div className="p-6">
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-white mb-4 mx-auto" />
                    <p className="text-white">Sample video would play here</p>
                    <p className="text-purple-200 text-sm">In a real implementation, this would be a video player</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                    onClick={() => {
                      setShowSampleModal(false)
                      // Find the service this sample belongs to and open booking
                      const service = services.find((s) =>
                        s.samples.some((sample) => sample.celebrity === selectedSample.celebrity),
                      )
                      if (service) {
                        handleServiceSelect(service.id)
                      }
                    }}
                  >
                    Book Similar Message
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => setShowSampleModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

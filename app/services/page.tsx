"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  Video,
  Briefcase,
  CheckCircle,
  ArrowRight,
  Play,
  Sparkles,
  X,
  Camera,
  Music,
  Zap,
  Laugh,
  Gift,
} from "lucide-react"
import Image from "next/image"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import { toast } from "sonner"
import MobileNavbar from "@/components/frontend/mobile-navbar"

// Updated services to match the footer URL parameters
const services = [
  {
    id: "shoutouts",
    icon: <Zap className="w-8 h-8" />,
    title: "Quick shout-outs",
    shortDescription: "Fast and fun personalized shout-outs from your favorite talent",
    fullDescription:
      "Get instant energy with quick, personalized shout-outs from your favorite talent. Perfect for birthdays, congratulations, or just to brighten someone's day with a burst of celebrity excitement.",
    color: "from-yellow-500 to-orange-500",
    price: "Starting at $49",
    duration: "30 seconds - 1 minute",
    deliveryTime: "24-48 hours",
    features: [
      "Quick personalized message",
      "Mention recipient's name",
      "High-energy delivery",
      "HD video quality",
      "Fast turnaround",
      "Perfect for social sharing",
    ],
    popular: true,
    samples: [
      { celebrity: "Kevin Hart", thumbnail: "/talents/1.jpeg" },
      { celebrity: "Ryan Reynolds", thumbnail: "/talents/2.jpg" },
      { celebrity: "Emma Stone", thumbnail: "/talents/3.jpg" },
    ],
  },
  {
    id: "personal",
    icon: <MessageCircle className="w-8 h-8" />,
    title: "Personalised video messages",
    shortDescription: "Custom video messages tailored specifically for you or your loved ones",
    fullDescription:
      "Experience the magic of a fully personalized video message crafted specifically for you or your loved ones. Our talent takes time to create meaningful, heartfelt content that will be treasured forever.",
    color: "from-blue-500 to-cyan-500",
    price: "Starting at $149",
    duration: "2-5 minutes",
    deliveryTime: "3-7 days",
    features: [
      "Fully customizable content",
      "Personal anecdotes when possible",
      "Detailed personalization",
      "HD video quality",
      "Unlimited replays",
      "Digital download included",
    ],
    popular: true,
    samples: [
      { celebrity: "John Legend", thumbnail: "/talents/4.jpg" },
      { celebrity: "Oprah Winfrey", thumbnail: "/talents/5.jpg" },
      { celebrity: "Taylor Swift", thumbnail: "/talents/6.jpg" },
    ],
  },
  {
    id: "roast",
    icon: <Laugh className="w-8 h-8" />,
    title: "Roast someone",
    shortDescription: "Hilarious roasts and playful banter from comedy legends",
    fullDescription:
      "Get ready to laugh until it hurts! Our comedy talent will deliver epic roasts and playful banter that's perfectly crafted to entertain while keeping it fun and friendly. Great for friends who love good humor!",
    color: "from-red-500 to-pink-500",
    price: "Starting at $99",
    duration: "1-3 minutes",
    deliveryTime: "2-5 days",
    features: [
      "Hilarious custom roasts",
      "Playful and friendly tone",
      "Comedy legend delivery",
      "Shareable content",
      "Perfect for friends",
      "Guaranteed laughs",
    ],
    popular: false,
    samples: [
      { celebrity: "Dave Chappelle", thumbnail: "/talents/1.jpeg" },
      { celebrity: "Amy Schumer", thumbnail: "/talents/2.jpg" },
      { celebrity: "Kevin Hart", thumbnail: "/talents/3.jpg" },
    ],
  },
  {
    id: "live",
    icon: <Video className="w-8 h-8" />,
    title: "5min Live interaction",
    shortDescription: "Real-time video calls and live interactions with talent",
    fullDescription:
      "Experience the ultimate fan interaction with exclusive 5-minute live video calls. Have real conversations, ask questions, and create once-in-a-lifetime memories with your favorite talent.",
    color: "from-purple-500 to-indigo-500",
    price: "Starting at $999",
    duration: "5 minutes",
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
      { celebrity: "MrBeast", thumbnail: "/talents/4.jpg" },
      { celebrity: "Emma Chamberlain", thumbnail: "/talents/5.jpg" },
      { celebrity: "PewDiePie", thumbnail: "/talents/6.jpg" },
    ],
  },
  {
    id: "business",
    icon: <Briefcase className="w-8 h-8" />,
    title: "Business endorsements",
    shortDescription: "Professional endorsements and business shoutouts",
    fullDescription:
      "Boost your business credibility with professional talent endorsements. Perfect for product launches, company milestones, team motivation, or marketing campaigns that need that extra star power.",
    color: "from-green-500 to-emerald-500",
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
      { celebrity: "Gary Vaynerchuk", thumbnail: "/talents/1.jpeg" },
      { celebrity: "Tony Robbins", thumbnail: "/talents/2.jpg" },
      { celebrity: "Shark Tank Cast", thumbnail: "/talents/3.jpg" },
    ],
  },
  {
    id: "motivation",
    icon: <Gift className="w-8 h-8" />,
    title: "Motivational video messages",
    shortDescription: "Inspiring and uplifting messages to boost confidence and motivation",
    fullDescription:
      "Get the inspiration you need from world-renowned motivational speakers and successful entrepreneurs. Perfect for overcoming challenges, achieving goals, or starting new ventures with confidence.",
    color: "from-indigo-500 to-purple-500",
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
      { celebrity: "Tony Robbins", thumbnail: "/talents/4.jpg" },
      { celebrity: "Oprah Winfrey", thumbnail: "/talents/5.jpg" },
      { celebrity: "Mel Robbins", thumbnail: "/talents/6.jpg" },
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
]

const testimonials = [
  {
    name: "Sarah Johnson",
    service: "Quick shout-out",
    rating: 5,
    comment: "The quick shout-out from Kevin Hart made my daughter's day! So much energy and fun!",
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
    comment: "The business endorsement boosted our product launch beyond expectations. Amazing service!",
    avatar: "/placeholder.svg?height=60&width=60",
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

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showSampleModal, setShowSampleModal] = useState(false)
  const [selectedSample, setSelectedSample] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)
        
      useEffect(() => {
        const checkMobile = () => {
          setIsMobile(window.innerWidth < 1024)
        }
    
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
      }, [])

  // Add useEffect to handle URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const serviceParam = urlParams.get("service")

    if (serviceParam) {
      // Direct mapping since the URL param should match the service ID
      const serviceExists = services.find((s) => s.id === serviceParam)
      if (serviceExists) {
        setSelectedService(serviceParam)
        // Use a timeout to ensure the component has rendered before scrolling
        setTimeout(() => {
          const element = document.getElementById("service-details")
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
        }, 500) // Increased timeout for better reliability
      }
    }
  }, [])

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
    setShowBookingModal(true)
  }

  const selectedServiceData = services.find((s) => s.id === selectedService)

  return (
    <div className="min-h-screen bg-black">
      {/* Subtle Luxury Starfield Background */}
      <SubtleLuxuryStarfield />

      {isMobile ? <MobileNavbar /> : <Navbar />}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.3),transparent)]" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-yellow-500/20 text-yellow-200 border-yellow-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Our Services
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-yellow-200 to-purple-200 bg-clip-text text-transparent mb-6">
              Talent Experiences for Every Occasion
            </h1>
            <p className="text-xl sm:text-2xl text-yellow-200 max-w-4xl mx-auto leading-relaxed">
              From quick shout-outs to live interactions, discover the perfect talent service for your needs.
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
                className="group relative cursor-pointer"
                onClick={() => {
                  setSelectedService(service.id)
                  toast.info(`${service.title}`, { description: service.shortDescription })
                }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all duration-300 h-full overflow-hidden">
                  {service.popular && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-8">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <div className="text-white">{service.icon}</div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3">{service.title}</h3>
                    <p className="text-yellow-200 mb-6 leading-relaxed">{service.shortDescription}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-yellow-300">Starting Price:</span>
                        <span className="text-white font-semibold">{service.price}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-yellow-300">Duration:</span>
                        <span className="text-white">{service.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-yellow-300">Delivery:</span>
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
                            onClick={(e) => {
                              e.stopPropagation()
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
                        className="w-full bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600 text-black font-bold"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleServiceSelect(service.id)
                        }}
                      >
                        Book Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedService(service.id)
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
                          <p className="text-yellow-200">{selectedServiceData?.price}</p>
                        </div>
                      </div>

                      <p className="text-lg text-yellow-200 mb-8 leading-relaxed">
                        {selectedServiceData?.fullDescription}
                      </p>

                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-white">What's Included:</h3>
                        <div className="grid gap-3">
                          {selectedServiceData?.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                              <span className="text-yellow-200">{feature}</span>
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
                              <span className="text-yellow-200">Duration:</span>
                              <span className="text-white font-semibold">{selectedServiceData?.duration}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-yellow-200">Delivery Time:</span>
                              <span className="text-white font-semibold">{selectedServiceData?.deliveryTime}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-yellow-200">Format:</span>
                              <span className="text-white font-semibold">HD Video (MP4)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-yellow-200">Usage Rights:</span>
                              <span className="text-white font-semibold">Personal Use</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600 text-black font-bold py-4 text-lg"
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
            <p className="text-xl text-yellow-200 max-w-3xl mx-auto">
              Add these premium features to make your talent message even more special.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {addOns.map((addOn, index) => (
              <motion.div
                key={addOn.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="text-black">{addOn.icon}</div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{addOn.title}</h3>
                    <p className="text-yellow-200 text-sm mb-4">{addOn.description}</p>
                    <div className="text-2xl font-bold text-yellow-300">{addOn.price}</div>
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
            <p className="text-xl text-yellow-200 max-w-3xl mx-auto">
              Real stories from satisfied customers who've experienced the magic of talent messages.
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
                        <Sparkles key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-yellow-200 mb-6 leading-relaxed">"{testimonial.comment}"</p>
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
                        <div className="text-yellow-300 text-sm">{testimonial.service}</div>
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
          <div className="bg-gradient-to-r from-yellow-500/20 to-purple-500/20 backdrop-blur-lg border border-white/20 rounded-3xl p-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready to Create Magic?</h2>
            <p className="text-xl text-yellow-200 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have created unforgettable moments with their favorite talent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600 text-black font-bold px-12 py-4 text-lg"
                onClick={() => (window.location.href = "/celebrities")}
              >
                Browse Talent
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
              className="bg-black border border-white/20 rounded-2xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedSample.celebrity}</h3>
                  <p className="text-yellow-200">Sample {selectedSample.service}</p>
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
                    <p className="text-yellow-200 text-sm">In a real implementation, this would be a video player</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-purple-500 text-black font-bold"
                    onClick={() => {
                      setShowSampleModal(false)
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
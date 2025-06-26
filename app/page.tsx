"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Video, Briefcase, Sparkles, Zap, Laugh, Gift } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import Navbar from "@/components/frontend/navbar"
import MobileNavbar from "@/components/frontend/mobile-navbar"
import Footer from "@/components/frontend/footer"
import LiveChatWidget from "@/components/frontend/live-chat-widget"
import VideoSamplesCarousel from "@/components/frontend/video-samples-carousel"
import { useRouter } from "next/navigation"

// Update the services array to use correct image extensions
const services = [
  {
    id: 1,
    icon: <Zap className="w-8 h-8" />,
    title: "Quick shout-outs",
    description: "Fast and fun personalized shout-outs from your favorite talent",
    color: "from-yellow-500 to-orange-500",
    talents: [
      { name: "Kevin Hart", image: "/talents/1.jpeg" },
      { name: "Ryan Reynolds", image: "/talents/2.jpg" },
      { name: "Emma Stone", image: "/talents/3.jpg" },
    ],
  },
  {
    id: 2,
    icon: <MessageCircle className="w-8 h-8" />,
    title: "Personalised video messages",
    description: "Custom video messages tailored specifically for you or your loved ones",
    color: "from-blue-500 to-cyan-500",
    talents: [
      { name: "John Legend", image: "/talents/4.jpg" },
      { name: "Oprah Winfrey", image: "/talents/5.jpg" },
      { name: "Taylor Swift", image: "/talents/6.jpg" },
    ],
  },
  {
    id: 3,
    icon: <Laugh className="w-8 h-8" />,
    title: "Roast someone",
    description: "Hilarious roasts and playful banter from comedy legends",
    color: "from-red-500 to-pink-500",
    talents: [
      { name: "Dave Chappelle", image: "/talents/1.jpeg" },
      { name: "Amy Schumer", image: "/talents/2.jpg" },
      { name: "Kevin Hart", image: "/talents/3.jpg" },
    ],
  },
  {
    id: 4,
    icon: <Video className="w-8 h-8" />,
    title: "5min Live interaction",
    description: "Real-time video calls and live interactions with talent",
    color: "from-purple-500 to-indigo-500",
    talents: [
      { name: "MrBeast", image: "/talents/4.jpg" },
      { name: "Emma Chamberlain", image: "/talents/5.jpg" },
      { name: "PewDiePie", image: "/talents/6.jpg" },
    ],
  },
  {
    id: 5,
    icon: <Briefcase className="w-8 h-8" />,
    title: "Business endorsements",
    description: "Professional endorsements and business shoutouts",
    color: "from-green-500 to-emerald-500",
    talents: [
      { name: "Gary Vaynerchuk", image: "/talents/1.jpeg" },
      { name: "Tony Robbins", image: "/talents/2.jpg" },
      { name: "Shark Tank Cast", image: "/talents/3.jpg" },
    ],
  },
  {
    id: 6,
    icon: <Gift className="w-8 h-8" />,
    title: "Motivational video messages",
    description: "Inspiring and uplifting messages to boost confidence and motivation",
    color: "from-indigo-500 to-purple-500",
    talents: [
      { name: "Tony Robbins", image: "/talents/4.jpg" },
      { name: "Oprah Winfrey", image: "/talents/5.jpg" },
      { name: "Mel Robbins", image: "/talents/6.jpg" },
    ],
  },
]

const talents = [
  {
    id: 1,
    name: "Emma Stone",
    category: "Actor",
    rating: 4.9,
    price: "$299",
    image: "/placeholder.svg?height=400&width=300&text=Emma+Stone",
    badge: "Trending",
    discount: "20% OFF",
  },
  {
    id: 2,
    name: "John Legend",
    category: "Musician",
    rating: 5.0,
    price: "$599",
    image: "/placeholder.svg?height=400&width=300&text=John+Legend",
    badge: "New",
    discount: "Limited Time",
  },
  {
    id: 3,
    name: "Tony Robbins",
    category: "Motivator",
    rating: 4.8,
    price: "$899",
    image: "/placeholder.svg?height=400&width=300&text=Tony+Robbins",
    badge: "Popular",
    discount: "15% OFF",
  },
  {
    id: 4,
    name: "MrBeast",
    category: "Influencer",
    rating: 4.9,
    price: "$1299",
    image: "/placeholder.svg?height=400&width=300&text=MrBeast",
    badge: "Hot",
    discount: "New Offer",
  },
  {
    id: 5,
    name: "Oprah Winfrey",
    category: "Motivator",
    rating: 5.0,
    price: "$1999",
    image: "/placeholder.svg?height=400&width=300&text=Oprah+Winfrey",
    badge: "Premium",
    discount: "Exclusive",
  },
  {
    id: 6,
    name: "Ryan Reynolds",
    category: "Actor",
    rating: 4.7,
    price: "$799",
    image: "/placeholder.svg?height=400&width=300&text=Ryan+Reynolds",
    badge: "Comedy",
    discount: "25% OFF",
  },
]

const categories = ["All", "Actors", "Musicians", "Motivators", "Influencers"]

// Subtle starfield component with fewer, more elegant stars
const SubtleLuxuryStarfield = () => {
  useEffect(() => {
    // Remove any existing starfield
    const existingStarfield = document.querySelector(".starfield")
    if (existingStarfield) {
      existingStarfield.remove()
    }

    const createStar = () => {
      const star = document.createElement("div")
      const size = Math.random() * 2 + 1 // Smaller, more subtle stars
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

    // Fewer stars for subtlety - only 60 total
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

export default function KiaOraHomepage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0)
  const [currentTalentIndex, setCurrentTalentIndex] = useState(0)
  const router = useRouter()

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Rotate through talent images to show variety
  useEffect(() => {
    const talentInterval = setInterval(() => {
      setCurrentTalentIndex((prev) => (prev + 1) % 3)
    }, 4000)

    return () => {
      clearInterval(talentInterval)
    }
  }, [])

  useEffect(() => {
    setIsLoaded(true)
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(talents.length / 3))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const filteredTalents =
    selectedCategory === "All" ? talents : talents.filter((talent) => talent.category === selectedCategory.slice(0, -1))

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(talents.length / 3))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(talents.length / 3)) % Math.ceil(talents.length / 3))
  }

  const handleBookNow = (talent: any) => {
    toast.success("Booking Started!", {
      description: `Starting booking process for ${talent.name}`,
      action: {
        label: "View Details",
        onClick: () => (window.location.href = `/celebrities/${talent.id}`),
      },
    })
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Subtle Luxury Starfield Background */}
      <SubtleLuxuryStarfield />

      {/* Conditional Navbar */}
      {isMobile ? <MobileNavbar /> : <Navbar />}

      <div className="overflow-hidden relative">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20">
          {/* Luxury Glow Around Title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="w-96 h-96 rounded-full bg-gradient-to-r from-yellow-400/10 via-purple-500/10 to-blue-500/10 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto text-center relative z-10">
            {/* Animated Logo/Title */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-8"
            >
              <motion.h1
                className="relative text-4xl sm:text-6xl lg:text-8xl xl:text-9xl font-bold bg-gradient-to-r from-white via-yellow-200 to-purple-200 bg-clip-text text-transparent mb-4"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "200% 200%",
                  filter: "drop-shadow(0 0 20px rgba(255, 215, 0, 0.3))",
                }}
              >
                <motion.span
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(255, 215, 0, 0.5)",
                      "0 0 40px rgba(138, 43, 226, 0.5)",
                      "0 0 20px rgba(255, 215, 0, 0.5)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  Kia Ora Kahi
                </motion.span>
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="flex items-center justify-center gap-2 text-lg sm:text-xl lg:text-2xl text-yellow-200"
              >
                <Sparkles className="w-5 h-5 lg:w-6 lg:h-6" />
                <span>Connect with your favourite talent</span>
                <Sparkles className="w-5 h-5 lg:w-6 lg:h-6" />
              </motion.div>
            </motion.div>

            {/* Premium Services Circles */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative mb-12"
            >
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-bold text-white mb-8">Featured Talents</h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                  {services.map((service, index) => {
                    // Show different talents for variety - cycle through all 3 talents per service
                    const talentIndex = (currentTalentIndex + index) % service.talents.length
                    const currentTalent = service.talents[talentIndex]

                    return (
                      <motion.div
                        key={service.title}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex flex-col items-center group cursor-pointer"
                        onClick={() => router.push(`/services?service=${service.id}`)}
                      >
                        {/* Service Circle with Rotating Talent */}
                        <div className="relative mb-4">
                          <div
                            className={`w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative overflow-hidden`}
                          >
                            <div className="absolute inset-1 rounded-full overflow-hidden">
                              <Image
                                src={currentTalent.image || "/placeholder.svg"}
                                alt={currentTalent.name}
                                fill
                                className="object-cover rounded-full"
                                sizes="(max-width: 640px) 96px, (max-width: 1024px) 128px, 160px"
                                priority={index < 3}
                              />
                            </div>

                            {/* Service Icon Overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="text-white">{service.icon}</div>
                            </div>
                          </div>

                          {/* Sparkle Effect */}
                          <motion.div
                            className="absolute -inset-2 rounded-full"
                            animate={{
                              boxShadow: [
                                "0 0 0 0 rgba(255, 215, 0, 0)",
                                "0 0 0 4px rgba(255, 215, 0, 0.3)",
                                "0 0 0 0 rgba(255, 215, 0, 0)",
                              ],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                              delay: index * 0.3,
                            }}
                          />
                        </div>

                        {/* Current Talent Name */}
                        <p className="text-yellow-200 text-xs mt-1 opacity-75">{currentTalent.name}</p>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Video Samples Carousel */}
        <VideoSamplesCarousel />

        {/* Services Section */}
        <section className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
                Our Premium Services
              </h2>
              <p className="text-lg sm:text-xl text-yellow-200 max-w-3xl mx-auto">
                From quick shout-outs to live interactions, we offer personalized talent experiences for every occasion
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: isMobile ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group touch-manipulation cursor-pointer"
                  onClick={() => {
                    // Map service titles to service IDs for URL
                    const serviceMap: { [key: string]: string } = {
                      "Quick shout-outs": "shoutouts",
                      "Personalised video messages": "personal",
                      "Roast someone": "roast",
                      "5min Live interaction": "live",
                      "Business endorsements": "business",
                      "Motivational video messages": "motivation",
                    }
                    const serviceId = serviceMap[service.title]
                    if (serviceId) {
                      router.push(`/services?service=${serviceId}`)
                    }
                  }}
                >
                  <Card className="bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all duration-300 h-full">
                    <CardContent className="p-6 sm:p-8">
                      <div
                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <div className="text-white">{service.icon}</div>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{service.title}</h3>
                      <p className="text-yellow-200 leading-relaxed">{service.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />

      {/* Live Chat Widget */}
      <LiveChatWidget />
    </div>
  )
}

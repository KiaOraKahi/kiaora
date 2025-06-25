"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Star,
  Calendar,
  MessageCircle,
  Video,
  Heart,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  Clock,
  Award,
  TrendingUp,
} from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import Navbar from "@/components/frontend/navbar"
import MobileNavbar from "@/components/frontend/mobile-navbar"
import Footer from "@/components/frontend/footer"
import VideoTestimonialsCarousel from "@/components/frontend/video-testimonials-carousel"
import { MobileCarousel, TouchOptimizedCelebrityCard } from "@/components/frontend/mobile-carousel"
import LiveChatWidget from "@/components/frontend/live-chat-widget"

const celebrities = [
  {
    id: 1,
    name: "Emma Stone",
    category: "Actor",
    rating: 4.9,
    price: "$299",
    image: "/placeholder.svg?height=400&width=300",
    badge: "Trending",
    discount: "20% OFF",
  },
  {
    id: 2,
    name: "John Legend",
    category: "Musician",
    rating: 5.0,
    price: "$599",
    image: "/placeholder.svg?height=400&width=300",
    badge: "New",
    discount: "Limited Time",
  },
  {
    id: 3,
    name: "Tony Robbins",
    category: "Motivator",
    rating: 4.8,
    price: "$899",
    image: "/placeholder.svg?height=400&width=300",
    badge: "Popular",
    discount: "15% OFF",
  },
  {
    id: 4,
    name: "MrBeast",
    category: "Influencer",
    rating: 4.9,
    price: "$1299",
    image: "/placeholder.svg?height=400&width=300",
    badge: "Hot",
    discount: "New Offer",
  },
  {
    id: 5,
    name: "Oprah Winfrey",
    category: "Motivator",
    rating: 5.0,
    price: "$1999",
    image: "/placeholder.svg?height=400&width=300",
    badge: "Premium",
    discount: "Exclusive",
  },
  {
    id: 6,
    name: "Ryan Reynolds",
    category: "Actor",
    rating: 4.7,
    price: "$799",
    image: "/placeholder.svg?height=400&width=300",
    badge: "Comedy",
    discount: "25% OFF",
  },
]

const categories = ["All", "Actors", "Musicians", "Motivators", "Influencers"]

const services = [
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Birthday Greetings",
    description: "Personalized birthday messages from your favorite celebrities",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Personal Messages",
    description: "Custom video messages for any special occasion",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <Video className="w-6 h-6" />,
    title: "Live Video Requests",
    description: "Real-time video calls with celebrities",
    color: "from-purple-500 to-indigo-500",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Motivational Messages",
    description: "Inspiring words to boost your confidence",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: <Briefcase className="w-6 h-6" />,
    title: "Business Endorsements",
    description: "Professional shoutouts for your business",
    color: "from-orange-500 to-amber-500",
  },
]

const stats = [
  { icon: <Users className="w-8 h-8" />, value: "50K+", label: "Happy Customers" },
  { icon: <Star className="w-8 h-8" />, value: "500+", label: "Celebrities" },
  { icon: <Clock className="w-8 h-8" />, value: "24/7", label: "Support" },
  { icon: <Award className="w-8 h-8" />, value: "4.9", label: "Rating" },
]

const successStories = [
  {
    title: "Birthday Surprise That Made Headlines",
    story:
      "When Sarah booked Gordon Ramsay for her husband's 40th birthday, she never expected it to go viral. The personalized cooking tips and birthday wishes got over 2M views on social media!",
    customer: "Sarah M.",
    celebrity: "Gordon Ramsay",
    impact: "2M+ views",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    title: "Graduation Message That Changed Everything",
    story:
      "Marcus was struggling with confidence until Dwayne Johnson sent him a personalized graduation message. That motivation helped him land his dream job at a Fortune 500 company.",
    customer: "Marcus T.",
    celebrity: "Dwayne Johnson",
    impact: "Dream job achieved",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    title: "Anniversary Surprise of a Lifetime",
    story:
      "After 25 years of marriage, Tom wanted something special. John Legend's personalized anniversary song brought tears to his wife's eyes and renewed their romance.",
    customer: "Tom & Linda K.",
    celebrity: "John Legend",
    impact: "Marriage renewed",
    image: "/placeholder.svg?height=200&width=300",
  },
]

export default function KiaOraHomepage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [liveStats, setLiveStats] = useState({
    customers: 50000,
    celebrities: 500,
    rating: 4.9,
  })

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Live stats counter
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats((prev) => ({
        customers: prev.customers + Math.floor(Math.random() * 3),
        celebrities: prev.celebrities + (Math.random() > 0.95 ? 1 : 0),
        rating: Math.min(5.0, prev.rating + (Math.random() > 0.8 ? 0.01 : 0)),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Interactive Stars Component
  const InteractiveStars = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const [scrollY, setScrollY] = useState(0)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
      setIsClient(true)

      const handleMouseMove = (e: MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY })
      }

      const handleScroll = () => {
        setScrollY(window.scrollY)
      }

      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("scroll", handleScroll)

      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("scroll", handleScroll)
      }
    }, [])

    if (!isClient) {
      return null
    }

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(100)].map((_, i) => {
          const initialX = Math.random() * 100
          const initialY = Math.random() * 100
          const size = Math.random() * 3 + 1
          const twinkleDelay = Math.random() * 5

          // Calculate distance from mouse for interaction
          const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1920
          const windowHeight = typeof window !== "undefined" ? window.innerHeight : 1080

          const distanceFromMouse = Math.sqrt(
            Math.pow((mousePos.x / windowWidth) * 100 - initialX, 2) +
              Math.pow((mousePos.y / windowHeight) * 100 - initialY, 2),
          )

          const isNearMouse = distanceFromMouse < 15
          const scrollOffset = (scrollY * 0.1 * ((i % 3) + 1)) % 100

          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${initialX}%`,
                top: `${(initialY + scrollOffset) % 100}%`,
                width: `${size}px`,
                height: `${size}px`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: isNearMouse ? [1, 1.5, 1] : [0.5, 1, 0.5],
                boxShadow: isNearMouse
                  ? ["0 0 5px rgba(255,255,255,0.5)", "0 0 20px rgba(139,92,246,0.8)", "0 0 5px rgba(255,255,255,0.5)"]
                  : ["0 0 2px rgba(255,255,255,0.3)", "0 0 8px rgba(255,255,255,0.6)", "0 0 2px rgba(255,255,255,0.3)"],
              }}
              transition={{
                opacity: {
                  duration: Math.random() * 3 + 2,
                  delay: twinkleDelay,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                },
                scale: {
                  duration: isNearMouse ? 0.3 : Math.random() * 2 + 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                },
                boxShadow: {
                  duration: isNearMouse ? 0.5 : 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                },
              }}
            />
          )
        })}

        {/* Subtle thin lightning streaks */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`streak-${i}`}
            className="absolute w-px bg-gradient-to-b from-transparent via-purple-400 to-transparent"
            style={{
              left: `${20 + i * 30}%`,
              height: "200px",
              top: `${Math.random() * 50}%`,
            }}
            animate={{
              opacity: [0, 0.6, 0],
              scaleY: [0, 1, 0],
            }}
            transition={{
              duration: 0.3,
              delay: i * 2 + Math.random() * 5,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: Math.random() * 8 + 6,
            }}
          />
        ))}
      </div>
    )
  }

  // Electric Particles Component
  const ElectricParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 5,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: Math.random() * 3 + 2,
          }}
        />
      ))}
    </div>
  )

  useEffect(() => {
    setIsLoaded(true)
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(celebrities.length / 3))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const filteredCelebrities =
    selectedCategory === "All"
      ? celebrities
      : celebrities.filter((celeb) => celeb.category === selectedCategory.slice(0, -1))

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(celebrities.length / 3))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(celebrities.length / 3)) % Math.ceil(celebrities.length / 3))
  }

  const handleBookNow = (celebrity: any) => {
    toast.success("Booking Started!", {
      description: `Starting booking process for ${celebrity.name}`,
      action: {
        label: "View Details",
        onClick: () => (window.location.href = `/celebrities/${celebrity.id}`),
      },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Conditional Navbar */}
      {isMobile ? <MobileNavbar /> : <Navbar />}

      <div className="overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.2),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.2),transparent)]" />
        </div>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20">
          {/* Interactive Stars and Subtle Lightning */}
          <div className="absolute inset-0 overflow-hidden">
            <InteractiveStars />
            <ElectricParticles />
          </div>

          {/* Electric Glow Around Title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"
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

          <div className="max-w-7xl mx-auto text-center">
            {/* Animated Logo/Title */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-8"
            >
              <motion.h1
                className="relative text-4xl sm:text-6xl lg:text-8xl xl:text-9xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4"
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
                  filter: "drop-shadow(0 0 20px rgba(139, 92, 246, 0.3))",
                }}
              >
                <motion.span
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(139, 92, 246, 0.5)",
                      "0 0 40px rgba(236, 72, 153, 0.5)",
                      "0 0 20px rgba(139, 92, 246, 0.5)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  Kia Ora
                </motion.span>
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="flex items-center justify-center gap-2 text-lg sm:text-xl lg:text-2xl text-purple-200"
              >
                <Sparkles className="w-5 h-5 lg:w-6 lg:h-6" />
                <span>Connect with your favorite celebrities</span>
                <Sparkles className="w-5 h-5 lg:w-6 lg:h-6" />
              </motion.div>
            </motion.div>

            {/* Celebrity Carousel - Mobile vs Desktop */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative mb-12"
            >
              {isMobile ? (
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Featured Celebrities</h2>
                  <MobileCarousel
                    items={celebrities}
                    renderItem={(celebrity) => (
                      <TouchOptimizedCelebrityCard celebrity={celebrity} onBook={() => handleBookNow(celebrity)} />
                    )}
                  />
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Featured Celebrities</h2>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={prevSlide}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={nextSlide}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, x: 300 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -300 }}
                      transition={{ duration: 0.5 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                      {celebrities.slice(currentSlide * 3, (currentSlide + 1) * 3).map((celebrity, index) => (
                        <motion.div
                          key={celebrity.id}
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group"
                        >
                          <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300 group-hover:scale-105">
                            <CardContent className="p-6">
                              <div className="relative mb-4">
                                <Image
                                  src={celebrity.image || "/placeholder.svg"}
                                  alt={celebrity.name}
                                  width={200}
                                  height={250}
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                                <Badge className="absolute top-2 right-2 bg-purple-500/80 text-white">
                                  {celebrity.category}
                                </Badge>
                                {celebrity.discount && (
                                  <Badge className="absolute top-2 left-2 bg-green-500/80 text-white">
                                    {celebrity.discount}
                                  </Badge>
                                )}
                              </div>
                              <h3 className="text-xl font-bold text-white mb-2">{celebrity.name}</h3>
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-white">{celebrity.rating}</span>
                                </div>
                                <span className="text-2xl font-bold text-purple-300">{celebrity.price}</span>
                              </div>
                              <Button
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                onClick={() => handleBookNow(celebrity)}
                              >
                                Book Now
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            {/* Live Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-center"
                >
                  <div className="text-purple-300 mb-2 flex justify-center">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.label === "Happy Customers"
                      ? `${Math.floor(liveStats.customers / 1000)}K+`
                      : stat.label === "Celebrities"
                        ? `${liveStats.celebrities}+`
                        : stat.label === "Rating"
                          ? liveStats.rating.toFixed(1)
                          : stat.value}
                  </div>
                  <div className="text-purple-200 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Category Filters */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8"
            >
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  size={isMobile ? "sm" : "default"}
                  className={`touch-manipulation ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-16"
            >
              <Button
                size={isMobile ? "default" : "lg"}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg touch-manipulation"
                onClick={() =>
                  toast.info("Video Samples", {
                    description: "Check out our celebrity video samples!",
                  })
                }
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                See Video Samples
              </Button>
              <Button
                size={isMobile ? "default" : "lg"}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg touch-manipulation"
                onClick={() =>
                  toast.success("Request Started", {
                    description: "Let's find the perfect celebrity for you!",
                  })
                }
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Send a Request
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Success Stories Section */}
        <section className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">Success Stories</h2>
              <p className="text-lg sm:text-xl text-purple-200 max-w-3xl mx-auto">
                Real moments, real emotions, real impact from our amazing community
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                {successStories.map((story, index) => (
                  <motion.div
                    key={story.title}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                  >
                    <h3 className="text-xl font-bold text-white mb-3">{story.title}</h3>
                    <p className="text-purple-200 mb-4">{story.story}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{story.customer}</p>
                        <p className="text-purple-300 text-sm">featuring {story.celebrity}</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">{story.impact}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <Image
                    src="/placeholder.svg?height=600&width=800"
                    alt="Collage of happy Kia Ora customers"
                    width={800}
                    height={600}
                    className="rounded-2xl shadow-2xl"
                  />
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 blur-xl" />
                </motion.div>

                {/* Floating stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  viewport={{ once: true }}
                  className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-center"
                >
                  <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-purple-200 text-sm">Satisfaction Rate</div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

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
              <p className="text-lg sm:text-xl text-purple-200 max-w-3xl mx-auto">
                From birthday greetings to business endorsements, we offer personalized celebrity experiences for every
                occasion
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
                  className="group touch-manipulation"
                >
                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300 h-full">
                    <CardContent className="p-6 sm:p-8">
                      <div
                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <div className="text-white">{service.icon}</div>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{service.title}</h3>
                      <p className="text-purple-200 leading-relaxed">{service.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Video Testimonials Carousel */}
        <VideoTestimonialsCarousel />

        {/* Final CTA Section */}
        <section className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-white/20 rounded-2xl sm:rounded-3xl p-8 sm:p-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">Ready to Connect?</h2>
              <p className="text-lg sm:text-xl text-purple-200 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join thousands of satisfied customers who have created unforgettable moments with their favorite
                celebrities
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size={isMobile ? "default" : "lg"}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg touch-manipulation"
                  onClick={() =>
                    toast.success("Let's Get Started!", {
                      description: "Browse our amazing celebrities and start booking!",
                    })
                  }
                >
                  Start Booking Now
                </Button>
                <Button
                  size={isMobile ? "default" : "lg"}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg touch-manipulation"
                  onClick={() =>
                    toast.info("Learn More", {
                      description: "Discover how Kia Ora works!",
                    })
                  }
                >
                  Learn More
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      <Footer />

      {/* Live Chat Widget */}
      <LiveChatWidget />
    </div>
  )
}
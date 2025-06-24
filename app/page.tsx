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
} from "lucide-react"
import Image from "next/image"

const celebrities = [
  {
    id: 1,
    name: "Emma Stone",
    category: "Actor",
    rating: 4.9,
    price: "$299",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: 2,
    name: "John Legend",
    category: "Musician",
    rating: 5.0,
    price: "$599",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: 3,
    name: "Tony Robbins",
    category: "Motivator",
    rating: 4.8,
    price: "$899",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: 4,
    name: "MrBeast",
    category: "Influencer",
    rating: 4.9,
    price: "$1299",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: 5,
    name: "Oprah Winfrey",
    category: "Motivator",
    rating: 5.0,
    price: "$1999",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: 6,
    name: "Ryan Reynolds",
    category: "Actor",
    rating: 4.7,
    price: "$799",
    image: "/placeholder.svg?height=400&width=300",
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

export default function KiaOraHomepage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isLoaded, setIsLoaded] = useState(false)

  // Add this new InteractiveStars component instead:
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.2),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.2),transparent)]" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
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
              className="relative text-6xl sm:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4"
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
              className="flex items-center justify-center gap-2 text-xl sm:text-2xl text-purple-200"
            >
              <Sparkles className="w-6 h-6" />
              <span>Connect with your favorite celebrities</span>
              <Sparkles className="w-6 h-6" />
            </motion.div>
          </motion.div>

          {/* Celebrity Carousel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative mb-12"
          >
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
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">{celebrity.name}</h3>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-white">{celebrity.rating}</span>
                            </div>
                            <span className="text-2xl font-bold text-purple-300">{celebrity.price}</span>
                          </div>
                          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                            Book Now
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`${
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
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              See Video Samples
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-4 text-lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Send a Request
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Our Premium Services</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              From birthday greetings to business endorsements, we offer personalized celebrity experiences for every
              occasion
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300 h-full">
                  <CardContent className="p-8">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <div className="text-white">{service.icon}</div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
                    <p className="text-purple-200 leading-relaxed">{service.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-white/20 rounded-3xl p-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready to Connect?</h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have created unforgettable moments with their favorite
              celebrities
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-4 text-lg"
              >
                Start Booking Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-12 py-4 text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

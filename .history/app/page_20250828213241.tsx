"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, Video, Briefcase, Sparkles, Zap, Laugh, Gift, Clock, DollarSign, Shield, ArrowUpRight, Search, CreditCard, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import Navbar from "@/components/frontend/navbar"
import MobileNavbar from "@/components/frontend/mobile-navbar"
import Footer from "@/components/frontend/footer"
import LiveChatWidget from "@/components/frontend/live-chat-widget"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { formatPrice, heroGreetings } from "@/lib/services-data"
import type { EnhancedServiceData, ServicesApiResponse } from "@/types/services"
import { useContentByKey, useContent } from "@/hooks/useContent"

// How It Works Steps Component
const HowItWorksSteps = () => {
  const { content, loading } = useContent([
    "homepage.how-it-works.step1.title",
    "homepage.how-it-works.step1.description",
    "homepage.how-it-works.step2.title",
    "homepage.how-it-works.step2.description",
    "homepage.how-it-works.step3.title",
    "homepage.how-it-works.step3.description",
    "homepage.how-it-works.step4.title",
    "homepage.how-it-works.step4.description"
  ])

  const steps = [
    {
      icon: <Search className="w-8 h-8" />,
      title: content["homepage.how-it-works.step1.title"] || "Browse & Discover",
      description: content["homepage.how-it-works.step1.description"] || "Explore our verified celebrities across entertainment, sports, and more",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: content["homepage.how-it-works.step2.title"] || "Personalise Your Request",
      description: content["homepage.how-it-works.step2.description"] || "Tell us exactly what you want and who it's for",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: content["homepage.how-it-works.step3.title"] || "Secure Payment",
      description: content["homepage.how-it-works.step3.description"] || "Complete your booking with our secure payment system",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: content["homepage.how-it-works.step4.title"] || "Receive Your Video",
      description: content["homepage.how-it-works.step4.description"] || "Get your personalised video within the promised timeframe",
      color: "from-pink-500 to-rose-500"
    }
  ]

  return (
    <>
      {steps.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="text-center group"
        >
          <div className="relative mb-6">
            <div
              className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
            >
              <div className="text-white">{step.icon}</div>
            </div>
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-purple-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
          <p className="text-gray-300 leading-relaxed">{step.description}</p>
        </motion.div>
      ))}
    </>
  )
}

// Icon mapping helper
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "Zap":
      return <Zap className="w-8 h-8" />
    case "MessageCircle":
      return <MessageCircle className="w-8 h-8" />
    case "Laugh":
      return <Laugh className="w-8 h-8" />
    case "Video":
      return <Video className="w-8 h-8" />
    case "Briefcase":
      return <Briefcase className="w-8 h-8" />
    case "Gift":
      return <Gift className="w-8 h-8" />
    default:
      return <Sparkles className="w-8 h-8" />
  }
}

const talents = [
  {
    id: 1,
    name: "Emma Stone",
    category: "Actor",
    rating: 4.9,
    price: "$299",
    image: "/talents/1.jpeg",
    badge: "Trending",
    discount: "20% OFF",
  },
  {
    id: 2,
    name: "Sarah",
    category: "Musician",
    rating: 5.0,
    price: "$599",
    image: "/talents/2.jpg",
    badge: "New",
    discount: "Limited Time",
  },
  {
    id: 3,
    name: "Tony Robbins",
    category: "Motivator",
    rating: 4.8,
    price: "$899",
    image: "/talents/3.jpg",
    badge: "Popular",
    discount: "15% OFF",
  },
  {
    id: 4,
    name: "MrBeast",
    category: "Influencer",
    rating: 4.9,
    price: "$1299",
    image: "/talents/4.jpg",
    badge: "Hot",
    discount: "New Offer",
  },
  {
    id: 5,
    name: "Oprah Winfrey",
    category: "Motivator",
    rating: 5.0,
    price: "$1999",
    image: "/talents/5.jpg",
    badge: "Premium",
    discount: "Exclusive",
  },
  {
    id: 6,
    name: "Ryan Reynolds",
    category: "Actor",
    rating: 4.7,
    price: "$799",
    image: "/talents/6.jpg",
    badge: "Comedy",
    discount: "25% OFF",
  },
]

const hasTalentWithImage = (service: EnhancedServiceData) => {
  return service.talents.some(talent => talent?.image && talent.image !== "/placeholder.svg");
};

const categories = ["All", "Actors", "Musicians", "Motivators", "Influencers"]

// Animated Hero Title Component
const AnimatedHeroTitle = () => {
  const { content: heroTitle, loading } = useContentByKey("homepage.hero.title")
  const greetings = heroGreetings
  const [currentGreeting, setCurrentGreeting] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGreeting((prev) => (prev + 1) % greetings.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [greetings.length])

  if (loading) {
    return (
      <motion.h1
        className="relative text-4xl sm:text-6xl lg:text-8xl xl:text-9xl font-bold bg-gradient-to-r from-white via-yellow-200 to-purple-200 bg-clip-text text-transparent mb-2"
        style={{
          backgroundSize: "200% 200%",
          filter: "drop-shadow(0 0 20px rgba(255, 215, 0, 0.3))",
        }}
      >
        Kia Ora
      </motion.h1>
    )
  }

  return (
    <motion.h1
      className="relative text-4xl sm:text-6xl lg:text-8xl xl:text-9xl font-bold bg-gradient-to-r from-white via-yellow-200 to-purple-200 bg-clip-text text-transparent mb-2"
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
        key={currentGreeting}
        initial={{ opacity: 0, y: 20 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        animate={{
          opacity: 1,
          y: 0,
          textShadow: [
            "0 0 20px rgba(255, 215, 0, 0.5)",
            "0 0 40px rgba(138, 43, 226, 0.5)",
            "0 0 20px rgba(255, 215, 0, 0.5)",
          ],
        }}
      >
        {heroTitle}
      </motion.span>
    </motion.h1>
  )
}

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

// Hero Carousel Data
const heroSlides = [
  {
    id: 1,
    title: "Personalised Celebrity Messages",
    subtitle: "Get a custom video from your favorite stars",
    description: "Birthday wishes, congratulations, or just a special hello - make any moment unforgettable",
    image: "/talents/1.jpeg",
    cta: "Browse Celebrities",
    color: "from-blue-500 to-purple-500"
  },
  {
    id: 2,
    title: "Perfect Gift for Any Occasion",
    subtitle: "Surprise someone special with a celebrity shoutout",
    description: "Weddings, anniversaries, graduations - create memories that last forever",
    image: "/talents/2.jpg",
    cta: "Find the Perfect Gift",
    color: "from-pink-500 to-red-500"
  },
  {
    id: 3,
    title: "Business & Motivation",
    subtitle: "Inspire your team with celebrity motivation",
    description: "Corporate events, team building, or personal motivation from the stars you admire",
    image: "/talents/3.jpg",
    cta: "Explore Business Services",
    color: "from-green-500 to-blue-500"
  }
]

export default function KiaOraHomepage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0)
  const [currentTalentIndex, setCurrentTalentIndex] = useState(0)
  const [services, setServices] = useState<EnhancedServiceData[]>([])
  const [loading, setLoading] = useState(true)
  const [fallbackDataUsed, setFallbackDataUsed] = useState(false)
  const [featuredCelebrities, setFeaturedCelebrities] = useState<any[]>([])
  const [celebritiesLoading, setCelebritiesLoading] = useState(true)
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

  // Fetch services data from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/services")

        if (!response.ok) {
          throw new Error("Failed to fetch services")
        }

        const data: ServicesApiResponse = await response.json()
        setServices(data.services)
        setFallbackDataUsed(data.fallbackDataUsed)

        if (data.fallbackDataUsed) {
          console.log("Using fallback data - no services in database yet")
          toast.info("Using demo data", {
            description: "Real service data will appear once services are added to the database",
          })
        }
      } catch (error) {
        console.error("Error fetching services:", error)
        toast.error("Failed to load services", {
          description: "Please refresh the page to try again",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  // Fetch featured celebrities from API
  useEffect(() => {
    const fetchFeaturedCelebrities = async () => {
      try {
        setCelebritiesLoading(true)
        const response = await fetch("/api/celebrities?featured=true&limit=4")

        if (!response.ok) {
          throw new Error("Failed to fetch celebrities")
        }

        const data = await response.json()
        setFeaturedCelebrities(data.celebrities || [])
      } catch (error) {
        console.error("Error fetching featured celebrities:", error)
        // Fallback to mock celebrities if API fails
        setFeaturedCelebrities([
          {
            id: "1",
            name: "Emma Stone",
            category: "Actor",
            rating: 4.9,
            price: 299,
            image: "/talents/1.jpeg",
            verified: true,
            featured: true,
          },
          {
            id: "2",
            name: "Sarah",
            category: "Musician",
            rating: 5.0,
            price: 599,
            image: "/talents/2.jpg",
            verified: true,
            featured: true,
          },
          {
            id: "3",
            name: "Tony Robbins",
            category: "Motivator",
            rating: 4.8,
            price: 899,
            image: "/talents/3.jpg",
            verified: true,
            featured: true,
          },
          {
            id: "4",
            name: "MrBeast",
            category: "Influencer",
            rating: 4.9,
            price: 1299,
            image: "/talents/4.jpg",
            verified: true,
            featured: true,
          }
        ])
      } finally {
        setCelebritiesLoading(false)
      }
    }

    fetchFeaturedCelebrities()
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

  // Hero carousel auto-rotation
  useEffect(() => {
    const carouselInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)

    return () => clearInterval(carouselInterval)
  }, [])

  const filteredTalents =
    selectedCategory === "All" ? talents : talents.filter((talent) => talent.category === selectedCategory.slice(0, -1))

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(talents.length / 3))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(talents.length / 3)) % Math.ceil(talents.length / 3))
  }

  const nextHeroSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevHeroSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-yellow-200">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Subtle Luxury Starfield Background */}
      <SubtleLuxuryStarfield />

      {/* Conditional Navbar */}
      {isMobile ? <MobileNavbar /> : <Navbar />}

      <div className="overflow-hidden relative">
        {/* Hero Carousel Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20">
          {/* Carousel Container */}
          <div className="relative w-full max-w-7xl mx-auto">
            {/* Carousel Slides */}
            {heroSlides.map((slide, index) => (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: index === currentSlide ? 1 : 0,
                  scale: index === currentSlide ? 1 : 0.95
                }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 flex items-center ${index === currentSlide ? 'z-10' : 'z-0'}`}
              >
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  {/* Content */}
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ 
                      opacity: index === currentSlide ? 1 : 0, 
                      x: index === currentSlide ? 0 : -50 
                    }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-left"
                  >
                    <Badge className={`mb-4 bg-gradient-to-r ${slide.color} text-white border-0`}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Featured
                    </Badge>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                      {slide.title}
                    </h1>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-yellow-200 mb-4">
                      {slide.subtitle}
                    </h2>
                    <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                      {slide.description}
                    </p>
                    <Button
                      size="lg"
                      className={`bg-gradient-to-r ${slide.color} hover:scale-105 transition-transform text-white px-8 py-4 text-lg`}
                      onClick={() => router.push('/celebrities')}
                    >
                      {slide.cta}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>

                  {/* Image */}
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ 
                      opacity: index === currentSlide ? 1 : 0, 
                      x: index === currentSlide ? 0 : 50 
                    }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="relative"
                  >
                    <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden">
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority={index === 0}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}

            {/* Carousel Navigation */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-yellow-400 w-8' : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            {/* Carousel Arrows */}
            <button
              onClick={prevHeroSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextHeroSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </section>

        {/* Brief How It Works Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                How It Works
              </h2>
              <p className="text-xl text-yellow-200 max-w-3xl mx-auto">
                Getting a personalised message from your favorite celebrity is easier than you think
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <HowItWorksSteps />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Button
                size="lg"
                variant="outline"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 text-lg"
                onClick={() => router.push('/how-it-works')}
              >
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Admin Access Button */}
        <section className="relative py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="mt-8"
            >
              <Link href="/admin/login">
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-purple-500 transition-all duration-300 group"
                >
                  <Shield className="w-4 h-4 mr-2 group-hover:text-purple-300" />
                  Admin Access
                  <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Featured Celebrities Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Featured Celebrities
              </h2>
              <p className="text-xl text-yellow-200 max-w-3xl mx-auto">
                Connect with verified celebrities and influencers for personalised video messages
              </p>
            </motion.div>

            {/* Featured Celebrities Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative mb-12"
            >
              {celebritiesLoading ? (
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((index) => (
                      <div key={index} className="animate-pulse">
                        <div className="w-full h-48 bg-gray-700 rounded-2xl mb-4"></div>
                        <div className="h-4 bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredCelebrities.map((celebrity, index) => (
                      <motion.div
                        key={celebrity.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group cursor-pointer"
                        onClick={() => router.push(`/celebrities/${celebrity.id}`)}
                      >
                        <div className="relative mb-4">
                          <div className="w-full h-48 rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
                            <Image
                              src={celebrity.image || "/placeholder.svg"}
                              alt={celebrity.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              priority={index < 2}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            
                            {/* Verified Badge */}
                            {celebrity.verified && (
                              <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                                <span className="mr-1">✓</span>
                                Verified
                              </div>
                            )}
                            
                            {/* Featured Badge */}
                            {celebrity.featured && (
                              <div className="absolute top-3 left-3 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-semibold">
                                Featured
                              </div>
                            )}
                          </div>
                          
                          {/* Rating */}
                          <div className="absolute bottom-3 left-3 flex items-center bg-black/70 text-white text-sm px-2 py-1 rounded-full">
                            <span className="text-yellow-400 mr-1">★</span>
                            {celebrity.rating}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-yellow-200 transition-colors">
                            {celebrity.name}
                          </h3>
                          <p className="text-gray-300 text-sm mb-2">{celebrity.category}</p>
                          <p className="text-yellow-200 font-semibold">From ${celebrity.price}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* View All Button */}
                  <div className="text-center mt-8">
                    <Button
                      onClick={() => router.push('/celebrities')}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold px-8 py-3 rounded-full hover:scale-105 transition-transform"
                    >
                      View All Celebrities
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Services Section with Pricing */}
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
                Our Services
              </h2>
              <p className="text-lg sm:text-xl text-yellow-200 max-w-3xl mx-auto">
                From shout-outs to live interactions, we offer personalised experiences for every occasion
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
                    router.push(`/services?service=${service.id}`)
                  }}
                >
                  <Card className="bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all duration-300 h-full">
                    <CardContent className="p-6 sm:p-8">
                      {/* Service Icon */}
                      <div
                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <div className="text-white">{getIconComponent(service.icon)}</div>
                      </div>

                      {/* Popular Badge */}
                      {service.popular && (
                        <Badge className="mb-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold">
                          Most Popular
                        </Badge>
                      )}

                      {/* Service Title */}
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{service.title}</h3>

                      {/* Service Description */}
                      <p className="text-yellow-200 leading-relaxed mb-6">{service.description}</p>

                      {/* Pricing Information */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-yellow-300 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Starting Price:
                          </span>
                          <span className="text-white font-semibold">{formatPrice(service.startingPrice)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-yellow-300 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Duration:
                          </span>
                          <span className="text-white">{service.duration}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-yellow-300">Delivery:</span>
                          <span className="text-white">{service.deliveryTime}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm border-t border-white/10 pt-3">
                          <span className="text-orange-300 font-semibold">ASAP Price:</span>
                          <span className="text-orange-200 font-semibold">
                            {formatPrice(service.asapPrice)} within {service.asapDeliveryTime}
                          </span>
                        </div>
                      </div>

                      {/* Sample Talents Preview */}
                      <div className="mb-4">
                        <h4 className="text-white font-semibold mb-3 text-sm">Featured Talents</h4>
                        <div className="flex -space-x-2">
                          {service.talents.slice(0, 3).map((talent, idx) => (
                            <div
                              key={idx}
                              className="relative w-8 h-8 rounded-full border-2 border-white/20 overflow-hidden"
                            >
                              <Image
                                src={talent.image || "/placeholder.svg"}
                                alt={talent.name}
                                fill
                                className="object-cover"
                                sizes="32px"
                              />
                            </div>
                          ))}
                          <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                            <span className="text-xs text-white font-semibold">+</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-t from-black to-gray-900">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="bg-gradient-to-r from-yellow-500/20 to-purple-500/20 backdrop-blur-lg border border-white/20 rounded-3xl p-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-yellow-200 mb-8 max-w-2xl mx-auto">
                Join thousands of happy customers who have received amazing personalised messages from their favorite celebrities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-8 py-4 text-lg"
                  onClick={() => router.push('/celebrities')}
                >
                  Browse Celebrities
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg"
                  onClick={() => router.push('/how-it-works')}
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

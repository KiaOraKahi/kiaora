"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Star, Search, Filter, Sparkles, Loader2, X, Calendar, DollarSign, Clock, Users, Award } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import MobileNavbar from "@/components/frontend/mobile-navbar"
import { formatRating } from "@/lib/utils"
import { formatPrice, heroGreetings, heroCelebrityGreetings } from "@/lib/services-data"

// Subtle starfield component
const SubtleLuxuryStarfield = (): null => {
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

interface Celebrity {
  id: string
  name: string
  category: string
  rating: number
  reviewCount: number
  price: number
  image: string
  bio: string
  responseTime: string
  completedVideos: number
  verified: boolean
  featured: boolean
  nextAvailable: string
  tags: string[]
}

interface CelebritiesResponse {
  celebrities: Celebrity[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

const categories = ["All", "Actor", "Musician", "Motivator", "Influencer", "Athlete", "Comedian", "Business", "Sports", "Entertainment"]
const sortOptions = ["Featured", "Price: Low to High", "Price: High to Low", "Rating", "Response Time", "Most Popular"]
const availabilityOptions = ["All", "Available Now", "Available This Week", "Available Next Week"]

export default function TalentsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("Featured")
  const [searchQuery, setSearchQuery] = useState("")
  const [celebrities, setCelebrities] = useState<Celebrity[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<CelebritiesResponse["pagination"] | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  
  // Enhanced filters
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [selectedAvailability, setSelectedAvailability] = useState("All")
  const [showFilters, setShowFilters] = useState(false)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchCelebrities = useCallback(async (page = 1, category = "All", search = "", sort = "Featured", priceRange = [0, 2000], availability = "All") => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(category !== "All" && { category }),
        ...(search && { search }),
        ...(sort !== "Featured" && { sortBy: sort }),
        ...(priceRange[0] > 0 && { minPrice: priceRange[0].toString() }),
        ...(priceRange[1] < 2000 && { maxPrice: priceRange[1].toString() }),
        ...(availability !== "All" && { availability }),
      })

      const response = await fetch(`/api/celebrities?${params}`)
      const data: CelebritiesResponse = await response.json()

      if (response.ok) {
        setCelebrities(data.celebrities)
        setPagination(data.pagination)
      } else {
        toast.error("Failed to load celebrities")
      }
    } catch (error) {
      console.error("Error fetching celebrities:", error)
      toast.error("Failed to load celebrities")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCelebrities(currentPage, selectedCategory, debouncedSearchQuery, sortBy, priceRange, selectedAvailability)
  }, [currentPage, selectedCategory, debouncedSearchQuery, sortBy, priceRange, selectedAvailability, fetchCelebrities])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchCelebrities(1, selectedCategory, searchQuery, sortBy, priceRange, selectedAvailability)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    setCurrentPage(1)
  }

  const handlePriceRangeChange = (range: number[]) => {
    setPriceRange(range)
    setCurrentPage(1)
  }

  const handleAvailabilityChange = (availability: string) => {
    setSelectedAvailability(availability)
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setSelectedCategory("All")
    setSortBy("Featured")
    setSearchQuery("")
    setPriceRange([0, 2000])
    setSelectedAvailability("All")
    setCurrentPage(1)
  }

  const handleBookNow = (celebrity: Celebrity) => {
    window.location.href = `/celebrities/${celebrity.id}`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (selectedCategory !== "All") count++
    if (sortBy !== "Featured") count++
    if (searchQuery) count++
    if (priceRange[0] > 0 || priceRange[1] < 2000) count++
    if (selectedAvailability !== "All") count++
    return count
  }

  const greetings = heroCelebrityGreetings
    const [currentGreeting, setCurrentGreeting] = useState(0)
  
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentGreeting((prev) => (prev + 1) % greetings.length)
      }, 3000)
  
      return () => clearInterval(interval)
    }, [greetings.length])



  return (
    <div className="min-h-screen bg-black">
      {/* Subtle Luxury Starfield Background */}
      <SubtleLuxuryStarfield />

      {isMobile ? <MobileNavbar /> : <Navbar />}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.3),transparent)]" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-yellow-500/20 text-yellow-200 border-yellow-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Browse Talent
            </Badge>
            {/* <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-yellow-200 to-purple-200 bg-clip-text text-transparent mb-6">
              Discover Amazing Talent
            </h1> */}

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
                  {greetings[currentGreeting]}
                </motion.span>
              </motion.h1>


            <p className="text-xl sm:text-2xl text-yellow-200 max-w-4xl mx-auto leading-relaxed">
              Connect with your favorite stars, influencers, and personalities for personalized video messages and live interactions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Talents Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : celebrities.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-yellow-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No talent found</h3>
              <p className="text-yellow-200 mb-6">Try adjusting your search or filters</p>
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                {celebrities.map((celebrity, index) => (
                  <motion.div
                    key={celebrity.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                    className="group"
                  >
                    <Card className="bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all duration-300 h-full">
                      <CardContent className="p-3 md:p-6">
                        <div className="relative mb-3 md:mb-4">
                          <Image
                            src={celebrity.image || "/placeholder.svg?height=300&width=300"}
                            alt={celebrity.name}
                            width={300}
                            height={300}
                            className="w-full h-32 md:h-48 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.svg?height=300&width=300";
                            }}
                          />
                          <div className="absolute top-2 right-2 flex flex-col gap-2">
                            {celebrity.featured && (
                              <Badge className="bg-yellow-500/80 text-black font-bold">
                                <Award className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            {celebrity.verified && (
                              <Badge className="bg-blue-500/80 text-white">
                                <Star className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>

                        <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">{celebrity.name}</h3>
                        <p className="text-yellow-200 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2">{celebrity.bio}</p>

                        <div className="flex items-center justify-between mb-3 md:mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-white text-xs md:text-sm">{formatRating(celebrity.rating)}</span>
                            <span className="text-purple-300 text-xs">({celebrity.reviewCount})</span>
                          </div>
                          <span className="text-lg md:text-2xl font-bold text-yellow-300">{formatPrice(celebrity.price)}</span>
                        </div>

                        <div className="space-y-1 md:space-y-2 mb-3 md:mb-4 text-xs">
                          <div className="flex justify-between">
                            <span className="text-yellow-300 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span className="hidden md:inline">Response:</span>
                            </span>
                            <span className="text-white text-xs">{celebrity.responseTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-yellow-300 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span className="hidden md:inline">Completed:</span>
                            </span>
                            <span className="text-white text-xs">{celebrity.completedVideos}</span>
                          </div>
                        </div>

                        {/* Tags - Hidden on mobile to save space */}
                        {celebrity.tags && celebrity.tags.length > 0 && (
                          <div className="mb-3 md:mb-4 hidden md:block">
                            <div className="flex flex-wrap gap-1">
                              {celebrity.tags.slice(0, 3).map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-white/5 border-white/20 text-yellow-200">
                                  {tag}
                                </Badge>
                              ))}
                              {celebrity.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs bg-white/5 border-white/20 text-yellow-200">
                                  +{celebrity.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <Button
                          className="w-full bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600 text-black font-bold text-sm md:text-base py-2 md:py-3"
                          onClick={() => handleBookNow(celebrity)}
                        >
                          Book Now
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Enhanced Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {/* First page */}
                      {pagination.page > 3 && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setCurrentPage(1)}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            size="sm"
                          >
                            1
                          </Button>
                          <span className="text-white px-2">...</span>
                        </>
                      )}
                      
                      {/* Page numbers around current page */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(pagination.totalPages, pagination.page - 2 + i))
                        if (page < 1 || page > pagination.totalPages) return null
                        
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                            className={
                              page === currentPage
                                ? "bg-purple-600 hover:bg-purple-700"
                                : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                            }
                            size="sm"
                          >
                            {page}
                          </Button>
                        )
                      }).filter(Boolean)}
                      
                      {/* Last page */}
                      {pagination.page < pagination.totalPages - 2 && (
                        <>
                          <span className="text-white px-2">...</span>
                          <Button
                            variant="outline"
                            onClick={() => setCurrentPage(pagination.totalPages)}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            size="sm"
                          >
                            {pagination.totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Next
                    </Button>
                  </div>
                  
                  <div className="text-sm text-yellow-200">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

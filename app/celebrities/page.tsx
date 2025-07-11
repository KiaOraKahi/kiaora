"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Star, Search, Filter, Sparkles, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import MobileNavbar from "@/components/frontend/mobile-navbar"

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
  featured: boolean
  verified: boolean
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

const categories = ["All", "Actors", "Musicians", "Motivators", "Influencers", "Athletes", "Comedians"]
const sortOptions = ["Featured", "Price: Low to High", "Price: High to Low", "Rating", "Response Time"]

export default function TalentsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("Featured")
  const [searchQuery, setSearchQuery] = useState("")
  const [celebrities, setCelebrities] = useState<Celebrity[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<CelebritiesResponse["pagination"] | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
 
  // Check if mobile
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 1024)
      }
  
      checkMobile()
      window.addEventListener("resize", checkMobile)
      return () => window.removeEventListener("resize", checkMobile)
    }, [])

  const fetchCelebrities = async (page = 1, category = "All", search = "", sort = "Featured") => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(category !== "All" && { category }),
        ...(search && { search }),
        ...(sort !== "Featured" && { sortBy: sort }),
      })

      const response = await fetch(`/api/celebrities?${params}`)
      const data: CelebritiesResponse = await response.json()

      if (response.ok) {
        setCelebrities(data.celebrities)
        setPagination(data.pagination)
      } else {
        console.error("Failed to fetch celebrities:", data.error)
        toast.error("Failed to load celebrities")
      }
    } catch (error) {
      console.error("Error fetching celebrities:", error)
      toast.error("Failed to load celebrities")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCelebrities(currentPage, selectedCategory, searchQuery, sortBy)
  }, [currentPage, selectedCategory, sortBy])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchCelebrities(1, selectedCategory, searchQuery, sortBy)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    setCurrentPage(1)
  }

  const handleBookNow = (celebrity: Celebrity) => {
    toast.success("Booking Started!", {
      description: `Starting booking process for ${celebrity.name}`,
      action: {
        label: "View Details",
        onClick: () => (window.location.href = `/celebrities/${celebrity.id}`),
      },
    })
  }

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
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-yellow-200 to-purple-200 bg-clip-text text-transparent mb-6">
              Discover Amazing Talent
            </h1>
            <p className="text-xl sm:text-2xl text-yellow-200 max-w-4xl mx-auto leading-relaxed">
              Connect with your favorite stars, influencers, and personalities for personalized video messages and live interactions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-300 w-5 h-5" />
              <Input
                placeholder="Search talent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-yellow-300"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => handleCategoryChange(category)}
                  size="sm"
                  className={
                    selectedCategory === category
                      ? "bg-gradient-to-r from-yellow-500 to-purple-500 text-black font-bold"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Filter className="text-yellow-300 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2"
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option} className="bg-black">
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
              <h3 className="text-2xl font-bold text-white mb-4">No talent found</h3>
              <p className="text-yellow-200">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                      <CardContent className="p-6">
                        <div className="relative mb-4">
                          <Image
                            src={celebrity.image || "/placeholder.svg?height=300&width=300"}
                            alt={celebrity.name}
                            width={300}
                            height={300}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          {celebrity.featured && (
                            <Badge className="absolute top-2 right-2 bg-yellow-500/80 text-black font-bold">
                              Featured
                            </Badge>
                          )}
                          {celebrity.verified && (
                            <Badge className="absolute top-2 left-2 bg-blue-500/80 text-white">Verified</Badge>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{celebrity.name}</h3>
                        <p className="text-yellow-200 text-sm mb-3">{celebrity.bio}</p>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-white text-sm">{celebrity.rating}</span>
                            <span className="text-purple-300 text-xs">({celebrity.reviewCount})</span>
                          </div>
                          <span className="text-2xl font-bold text-yellow-300">${celebrity.price}</span>
                        </div>

                        <div className="space-y-2 mb-4 text-xs">
                          <div className="flex justify-between">
                            <span className="text-yellow-300">Response Time:</span>
                            <span className="text-white">{celebrity.responseTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-yellow-300">Videos Completed:</span>
                            <span className="text-white">{celebrity.completedVideos}</span>
                          </div>
                        </div>

                        <Button
                          className="w-full bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600 text-black font-bold"
                          onClick={() => handleBookNow(celebrity)}
                        >
                          Book Now
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1
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
                    })}
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
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

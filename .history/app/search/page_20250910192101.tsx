"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Star, Clock, SlidersHorizontal, X, ArrowUpDown, Grid3X3, List, Sparkles, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import MobileNavbar from "@/components/frontend/mobile-navbar"
import { formatRating } from "@/lib/utils"

// We'll fetch real data from the API instead of using hardcoded data

const categories = [
  { name: "All Categories", value: "all" },
  { name: "Actors", value: "Actor" },
  { name: "Musicians", value: "Musician" },
  { name: "Athletes", value: "Athlete" },
  { name: "Comedians", value: "Comedian" },
  { name: "Influencers", value: "Influencer" },
  { name: "Motivators", value: "Motivator" },
]

const sortOptions = [
  { name: "Relevance", value: "relevance" },
  { name: "Price: Low to High", value: "price-asc" },
  { name: "Price: High to Low", value: "price-desc" },
  { name: "Rating: High to Low", value: "rating-desc" },
  { name: "Most Popular", value: "popular" },
  { name: "Response Time", value: "response-time" },
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

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all")
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [minRating, setMinRating] = useState(0)
  const [availability, setAvailability] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("relevance")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [celebrities, setCelebrities] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch celebrities data from API
  useEffect(() => {
    const fetchCelebrities = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/celebrities')
        const data = await response.json()
        if (response.ok) {
          setCelebrities(data.celebrities || [])
        } else {
          console.error('Failed to fetch celebrities:', data.error)
          setCelebrities([])
        }
      } catch (error) {
        console.error('Error fetching celebrities:', error)
        setCelebrities([])
      } finally {
        setLoading(false)
      }
    }
    fetchCelebrities()
  }, [])
        
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Search and filter logic
  const filteredResults = useMemo(() => {
    const results = celebrities.filter((celebrity) => {
      // Text search
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        celebrity.name.toLowerCase().includes(searchLower) ||
        celebrity.category.toLowerCase().includes(searchLower) ||
        celebrity.bio.toLowerCase().includes(searchLower) ||
        celebrity.tags.some((tag) => tag.toLowerCase().includes(searchLower))

      // Category filter
      const matchesCategory = selectedCategory === "all" || celebrity.category === selectedCategory

      // Price filter
      const matchesPrice = celebrity.price >= priceRange[0] && celebrity.price <= priceRange[1]

      // Rating filter
      const matchesRating = celebrity.rating >= minRating

      // Availability filter
      const matchesAvailability = availability.length === 0 || availability.includes(celebrity.availability)

      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesAvailability
    })

    // Sorting
    switch (sortBy) {
      case "price-asc":
        results.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        results.sort((a, b) => b.price - a.price)
        break
      case "rating-desc":
        results.sort((a, b) => b.rating - a.rating)
        break
      case "popular":
        results.sort((a, b) => b.reviewCount - a.reviewCount)
        break
      case "response-time":
        results.sort((a, b) => {
          const timeA = Number.parseInt(a.responseTime.split(" ")[0])
          const timeB = Number.parseInt(b.responseTime.split(" ")[0])
          return timeA - timeB
        })
        break
      default:
        // Relevance - featured first, then by rating
        results.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return b.rating - a.rating
        })
    }

    return results
  }, [searchTerm, selectedCategory, priceRange, minRating, availability, sortBy])

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchTerm) params.set("q", searchTerm)
    if (selectedCategory !== "all") params.set("category", selectedCategory)

    const newUrl = params.toString() ? `/search?${params.toString()}` : "/search"
    router.replace(newUrl, { scroll: false })
  }, [searchTerm, selectedCategory, router])

  const clearFilters = () => {
    setSelectedCategory("all")
    setPriceRange([0, 2000])
    setMinRating(0)
    setAvailability([])
    setSortBy("relevance")
  }

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 2000 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    availability.length

  return (
    <div className="min-h-screen overflow-hidden bg-black">
      {isMobile ? <MobileNavbar /> : <Navbar />}
      {/* Navbar */}
      <SubtleLuxuryStarfield />
      {/* Starfield Background */}

      {/* Hero Section */}

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Header */}
          <div className="mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-2xl">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search celebrities, categories, or services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-4 text-lg bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-6 py-4"
                >
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 bg-purple-500 text-white">{activeFiltersCount}</Badge>
                  )}
                </Button>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-white">
                  <span className="text-2xl font-bold">{filteredResults.length}</span>
                  <span className="text-purple-200 ml-2">
                    {filteredResults.length === 1 ? "result" : "results"}
                    {searchTerm && ` for "${searchTerm}"`}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort Dropdown */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* View Mode Toggle */}
                  <div className="flex bg-white/10 rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={viewMode === "grid" ? "bg-purple-500 text-white" : "text-white hover:bg-white/20"}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={viewMode === "list" ? "bg-purple-500 text-white" : "text-white hover:bg-white/20"}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, x: -300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ duration: 0.3 }}
                  className="w-80 flex-shrink-0"
                >
                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg sticky top-24">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">Filters</h3>
                        <div className="flex gap-2">
                          {activeFiltersCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearFilters}
                              className="text-purple-300 hover:text-white hover:bg-white/20"
                            >
                              Clear All
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilters(false)}
                            className="text-purple-300 hover:text-white hover:bg-white/20"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Category Filter */}
                        <div>
                          <h4 className="text-white font-semibold mb-3">Category</h4>
                          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Price Range Filter */}
                        <div>
                          <h4 className="text-white font-semibold mb-3">
                            Price Range: ${priceRange[0]} - ${priceRange[1]}
                          </h4>
                          <Slider
                            value={priceRange}
                            onValueChange={setPriceRange}
                            max={2000}
                            min={0}
                            step={50}
                            className="w-full"
                          />
                        </div>

                        {/* Rating Filter */}
                        <div>
                          <h4 className="text-white font-semibold mb-3">Minimum Rating</h4>
                          <div className="flex gap-2">
                            {[0, 3, 4, 4.5].map((rating) => (
                              <Button
                                key={rating}
                                variant={minRating === rating ? "default" : "outline"}
                                size="sm"
                                onClick={() => setMinRating(rating)}
                                className={
                                  minRating === rating
                                    ? "bg-purple-500 text-white"
                                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                                }
                              >
                                {rating === 0 ? "Any" : `${rating}+`}
                                {rating > 0 && <Star className="w-3 h-3 ml-1 fill-current" />}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Availability Filter */}
                        <div>
                          <h4 className="text-white font-semibold mb-3">Availability</h4>
                          <div className="space-y-2">
                            {["Available", "Busy", "Limited"].map((status) => (
                              <div key={status} className="flex items-center space-x-2">
                                <Checkbox
                                  id={status}
                                  checked={availability.includes(status)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setAvailability([...availability, status])
                                    } else {
                                      setAvailability(availability.filter((s) => s !== status))
                                    }
                                  }}
                                />
                                <label htmlFor={status} className="text-white text-sm">
                                  {status}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Grid/List */}
            <div className="flex-1">
              {loading ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Loading celebrities...</h3>
                  <p className="text-purple-200">Please wait while we fetch the latest celebrity data</p>
                </motion.div>
              ) : filteredResults.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
                  <p className="text-purple-200 mb-6">Try adjusting your search terms or filters</p>
                  <Button
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Clear Filters
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}
                >
                  {filteredResults.map((celebrity, index) => (
                    <motion.div
                      key={celebrity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      {viewMode === "grid" ? (
                        <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300 group hover:scale-105">
                          <CardContent className="p-6">
                            <div className="relative mb-4">
                              <Image
                                src={celebrity.image || "/placeholder.svg"}
                                alt={celebrity.name}
                                width={300}
                                height={400}
                                className="w-full h-48 object-cover rounded-lg"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-purple-500/80 text-white">{celebrity.category}</Badge>
                              </div>
                              {celebrity.featured && (
                                <div className="absolute top-2 right-2">
                                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Featured
                                  </Badge>
                                </div>
                              )}
                              <div className="absolute bottom-2 right-2">
                                <Badge
                                  className={`${
                                    celebrity.availability === "Available"
                                      ? "bg-green-500/80"
                                      : celebrity.availability === "Busy"
                                        ? "bg-red-500/80"
                                        : "bg-yellow-500/80"
                                  } text-white`}
                                >
                                  {celebrity.availability}
                                </Badge>
                              </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{celebrity.name}</h3>
                            <p className="text-purple-200 text-sm mb-3 line-clamp-2">{celebrity.bio}</p>

                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-white font-semibold">{celebrity.rating}</span>
                                <span className="text-purple-300 text-sm">({celebrity.reviewCount})</span>
                              </div>
                              <div className="flex items-center gap-1 text-purple-300 text-sm">
                                <Clock className="w-3 h-3" />
                                {celebrity.responseTime}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                              <span className="text-2xl font-bold text-purple-300">${celebrity.price}</span>
                              <div className="text-right">
                                <div className="text-green-400 text-sm font-semibold">
                                  {celebrity.completionRate}% completion
                                </div>
                              </div>
                            </div>

                            <Link href={`/celebrities/${celebrity.id}`}>
                              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                                View Profile
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex gap-6">
                              <div className="relative flex-shrink-0">
                                <Image
                                  src={celebrity.image || "/placeholder.svg"}
                                  alt={celebrity.name}
                                  width={120}
                                  height={160}
                                  className="w-24 h-32 object-cover rounded-lg"
                                />
                                {celebrity.featured && (
                                  <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                                    <Sparkles className="w-2 h-2 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                              </div>

                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{celebrity.name}</h3>
                                    <Badge className="bg-purple-500/80 text-white text-xs">{celebrity.category}</Badge>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-purple-300 mb-1">${celebrity.price}</div>
                                    <Badge
                                      className={`${
                                        celebrity.availability === "Available"
                                          ? "bg-green-500/80"
                                          : celebrity.availability === "Busy"
                                            ? "bg-red-500/80"
                                            : "bg-yellow-500/80"
                                      } text-white text-xs`}
                                    >
                                      {celebrity.availability}
                                    </Badge>
                                  </div>
                                </div>

                                <p className="text-purple-200 text-sm mb-3 line-clamp-2">{celebrity.bio}</p>

                                <div className="flex items-center gap-4 mb-3 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-white font-semibold">{formatRating(celebrity.rating)}</span>
                                    <span className="text-purple-300">({celebrity.reviewCount} reviews)</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-purple-300">
                                    <Clock className="w-3 h-3" />
                                    {celebrity.responseTime}
                                  </div>
                                  <div className="text-green-400 font-semibold">
                                    {celebrity.completionRate}% completion
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  {celebrity.tags.slice(0, 3).map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="outline"
                                      className="border-purple-500/30 text-purple-200 text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="flex-shrink-0">
                                <Link href={`/celebrities/${celebrity.id}`}>
                                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                                    View Profile
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
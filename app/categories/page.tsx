"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Star,
  Search,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  Users,
  TrendingUp,
  Sparkles,
  ChevronRight,
  ArrowRight,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"

const categories = [
  {
    id: "actors",
    name: "Actors & Actresses",
    description: "Hollywood stars and acclaimed performers from film and television",
    image: "/placeholder.svg?height=300&width=600&text=Actors+%26+Actresses",
    celebrityCount: 127,
    priceRange: "$99 - $1,999",
    avgRating: 4.8,
    trending: true,
    color: "from-red-500 to-pink-500",
    celebrities: [
      {
        id: 1,
        name: "Emma Stone",
        price: 299,
        rating: 4.9,
        image: "/placeholder.svg?height=300&width=200&text=Emma+Stone",
      },
      {
        id: 6,
        name: "Ryan Reynolds",
        price: 799,
        rating: 4.7,
        image: "/placeholder.svg?height=300&width=200&text=Ryan+Reynolds",
      },
      {
        id: 7,
        name: "Jennifer Lawrence",
        price: 899,
        rating: 4.8,
        image: "/placeholder.svg?height=300&width=200&text=Jennifer+Lawrence",
      },
    ],
  },
  {
    id: "musicians",
    name: "Musicians & Artists",
    description: "Chart-topping singers, instrumentalists, and music producers",
    image: "/placeholder.svg?height=300&width=600&text=Musicians+%26+Artists",
    celebrityCount: 89,
    priceRange: "$199 - $2,499",
    avgRating: 4.9,
    trending: false,
    color: "from-purple-500 to-indigo-500",
    celebrities: [
      {
        id: 2,
        name: "John Legend",
        price: 599,
        rating: 5.0,
        image: "/placeholder.svg?height=300&width=200&text=John+Legend",
      },
      {
        id: 8,
        name: "Taylor Swift",
        price: 2499,
        rating: 4.9,
        image: "/placeholder.svg?height=300&width=200&text=Taylor+Swift",
      },
      {
        id: 9,
        name: "Ed Sheeran",
        price: 1299,
        rating: 4.8,
        image: "/placeholder.svg?height=300&width=200&text=Ed+Sheeran",
      },
    ],
  },
  {
    id: "athletes",
    name: "Athletes & Sports Stars",
    description: "Olympic champions, professional athletes, and sports legends",
    image: "/placeholder.svg?height=300&width=600&text=Athletes+%26+Sports+Stars",
    celebrityCount: 156,
    priceRange: "$149 - $1,799",
    avgRating: 4.7,
    trending: true,
    color: "from-green-500 to-emerald-500",
    celebrities: [
      {
        id: 10,
        name: "Serena Williams",
        price: 1199,
        rating: 4.9,
        image: "/placeholder.svg?height=300&width=200&text=Serena+Williams",
      },
      {
        id: 11,
        name: "LeBron James",
        price: 1799,
        rating: 4.8,
        image: "/placeholder.svg?height=300&width=200&text=LeBron+James",
      },
      {
        id: 12,
        name: "Tom Brady",
        price: 1599,
        rating: 4.7,
        image: "/placeholder.svg?height=300&width=200&text=Tom+Brady",
      },
    ],
  },
  {
    id: "comedians",
    name: "Comedians & Entertainers",
    description: "Stand-up comedians, comedy actors, and entertainment personalities",
    image: "/placeholder.svg?height=300&width=600&text=Comedians+%26+Entertainers",
    celebrityCount: 73,
    priceRange: "$79 - $999",
    avgRating: 4.6,
    trending: false,
    color: "from-yellow-500 to-orange-500",
    celebrities: [
      {
        id: 13,
        name: "Kevin Hart",
        price: 649,
        rating: 4.6,
        image: "/placeholder.svg?height=300&width=200&text=Kevin+Hart",
      },
      {
        id: 14,
        name: "Amy Schumer",
        price: 499,
        rating: 4.5,
        image: "/placeholder.svg?height=300&width=200&text=Amy+Schumer",
      },
      {
        id: 15,
        name: "Dave Chappelle",
        price: 999,
        rating: 4.8,
        image: "/placeholder.svg?height=300&width=200&text=Dave+Chappelle",
      },
    ],
  },
  {
    id: "influencers",
    name: "Social Media Influencers",
    description: "YouTube stars, TikTok creators, and digital content creators",
    image: "/placeholder.svg?height=300&width=600&text=Social+Media+Influencers",
    celebrityCount: 234,
    priceRange: "$49 - $1,999",
    avgRating: 4.8,
    trending: true,
    color: "from-pink-500 to-rose-500",
    celebrities: [
      { id: 4, name: "MrBeast", price: 1299, rating: 4.9, image: "/placeholder.svg?height=300&width=200&text=MrBeast" },
      {
        id: 16,
        name: "Emma Chamberlain",
        price: 799,
        rating: 4.7,
        image: "/placeholder.svg?height=300&width=200&text=Emma+Chamberlain",
      },
      {
        id: 17,
        name: "PewDiePie",
        price: 1199,
        rating: 4.8,
        image: "/placeholder.svg?height=300&width=200&text=PewDiePie",
      },
    ],
  },
  {
    id: "motivators",
    name: "Motivational Speakers",
    description: "Life coaches, business leaders, and inspirational speakers",
    image: "/placeholder.svg?height=300&width=600&text=Motivational+Speakers",
    celebrityCount: 67,
    priceRange: "$199 - $2,999",
    avgRating: 4.9,
    trending: false,
    color: "from-blue-500 to-cyan-500",
    celebrities: [
      {
        id: 3,
        name: "Tony Robbins",
        price: 899,
        rating: 4.8,
        image: "/placeholder.svg?height=300&width=200&text=Tony+Robbins",
      },
      {
        id: 5,
        name: "Oprah Winfrey",
        price: 1999,
        rating: 5.0,
        image: "/placeholder.svg?height=300&width=200&text=Oprah+Winfrey",
      },
      {
        id: 18,
        name: "Gary Vaynerchuk",
        price: 1299,
        rating: 4.7,
        image: "/placeholder.svg?height=300&width=200&text=Gary+Vaynerchuk",
      },
    ],
  },
]

const sortOptions = [
  { value: "popularity", label: "Most Popular" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" },
  { value: "celebrity-count", label: "Most Celebrities" },
]

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("popularity")
  const [priceRange, setPriceRange] = useState([0, 3000])
  const [minRating, setMinRating] = useState(0)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [showCelebrities, setShowCelebrities] = useState<string | null>(null)

  // Filter and sort categories
  const filteredCategories = categories
    .filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRating = category.avgRating >= minRating
      return matchesSearch && matchesRating
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return Number.parseInt(a.priceRange.split(" - $")[1]) - Number.parseInt(b.priceRange.split(" - $")[1])
        case "price-high":
          return Number.parseInt(b.priceRange.split(" - $")[1]) - Number.parseInt(a.priceRange.split(" - $")[1])
        case "rating":
          return b.avgRating - a.avgRating
        case "celebrity-count":
          return b.celebrityCount - a.celebrityCount
        case "newest":
          return Math.random() - 0.5 // Simulate newest
        default:
          return b.trending ? 1 : -1
      }
    })

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null)
      setShowCelebrities(null)
    } else {
      setSelectedCategory(categoryId)
      setShowCelebrities(categoryId)
    }
  }

  const handleBookCelebrity = (celebrity: any) => {
    toast.success("Booking Started!", {
      description: `Starting booking process for ${celebrity.name}`,
      action: {
        label: "View Details",
        onClick: () => (window.location.href = `/celebrities/${celebrity.id}`),
      },
    })
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory(null)
    setSortBy("popularity")
    setPriceRange([0, 3000])
    setMinRating(0)
    setShowCelebrities(null)
  }

  const activeFiltersCount =
    (searchTerm ? 1 : 0) + (minRating > 0 ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 3000 ? 1 : 0)

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
              Browse Categories
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              Explore Celebrity Categories
            </h1>
            <p className="text-xl sm:text-2xl text-purple-200 max-w-4xl mx-auto leading-relaxed">
              Discover amazing celebrities across different industries and find the perfect match for your needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-purple-500 text-white">{activeFiltersCount}</Badge>
                )}
              </Button>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-purple-300 hover:text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-white font-semibold mb-3">
                          Price Range: ${priceRange[0]} - ${priceRange[1]}
                        </h4>
                        <Slider
                          value={priceRange}
                          onValueChange={setPriceRange}
                          max={3000}
                          min={0}
                          step={50}
                          className="w-full"
                        />
                      </div>
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
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Count */}
          <p className="text-purple-200 mb-8">
            Showing {filteredCategories.length} categories
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>
      </section>

      {/* Categories Grid/List */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No categories found</h3>
              <p className="text-purple-200 mb-6">Try adjusting your search terms or filters</p>
              <Button
                onClick={clearFilters}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  {viewMode === "grid" ? (
                    <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300 overflow-hidden group-hover:scale-105">
                      <div className="relative">
                        <Image
                          src={category.image || "/placeholder.svg"}
                          alt={category.name}
                          width={600}
                          height={300}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {category.trending && (
                          <Badge className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        )}

                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                          <p className="text-purple-200 text-sm">{category.description}</p>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Users className="w-4 h-4 text-purple-400" />
                              <span className="text-white font-semibold">{category.celebrityCount}</span>
                            </div>
                            <p className="text-purple-300 text-xs">Celebrities</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-white font-semibold">{category.avgRating}</span>
                            </div>
                            <p className="text-purple-300 text-xs">Avg Rating</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-purple-200 text-sm mb-1">Price Range</p>
                          <p className="text-white font-semibold">{category.priceRange}</p>
                        </div>

                        <div className="space-y-3">
                          <Button
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            onClick={() => handleCategoryClick(category.id)}
                          >
                            {selectedCategory === category.id ? "Hide Celebrities" : "View Celebrities"}
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>

                          <Link href={`/celebrities?category=${category.id}`}>
                            <Button
                              variant="outline"
                              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              Browse All
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          <div className="relative flex-shrink-0">
                            <Image
                              src={category.image || "/placeholder.svg"}
                              alt={category.name}
                              width={200}
                              height={120}
                              className="w-32 h-20 object-cover rounded-lg"
                            />
                            {category.trending && (
                              <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                                <TrendingUp className="w-2 h-2 mr-1" />
                                Hot
                              </Badge>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                                <p className="text-purple-200 text-sm">{category.description}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 mb-4 text-sm">
                              <div className="flex items-center gap-1 text-purple-300">
                                <Users className="w-4 h-4" />
                                <span>{category.celebrityCount} celebrities</span>
                              </div>
                              <div className="flex items-center gap-1 text-purple-300">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{category.avgRating} avg rating</span>
                              </div>
                              <div className="text-purple-300">{category.priceRange}</div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                onClick={() => handleCategoryClick(category.id)}
                              >
                                {selectedCategory === category.id ? "Hide" : "Preview"}
                              </Button>
                              <Link href={`/celebrities?category=${category.id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                >
                                  Browse All
                                  <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Celebrity Preview */}
                  <AnimatePresence>
                    {showCelebrities === category.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
                          <CardContent className="p-6">
                            <h4 className="text-white font-semibold mb-4">Featured {category.name}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {category.celebrities.map((celebrity, idx) => (
                                <motion.div
                                  key={celebrity.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="group cursor-pointer"
                                  onClick={() => handleBookCelebrity(celebrity)}
                                >
                                  <div className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors duration-200">
                                    <div className="flex items-center gap-3">
                                      <Image
                                        src={celebrity.image || "/placeholder.svg"}
                                        alt={celebrity.name}
                                        width={60}
                                        height={60}
                                        className="w-12 h-12 rounded-full object-cover"
                                      />
                                      <div className="flex-1">
                                        <h5 className="text-white font-medium">{celebrity.name}</h5>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            <span className="text-purple-200 text-sm">{celebrity.rating}</span>
                                          </div>
                                          <span className="text-purple-300 font-semibold">${celebrity.price}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                            <div className="mt-4 text-center">
                              <Link href={`/celebrities?category=${category.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                >
                                  View All {category.celebrityCount} Celebrities
                                  <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
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
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready to Connect?</h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Found your perfect category? Browse our amazing celebrities and start creating unforgettable moments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/celebrities">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-4 text-lg"
                >
                  Browse All Celebrities
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-12 py-4 text-lg"
                >
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}

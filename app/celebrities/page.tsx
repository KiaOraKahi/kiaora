"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Star, Grid, List, Clock, DollarSign, Sparkles, Play, MessageCircle } from "lucide-react"
import Image from "next/image"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import Link from "next/link"

const celebrities = [
  {
    id: 1,
    name: "Emma Stone",
    category: "Actor",
    rating: 4.9,
    reviews: 234,
    price: 299,
    responseTime: "24 hours",
    image: "/placeholder.svg?height=400&width=300",
    verified: true,
    featured: true,
    bio: "Academy Award-winning actress known for La La Land, Easy A, and Superbad.",
    tags: ["Movies", "Comedy", "Drama"],
  },
  {
    id: 2,
    name: "John Legend",
    category: "Musician",
    rating: 5.0,
    reviews: 189,
    price: 599,
    responseTime: "3 days",
    image: "/placeholder.svg?height=400&width=300",
    verified: true,
    featured: true,
    bio: "Grammy-winning singer, songwriter, and producer. EGOT winner.",
    tags: ["Music", "R&B", "Soul"],
  },
  {
    id: 3,
    name: "Tony Robbins",
    category: "Motivator",
    rating: 4.8,
    reviews: 456,
    price: 899,
    responseTime: "5 days",
    image: "/placeholder.svg?height=400&width=300",
    verified: true,
    featured: false,
    bio: "World-renowned life and business strategist, author, and speaker.",
    tags: ["Motivation", "Business", "Self-Help"],
  },
  {
    id: 4,
    name: "MrBeast",
    category: "Influencer",
    rating: 4.9,
    reviews: 567,
    price: 1299,
    responseTime: "7 days",
    image: "/placeholder.svg?height=400&width=300",
    verified: true,
    featured: true,
    bio: "YouTube sensation known for elaborate challenges and philanthropy.",
    tags: ["YouTube", "Gaming", "Philanthropy"],
  },
  {
    id: 5,
    name: "Oprah Winfrey",
    category: "Motivator",
    rating: 5.0,
    reviews: 123,
    price: 1999,
    responseTime: "10 days",
    image: "/placeholder.svg?height=400&width=300",
    verified: true,
    featured: true,
    bio: "Media mogul, talk show host, actress, and philanthropist.",
    tags: ["Media", "Inspiration", "Books"],
  },
  {
    id: 6,
    name: "Ryan Reynolds",
    category: "Actor",
    rating: 4.7,
    reviews: 345,
    price: 799,
    responseTime: "4 days",
    image: "/placeholder.svg?height=400&width=300",
    verified: true,
    featured: false,
    bio: "Canadian-American actor known for Deadpool, Green Lantern, and The Proposal.",
    tags: ["Movies", "Comedy", "Action"],
  },
]

const categories = ["All", "Actors", "Musicians", "Motivators", "Influencers", "Athletes", "Comedians"]
const sortOptions = ["Featured", "Price: Low to High", "Price: High to Low", "Rating", "Response Time"]

export default function CelebritiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("Featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  const filteredCelebrities = celebrities
    .filter((celeb) => {
      const matchesSearch = celeb.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "All" || celeb.category === selectedCategory.slice(0, -1)
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "Price: Low to High":
          return a.price - b.price
        case "Price: High to Low":
          return b.price - a.price
        case "Rating":
          return b.rating - a.rating
        case "Response Time":
          return Number.parseInt(a.responseTime) - Number.parseInt(b.responseTime)
        default:
          return b.featured ? 1 : -1
      }
    })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-purple-500/20 text-purple-200 border-purple-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Browse Celebrities
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              Find Your Perfect Celebrity
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
              Discover amazing celebrities ready to create personalized messages just for you.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search celebrities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
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
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:border-purple-500"
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option} className="bg-slate-800">
                    {option}
                  </option>
                ))}
              </select>

              <div className="flex border border-white/20 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-purple-500" : "text-white hover:bg-white/10"}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-purple-500" : "text-white hover:bg-white/10"}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-purple-200 mb-8">
            Showing {filteredCelebrities.length} celebrities
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
          </p>

          {/* Celebrity Grid/List */}
          <div
            className={
              viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "space-y-6"
            }
          >
            {filteredCelebrities.map((celebrity, index) => (
              <motion.div
                key={celebrity.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                {viewMode === "grid" ? (
                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300 group-hover:scale-105 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative">
                        <Image
                          src={celebrity.image || "/placeholder.svg"}
                          alt={celebrity.name}
                          width={300}
                          height={400}
                          className="w-full h-64 object-cover"
                        />
                        {celebrity.featured && (
                          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            Featured
                          </Badge>
                        )}
                        {celebrity.verified && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30">
                            <Play className="w-4 h-4 mr-2" />
                            View Sample
                          </Button>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-white">{celebrity.name}</h3>
                          <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30">
                            {celebrity.category}
                          </Badge>
                        </div>
                        <p className="text-purple-200 text-sm mb-4 line-clamp-2">{celebrity.bio}</p>
                        <div className="flex items-center gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-white">{celebrity.rating}</span>
                            <span className="text-purple-300">({celebrity.reviews})</span>
                          </div>
                          <div className="flex items-center gap-1 text-purple-300">
                            <Clock className="w-4 h-4" />
                            <span>{celebrity.responseTime}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-purple-300">${celebrity.price}</span>
                          <div className="flex gap-2">
                            <Link href={`/celebrities/${celebrity.id}`} className="flex-1">
                              <Button
                                variant="outline"
                                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                              >
                                View Profile
                              </Button>
                            </Link>
                            <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </div>
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
                          {celebrity.verified && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-2xl font-bold text-white mb-1">{celebrity.name}</h3>
                              <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30 mb-2">
                                {celebrity.category}
                              </Badge>
                            </div>
                            {celebrity.featured && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className="text-purple-200 mb-4">{celebrity.bio}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {celebrity.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="border-purple-500/30 text-purple-300">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-white">{celebrity.rating}</span>
                                <span className="text-purple-300">({celebrity.reviews} reviews)</span>
                              </div>
                              <div className="flex items-center gap-1 text-purple-300">
                                <Clock className="w-4 h-4" />
                                <span>{celebrity.responseTime}</span>
                              </div>
                              <div className="flex items-center gap-1 text-purple-300">
                                <DollarSign className="w-4 h-4" />
                                <span className="text-2xl font-bold text-purple-300">${celebrity.price}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Sample
                              </Button>
                              <Link href={`/celebrities/${celebrity.id}`}>
                                <Button
                                  variant="outline"
                                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                >
                                  View Profile
                                </Button>
                              </Link>
                              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                                Book Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ))}
          </div>

          {filteredCelebrities.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No celebrities found</h3>
              <p className="text-purple-200">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

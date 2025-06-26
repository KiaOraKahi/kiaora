"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Star, Search, Filter, Sparkles } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"

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
    description: "Academy Award-winning actress known for La La Land and Easy A",
    responseTime: "24 hours",
    completedVideos: 1250,
  },
  {
    id: 2,
    name: "John Legend",
    category: "Musician",
    rating: 5.0,
    price: "$599",
    image: "/talents/2.jpg",
    badge: "New",
    discount: "Limited Time",
    description: "Grammy-winning singer, songwriter, and producer",
    responseTime: "48 hours",
    completedVideos: 890,
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
    description: "World-renowned life coach and motivational speaker",
    responseTime: "72 hours",
    completedVideos: 2100,
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
    description: "YouTube sensation known for philanthropy and viral content",
    responseTime: "24 hours",
    completedVideos: 567,
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
    description: "Media mogul, talk show host, and philanthropist",
    responseTime: "1 week",
    completedVideos: 345,
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
    description: "Canadian actor known for Deadpool and witty humor",
    responseTime: "48 hours",
    completedVideos: 1890,
  },
]

const categories = ["All", "Actors", "Musicians", "Motivators", "Influencers", "Athletes", "Comedians"]
const sortOptions = ["Featured", "Price: Low to High", "Price: High to Low", "Rating", "Response Time"]

export default function TalentsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("Featured")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const filteredTalents = talents
    .filter((talent) => {
      const matchesCategory = selectedCategory === "All" || talent.category === selectedCategory.slice(0, -1)
      const matchesSearch =
        talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "Price: Low to High":
          return Number.parseInt(a.price.replace(/[^\d]/g, "")) - Number.parseInt(b.price.replace(/[^\d]/g, ""))
        case "Price: High to Low":
          return Number.parseInt(b.price.replace(/[^\d]/g, "")) - Number.parseInt(a.price.replace(/[^\d]/g, ""))
        case "Rating":
          return b.rating - a.rating
        default:
          return 0
      }
    })

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

      <Navbar />

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
              Connect with your favorite stars, influencers, and personalities for personalized experiences.
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
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-yellow-300"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
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
                onChange={(e) => setSortBy(e.target.value)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredTalents.map((talent, index) => (
              <motion.div
                key={talent.id}
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
                        src={talent.image || "/placeholder.svg"}
                        alt={talent.name}
                        width={300}
                        height={300}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Badge className="absolute top-2 right-2 bg-yellow-500/80 text-black font-bold">
                        {talent.badge}
                      </Badge>
                      {talent.discount && (
                        <Badge className="absolute top-2 left-2 bg-green-500/80 text-white">{talent.discount}</Badge>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{talent.name}</h3>
                    <p className="text-yellow-200 text-sm mb-3">{talent.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-white text-sm">{talent.rating}</span>
                      </div>
                      <span className="text-2xl font-bold text-yellow-300">{talent.price}</span>
                    </div>

                    <div className="space-y-2 mb-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-yellow-300">Response Time:</span>
                        <span className="text-white">{talent.responseTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-300">Videos Completed:</span>
                        <span className="text-white">{talent.completedVideos}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600 text-black font-bold"
                      onClick={() => handleBookNow(talent)}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredTalents.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-white mb-4">No talent found</h3>
              <p className="text-yellow-200">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

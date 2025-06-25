"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { motion } from "framer-motion"

const categories = [
  {
    name: "Actors & Actresses",
    description: "Explore the world of talented performers.",
    image:
      "https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
  },
  {
    name: "Musicians",
    description: "Discover the rhythm and melodies of music artists.",
    image:
      "https://images.unsplash.com/photo-1493225452140-a5553f17e891?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
  },
  {
    name: "Athletes",
    description: "Get inspired by the dedication of sports professionals.",
    image:
      "https://images.unsplash.com/photo-1541534741728-4e13f046c111?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80",
  },
  {
    name: "Comedians",
    description: "Laugh along with the best comedians in the industry.",
    image:
      "https://images.unsplash.com/photo-1504297050568-910e7945e450?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
  },
  {
    name: "Influencers",
    description: "Stay updated with the latest trends from top influencers.",
    image:
      "https://images.unsplash.com/photo-1586083702768-190ae093d34d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2074&q=80",
  },
]

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"name" | "price" | "popularity">("popularity")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold text-white mb-6">Explore Categories</h1>

      {/* Filters and Sorting */}
      <div className="mb-8">
        <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="actors">Actors & Actresses</SelectItem>
                    <SelectItem value="musicians">Musicians</SelectItem>
                    <SelectItem value="athletes">Athletes</SelectItem>
                    <SelectItem value="comedians">Comedians</SelectItem>
                    <SelectItem value="influencers">Influencers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="price">Price Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Price Range</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number.parseInt(e.target.value) || 0, priceRange[1]])}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    placeholder="Min"
                  />
                  <span className="text-white">-</span>
                  <Input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value) || 1000])}
                    className="bg-white/10 border-white/20 text-white text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSelectedCategory("all")
                    setSortBy("popularity")
                    setPriceRange([0, 1000])
                  }}
                  variant="outline"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300 overflow-hidden">
              <div className="relative">
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                  <p className="text-purple-200 text-sm">{category.description}</p>
                </div>
                <Badge className="absolute top-4 right-4 bg-purple-500/90 text-white">
                  {Math.floor(Math.random() * 50) + 10} celebrities
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-purple-200 text-sm">Price Range</p>
                    <p className="text-white font-semibold">
                      ${Math.floor(Math.random() * 200) + 99} - ${Math.floor(Math.random() * 800) + 299}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-200 text-sm">Popular</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < 4 ? "text-yellow-400 fill-current" : "text-gray-400"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Browse {category.name}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

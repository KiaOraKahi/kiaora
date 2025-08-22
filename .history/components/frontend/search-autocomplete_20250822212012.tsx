"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Star, Users, Briefcase, Clock, TrendingUp, X } from "lucide-react"

interface Celebrity {
  id: string
  name: string
  category: string
  rating: number
  price: number
  featured?: boolean
}

interface SearchAutocompleteProps {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
}

export default function SearchAutocomplete({
  placeholder = "Search celebrities, categories, or services...",
  onSearch,
  className = "",
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<any>({})
  const [celebrities, setCelebrities] = useState<Celebrity[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch celebrities data
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

  // Static data for categories, services, and trending searches
  const staticData = {
    categories: [
      { name: "Actors & Actresses", count: 150, icon: "🎭" },
      { name: "Musicians & Artists", count: 120, icon: "🎵" },
      { name: "Athletes & Sports Stars", count: 95, icon: "🏆" },
      { name: "Comedians", count: 65, icon: "😄" },
      { name: "Social Media Influencers", count: 200, icon: "📱" },
      { name: "Motivational Speakers", count: 70, icon: "💪" },
    ],
    services: [
      { name: "Birthday Greetings", description: "Personalized birthday messages" },
      { name: "Personal Messages", description: "Custom video messages" },
      { name: "Business Endorsements", description: "Professional shoutouts" },
      { name: "Motivational Messages", description: "Inspiring words" },
      { name: "Live Video Calls", description: "Real-time video sessions" },
    ],
    trending: [
      "Emma Stone birthday message",
              "Sarah wedding song",
      "Tony Robbins motivation",
      "MrBeast challenge",
      "Oprah life advice",
    ],
  }

  // Generate suggestions based on query
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions({})
      return
    }

    const queryLower = query.toLowerCase()

    const filteredCelebrities = celebrities
      .filter(
        (celeb) => celeb.name.toLowerCase().includes(queryLower) || celeb.category.toLowerCase().includes(queryLower),
      )
      .slice(0, 4)

    const filteredCategories = staticData.categories
      .filter((cat) => cat.name.toLowerCase().includes(queryLower))
      .slice(0, 3)

    const filteredServices = staticData.services
      .filter(
        (service) =>
          service.name.toLowerCase().includes(queryLower) || service.description.toLowerCase().includes(queryLower),
      )
      .slice(0, 3)

    const filteredTrending = staticData.trending
      .filter((trend) => trend.toLowerCase().includes(queryLower))
      .slice(0, 3)

    setSuggestions({
      celebrities: filteredCelebrities,
      categories: filteredCategories,
      services: filteredServices,
      trending: filteredTrending,
    })
  }, [query, celebrities])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsOpen(false)
      setQuery("")
      onSearch?.(searchQuery)
    }
  }

  const handleSuggestionClick = (suggestion: any, type: string) => {
    if (type === "celebrity") {
      router.push(`/celebrities/${suggestion.id}`)
    } else if (type === "category") {
      router.push(`/search?category=${encodeURIComponent(suggestion.name)}`)
    } else if (type === "service") {
      router.push(`/search?q=${encodeURIComponent(suggestion.name)}`)
    } else if (type === "trending") {
      handleSearch(suggestion)
    }
    setIsOpen(false)
    setQuery("")
  }

  const clearSearch = () => {
    setQuery("")
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const hasSuggestions = Object.values(suggestions).some((arr: any) => arr?.length > 0)

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch()
            } else if (e.key === "Escape") {
              setIsOpen(false)
            }
          }}
          className="pl-12 pr-12 py-4 text-lg bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {isOpen && (query.length >= 2 || !query) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto"
          >
            {!query && (
              <div className="p-4">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Trending Searches
                </h4>
                <div className="space-y-2">
                  {staticData.trending.slice(0, 5).map((trend, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(trend, "trending")}
                      className="block w-full text-left px-3 py-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {trend}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasSuggestions && (
              <div className="p-4 space-y-4">
                {/* Celebrities */}
                {suggestions.celebrities?.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Celebrities
                    </h4>
                    <div className="space-y-2">
                      {suggestions.celebrities.map((celebrity) => (
                        <button
                          key={celebrity.id}
                          onClick={() => handleSuggestionClick(celebrity, "celebrity")}
                          className="block w-full text-left p-3 hover:bg-white/10 rounded-lg transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {celebrity.name.charAt(0)}
                              </div>
                              <div>
                                <div className="text-white font-medium group-hover:text-purple-200 transition-colors">
                                  {celebrity.name}
                                </div>
                                <div className="text-purple-300 text-sm">{celebrity.category}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-white text-sm">{celebrity.rating}</span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                ${celebrity.price}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories */}
                {suggestions.categories?.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Categories
                    </h4>
                    <div className="space-y-2">
                      {suggestions.categories.map((category, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(category, "category")}
                          className="block w-full text-left px-3 py-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span>{category.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {category.count}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services */}
                {suggestions.services?.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Services
                    </h4>
                    <div className="space-y-2">
                      {suggestions.services.map((service, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(service, "service")}
                          className="block w-full text-left px-3 py-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-purple-300">{service.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches */}
                {suggestions.trending?.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Trending
                    </h4>
                    <div className="space-y-2">
                      {suggestions.trending.map((trend, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(trend, "trending")}
                          className="block w-full text-left px-3 py-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          {trend}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No results */}
            {query.length >= 2 && !hasSuggestions && !loading && (
              <div className="p-4 text-center">
                <div className="text-purple-300 mb-2">No results found for "{query}"</div>
                <Button
                  onClick={() => handleSearch()}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Search anyway
                </Button>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="p-4 text-center">
                <div className="text-purple-300">Loading suggestions...</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
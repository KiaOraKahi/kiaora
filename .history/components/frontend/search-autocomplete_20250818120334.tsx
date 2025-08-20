"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Star, Users, Briefcase, Clock, TrendingUp, X } from "lucide-react"

// Interface for celebrity data
interface Celebrity {
  id: string
  name: string
  category: string
  rating: number
  price: number
}

// Sample data for autocomplete (will be replaced with API data)
const searchSuggestions = {
  celebrities: [] as Celebrity[],
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
    "John Legend wedding song",
    "Tony Robbins motivation",
    "MrBeast challenge",
    "Oprah life advice",
  ],
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
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate suggestions based on query
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions({})
      return
    }

    const queryLower = query.toLowerCase()

    const filteredCelebrities = searchSuggestions.celebrities
      .filter(
        (celeb) => celeb.name.toLowerCase().includes(queryLower) || celeb.category.toLowerCase().includes(queryLower),
      )
      .slice(0, 4)

    const filteredCategories = searchSuggestions.categories
      .filter((cat) => cat.name.toLowerCase().includes(queryLower))
      .slice(0, 3)

    const filteredServices = searchSuggestions.services
      .filter(
        (service) =>
          service.name.toLowerCase().includes(queryLower) || service.description.toLowerCase().includes(queryLower),
      )
      .slice(0, 3)

    const filteredTrending = searchSuggestions.trending
      .filter((trend) => trend.toLowerCase().includes(queryLower))
      .slice(0, 3)

    setSuggestions({
      celebrities: filteredCelebrities,
      categories: filteredCategories,
      services: filteredServices,
      trending: filteredTrending,
    })
  }, [query])

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
                  {searchSuggestions.trending.slice(0, 5).map((trend, index) => (
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
                    <div className="space-y-1">
                      {suggestions.celebrities.map((celeb: any) => (
                        <button
                          key={celeb.id}
                          onClick={() => handleSuggestionClick(celeb, "celebrity")}
                          className="flex items-center justify-between w-full p-3 hover:bg-white/10 rounded-lg transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-left">
                              <div className="text-white font-medium">{celeb.name}</div>
                              <div className="text-purple-300 text-sm">{celeb.category}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-white text-sm">{celeb.rating}</span>
                            </div>
                            <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30">
                              ${celeb.price}
                            </Badge>
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
                    <div className="space-y-1">
                      {suggestions.categories.map((category: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(category, "category")}
                          className="flex items-center justify-between w-full p-3 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{category.icon}</span>
                            <span className="text-white">{category.name}</span>
                          </div>
                          <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30">
                            {category.count} celebrities
                          </Badge>
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
                    <div className="space-y-1">
                      {suggestions.services.map((service: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(service, "service")}
                          className="block w-full text-left p-3 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <div className="text-white font-medium">{service.name}</div>
                          <div className="text-purple-300 text-sm">{service.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {query.length >= 2 && !hasSuggestions && (
              <div className="p-6 text-center">
                <div className="text-4xl mb-2">🔍</div>
                <div className="text-white font-medium mb-1">No suggestions found</div>
                <div className="text-purple-300 text-sm mb-4">
                  Try searching for celebrities, categories, or services
                </div>
                <Button
                  onClick={() => handleSearch()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Search for "{query}"
                </Button>
              </div>
            )}

            {query && (
              <div className="border-t border-white/10 p-3">
                <Button
                  onClick={() => handleSearch()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search for "{query}"
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
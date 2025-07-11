"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Star,
  Clock,
  Play,
  Heart,
  Share2,
  Calendar,
  MessageCircle,
  CheckCircle,
  Users,
  Award,
  Sparkles,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import EnhancedBookingModal from "@/components/enhanced-booking-modal"
import VideoPlayer from "@/components/frontend/video-player"
import MobileNavbar from "@/components/frontend/mobile-navbar"

interface Celebrity {
  id: string
  name: string
  email: string
  image: string
  coverImage: string
  category: string
  rating: number
  reviewCount: number
  price: number
  responseTime: string
  verified: boolean
  featured: boolean
  bio: string
  longBio: string
  tags: string[]
  achievements: string[]
  sampleVideos: Array<{
    id: string
    title: string
    thumbnail: string
    duration: string
    videoUrl: string
  }>
  availability: {
    nextAvailable: string
    averageDelivery: string
    completionRate: number
    totalOrders: number
  }
  pricing: {
    personal: number
    business: number
    charity: number
  }
  reviews: Array<{
    id: string
    user: string
    rating: number
    date: string
    comment: string
    verified: boolean
    occasion: string
  }>
}

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

export default function CelebrityDetailPage() {
  const params = useParams()
  const celebrityId = params.id as string
  const [celebrity, setCelebrity] = useState<Celebrity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPricing, setSelectedPricing] = useState<"personal" | "business" | "charity">("personal")
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [selectedSampleVideo, setSelectedSampleVideo] = useState<any>(null)
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 1024)
      }
  
      checkMobile()
      window.addEventListener("resize", checkMobile)
      return () => window.removeEventListener("resize", checkMobile)
    }, [])

  useEffect(() => {
    const fetchCelebrity = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/celebrities/${celebrityId}`)
        const data = await response.json()

        if (response.ok) {
          setCelebrity(data)
        } else {
          setError(data.error || "Celebrity not found")
        }
      } catch (error) {
        console.error("Error fetching celebrity:", error)
        setError("Failed to load celebrity details")
      } finally {
        setLoading(false)
      }
    }

    if (celebrityId) {
      fetchCelebrity()
    }
  }, [celebrityId])

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Animated Stars Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>
        <div className="relative z-10">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </div>
    )
  }

  if (error || !celebrity) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Animated Stars Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Celebrity Not Found</h1>
          <p className="text-purple-200 mb-6">{error}</p>
          <Link href="/celebrities">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500">Back to Celebrities</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Safe access to nested properties with fallbacks
  const availability = celebrity.availability || {
    nextAvailable: "Available now",
    averageDelivery: "3-5 days",
    completionRate: 95,
    totalOrders: 0,
  }

  const pricing = celebrity.pricing || {
    personal: 299,
    business: 599,
    charity: 199,
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <SubtleLuxuryStarfield />

      <div className="relative z-10">
        {isMobile ? <MobileNavbar /> : <Navbar />}

        {/* Hero Section */}
        <section className="relative pt-20">
          {/* Cover Image */}
          <div className="relative h-96 overflow-hidden">
            <Image
              src={celebrity.coverImage || celebrity.image || "/placeholder.svg?height=400&width=1200"}
              alt={`${celebrity.name} cover`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            {/* Back Button */}
            <div className="absolute top-8 left-8">
              <Link href="/celebrities">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Celebrities
                </Button>
              </Link>
            </div>
            {/* Share & Favorite */}
            <div className="absolute top-8 right-8 flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFavorited(!isFavorited)}
                className={`bg-white/10 border-white/20 hover:bg-white/20 ${isFavorited ? "text-red-400" : "text-white"}`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Celebrity Info */}
          <div className="relative -mt-32 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Profile Image */}
                <div className="relative">
                  <div className="w-64 h-80 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl">
                    <Image
                      src={celebrity.image || "/placeholder.svg?height=600&width=400"}
                      alt={celebrity.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {celebrity.verified && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Celebrity Details */}
                <div className="flex-1 text-white">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <h1 className="text-4xl lg:text-5xl font-bold">{celebrity.name}</h1>
                    <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30 text-lg px-4 py-2">
                      {celebrity.category}
                    </Badge>
                    {celebrity.featured && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-4 py-2">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  <p className="text-xl text-purple-200 mb-6 max-w-3xl">{celebrity.bio}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-2xl font-bold">{celebrity.rating}</span>
                      </div>
                      <p className="text-purple-300 text-sm">{celebrity.reviewCount} Reviews</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Clock className="w-5 h-5 text-purple-400" />
                        <span className="text-2xl font-bold">{celebrity.responseTime}</span>
                      </div>
                      <p className="text-purple-300 text-sm">Response Time</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Users className="w-5 h-5 text-purple-400" />
                        <span className="text-2xl font-bold">{availability.totalOrders}</span>
                      </div>
                      <p className="text-purple-300 text-sm">Total Orders</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Award className="w-5 h-5 text-purple-400" />
                        <span className="text-2xl font-bold">{availability.completionRate}%</span>
                      </div>
                      <p className="text-purple-300 text-sm">Completion Rate</p>
                    </div>
                  </div>

                  {/* Pricing & Book Button */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-purple-300">${pricing[selectedPricing]}</span>
                      <select
                        value={selectedPricing}
                        onChange={(e) => setSelectedPricing(e.target.value as any)}
                        className="bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:border-purple-500"
                      >
                        <option value="personal" className="bg-slate-800">
                          Personal
                        </option>
                        <option value="business" className="bg-slate-800">
                          Business
                        </option>
                        <option value="charity" className="bg-slate-800">
                          Charity
                        </option>
                      </select>
                    </div>
                    <Button
                      onClick={() => setIsBookingOpen(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Book Now - ${pricing[selectedPricing]}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
                <TabsTrigger value="about" className="data-[state=active]:bg-purple-500">
                  About
                </TabsTrigger>
                <TabsTrigger value="samples" className="data-[state=active]:bg-purple-500">
                  Samples
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-purple-500">
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="availability" className="data-[state=active]:bg-purple-500">
                  Availability
                </TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about" className="mt-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                      <CardHeader>
                        <CardTitle className="text-white text-2xl">About {celebrity.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-purple-200 space-y-4">
                        <p className="text-lg leading-relaxed">{celebrity.longBio || celebrity.bio}</p>
                        {celebrity.tags && celebrity.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-6">
                            {celebrity.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="border-purple-500/30 text-purple-300">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  <div>
                    <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                      <CardHeader>
                        <CardTitle className="text-white text-xl">Achievements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {celebrity.achievements && celebrity.achievements.length > 0 ? (
                          <ul className="space-y-3">
                            {celebrity.achievements.map((achievement, index) => (
                              <li key={index} className="flex items-center gap-3 text-purple-200">
                                <Award className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                <span>{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-purple-200">No achievements listed yet.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Samples Tab */}
              <TabsContent value="samples" className="mt-8">
                {celebrity.sampleVideos && celebrity.sampleVideos.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {celebrity.sampleVideos.map((video) => (
                      <Card
                        key={video.id}
                        className="bg-white/10 border-white/20 backdrop-blur-lg overflow-hidden group cursor-pointer hover:bg-white/20 transition-all duration-300"
                        onClick={() => {
                          setSelectedSampleVideo(video)
                          setIsVideoPlayerOpen(true)
                        }}
                      >
                        <div className="relative">
                          <Image
                            src={video.thumbnail || "/placeholder.svg?height=200&width=300"}
                            alt={video.title}
                            width={300}
                            height={200}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30">
                              <Play className="w-6 h-6" />
                            </Button>
                          </div>
                          <Badge className="absolute top-3 right-3 bg-black/60 text-white">{video.duration}</Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="text-white font-semibold">{video.title}</h3>
                          <p className="text-purple-300 text-sm mt-1">Sample message</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Play className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Sample Videos</h3>
                    <p className="text-purple-200">Sample videos will be available soon.</p>
                  </div>
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-8">
                {celebrity.reviews && celebrity.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {celebrity.reviews.map((review) => (
                      <Card key={review.id} className="bg-white/10 border-white/20 backdrop-blur-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <Avatar>
                                <AvatarFallback className="bg-purple-500 text-white">
                                  {review.user.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-white font-semibold">{review.user}</h4>
                                  {review.verified && (
                                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-purple-300 text-sm">{review.date}</span>
                                  <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs">
                                    {review.occasion}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-purple-200 leading-relaxed">{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Reviews Yet</h3>
                    <p className="text-purple-200">Be the first to book and leave a review!</p>
                  </div>
                )}
              </TabsContent>

              {/* Availability Tab */}
              <TabsContent value="availability" className="mt-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                    <CardHeader>
                      <CardTitle className="text-white text-xl flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Availability
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200">Next Available:</span>
                        <span className="text-white font-semibold">{availability.nextAvailable}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200">Average Delivery:</span>
                        <span className="text-white font-semibold">{availability.averageDelivery}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200">Completion Rate:</span>
                        <span className="text-green-400 font-semibold">{availability.completionRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200">Total Orders:</span>
                        <span className="text-white font-semibold">{availability.totalOrders}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                    <CardHeader>
                      <CardTitle className="text-white text-xl">Pricing Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                          <div>
                            <span className="text-white font-semibold">Personal</span>
                            <p className="text-purple-300 text-sm">Birthdays, celebrations, personal messages</p>
                          </div>
                          <span className="text-2xl font-bold text-purple-300">${pricing.personal}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                          <div>
                            <span className="text-white font-semibold">Business</span>
                            <p className="text-purple-300 text-sm">Corporate events, promotions, endorsements</p>
                          </div>
                          <span className="text-2xl font-bold text-purple-300">${pricing.business}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                          <div>
                            <span className="text-white font-semibold">Charity</span>
                            <p className="text-purple-300 text-sm">Non-profit organizations, fundraising</p>
                          </div>
                          <span className="text-2xl font-bold text-green-400">${pricing.charity}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Enhanced Booking Modal */}
        <EnhancedBookingModal celebrity={celebrity} isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />

        {/* Video Player Modal */}
        <VideoPlayer
          isOpen={isVideoPlayerOpen}
          onClose={() => setIsVideoPlayerOpen(false)}
          title={selectedSampleVideo?.title}
          celebrity={celebrity.name}
          duration={selectedSampleVideo?.duration}
          poster={selectedSampleVideo?.thumbnail}
          autoPlay={true}
        />

        <Footer />
      </div>
    </div>
  )
}

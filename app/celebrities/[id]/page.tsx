"use client"

import { useState } from "react"
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
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import EnhancedBookingModal from "@/components/enhanced-booking-modal"
import VideoPlayer from "@/components/frontend/video-player"

// Extended celebrity data with more details
const celebrityData = {
  1: {
    id: 1,
    name: "Emma Stone",
    category: "Actor",
    rating: 4.9,
    reviewCount: 234,
    price: 299,
    responseTime: "24 hours",
    image: "/placeholder.svg?height=600&width=400",
    coverImage: "/placeholder.svg?height=400&width=1200",
    verified: true,
    featured: true,
    bio: "Academy Award-winning actress known for La La Land, Easy A, and Superbad. Emma brings warmth, humor, and authenticity to every personalized message.",
    longBio:
      "Emma Stone is an Academy Award-winning actress who has captivated audiences with her versatile performances in films ranging from comedy to drama. Born in Scottsdale, Arizona, Emma began her acting career in theater before making her mark in Hollywood with breakout roles in 'Superbad' and 'Easy A'. Her portrayal of Mia in 'La La Land' earned her the Academy Award for Best Actress, cementing her status as one of Hollywood's most talented performers. Known for her down-to-earth personality and infectious laugh, Emma loves connecting with fans through personalized messages that are both heartfelt and entertaining.",
    tags: ["Movies", "Comedy", "Drama", "Oscar Winner"],
    achievements: [
      "Academy Award Winner - Best Actress",
      "Golden Globe Winner",
      "BAFTA Award Winner",
      "Screen Actors Guild Award Winner",
    ],
    sampleVideos: [
      {
        id: 1,
        title: "Birthday Message",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "1:30",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        id: 2,
        title: "Congratulations",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "2:15",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        id: 3,
        title: "Motivation",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "1:45",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ],
    availability: {
      nextAvailable: "2024-01-15",
      averageDelivery: "24 hours",
      completionRate: 98,
      totalOrders: 1247,
    },
    pricing: {
      personal: 299,
      business: 599,
      charity: 199,
    },
    reviews: [
      {
        id: 1,
        user: "Sarah M.",
        rating: 5,
        date: "2024-01-10",
        comment:
          "Emma's message was absolutely perfect! She was so genuine and made my daughter's birthday extra special. Worth every penny!",
        verified: true,
        occasion: "Birthday",
      },
      {
        id: 2,
        user: "Mike R.",
        rating: 5,
        date: "2024-01-08",
        comment:
          "Incredible! Emma went above and beyond with the message. Her personality really shines through. Highly recommend!",
        verified: true,
        occasion: "Anniversary",
      },
      {
        id: 3,
        user: "Jennifer L.",
        rating: 4,
        date: "2024-01-05",
        comment: "Great message, delivered quickly. Emma was professional and the quality was excellent.",
        verified: true,
        occasion: "Graduation",
      },
    ],
  },
  2: {
    id: 2,
    name: "John Legend",
    category: "Musician",
    rating: 5.0,
    reviewCount: 189,
    price: 599,
    responseTime: "3 days",
    image: "/placeholder.svg?height=600&width=400",
    coverImage: "/placeholder.svg?height=400&width=1200",
    verified: true,
    featured: true,
    bio: "Grammy-winning singer, songwriter, and producer. EGOT winner who brings soulful melodies to personalized messages.",
    longBio:
      "John Legend is a multi-talented artist who has achieved the rare EGOT status (Emmy, Grammy, Oscar, and Tony awards). With his smooth vocals and heartfelt songwriting, John has become one of the most respected musicians of his generation. From his breakthrough album 'Get Lifted' to chart-topping hits like 'All of Me', John's music has touched millions of hearts worldwide. As a coach on 'The Voice' and through his philanthropic work, John continues to inspire and uplift others. His personalized messages often include musical elements, making each one a unique and memorable experience.",
    tags: ["Music", "R&B", "Soul", "EGOT Winner"],
    achievements: [
      "EGOT Winner (Emmy, Grammy, Oscar, Tony)",
      "12x Grammy Award Winner",
      "Academy Award Winner",
      "The Voice Coach",
    ],
    sampleVideos: [
      {
        id: 1,
        title: "Wedding Song",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "2:30",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        id: 2,
        title: "Birthday Serenade",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "1:45",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        id: 3,
        title: "Inspirational Message",
        thumbnail: "/placeholder.svg?height=200&width=300",
        duration: "2:00",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ],
    availability: {
      nextAvailable: "2024-01-18",
      averageDelivery: "3 days",
      completionRate: 100,
      totalOrders: 892,
    },
    pricing: {
      personal: 599,
      business: 1199,
      charity: 399,
    },
    reviews: [
      {
        id: 1,
        user: "Amanda K.",
        rating: 5,
        date: "2024-01-12",
        comment:
          "John sang a personalized version of 'All of Me' for our anniversary. My husband cried! Absolutely magical.",
        verified: true,
        occasion: "Anniversary",
      },
      {
        id: 2,
        user: "David P.",
        rating: 5,
        date: "2024-01-09",
        comment:
          "Professional, heartfelt, and delivered exactly what was promised. John's voice is even better in person!",
        verified: true,
        occasion: "Wedding",
      },
    ],
  },
} as const

export default function CelebrityDetailPage() {
  const params = useParams()
  const celebrityId = Number(params.id)
  const celebrity = celebrityData[celebrityId as keyof typeof celebrityData]

  const [selectedPricing, setSelectedPricing] = useState<"personal" | "business" | "charity">("personal")
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [selectedSampleVideo, setSelectedSampleVideo] = useState<any>(null)
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false)

  if (!celebrity) {
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
          <Link href="/celebrities">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500">Back to Celebrities</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-20">
          {/* Cover Image */}
          <div className="relative h-96 overflow-hidden">
            <Image
              src={celebrity.coverImage || "/placeholder.svg"}
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
                      src={celebrity.image || "/placeholder.svg"}
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
                        <span className="text-2xl font-bold">{celebrity.availability.totalOrders}</span>
                      </div>
                      <p className="text-purple-300 text-sm">Total Orders</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Award className="w-5 h-5 text-purple-400" />
                        <span className="text-2xl font-bold">{celebrity.availability.completionRate}%</span>
                      </div>
                      <p className="text-purple-300 text-sm">Completion Rate</p>
                    </div>
                  </div>

                  {/* Pricing & Book Button */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-purple-300">${celebrity.pricing[selectedPricing]}</span>
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

                    {/* Direct Booking Button - No Toast! */}
                    <Button
                      onClick={() => setIsBookingOpen(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Book Now - ${celebrity.pricing[selectedPricing]}
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
                <TabsTrigger value="about" className="text-white data-[state=active]:bg-purple-500">
                  About
                </TabsTrigger>
                <TabsTrigger value="samples" className="text-white data-[state=active]:bg-purple-500">
                  Samples
                </TabsTrigger>
                <TabsTrigger value="reviews" className="text-white data-[state=active]:bg-purple-500">
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="availability" className="text-white data-[state=active]:bg-purple-500">
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
                        <p className="text-lg leading-relaxed">{celebrity.longBio}</p>
                        <div className="flex flex-wrap gap-2 mt-6">
                          {celebrity.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="border-purple-500/30 text-purple-300">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                      <CardHeader>
                        <CardTitle className="text-white text-xl">Achievements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {celebrity.achievements.map((achievement, index) => (
                            <li key={index} className="flex items-center gap-3 text-purple-200">
                              <Award className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Samples Tab */}
              <TabsContent value="samples" className="mt-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {celebrity.sampleVideos.map((video, index) => (
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
                          src={video.thumbnail || "/placeholder.svg"}
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
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-8">
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
                        <span className="text-white font-semibold">{celebrity.availability.nextAvailable}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200">Average Delivery:</span>
                        <span className="text-white font-semibold">{celebrity.availability.averageDelivery}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200">Completion Rate:</span>
                        <span className="text-green-400 font-semibold">{celebrity.availability.completionRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-200">Total Orders:</span>
                        <span className="text-white font-semibold">{celebrity.availability.totalOrders}</span>
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
                          <span className="text-2xl font-bold text-purple-300">${celebrity.pricing.personal}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                          <div>
                            <span className="text-white font-semibold">Business</span>
                            <p className="text-purple-300 text-sm">Corporate events, promotions, endorsements</p>
                          </div>
                          <span className="text-2xl font-bold text-purple-300">${celebrity.pricing.business}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                          <div>
                            <span className="text-white font-semibold">Charity</span>
                            <p className="text-purple-300 text-sm">Non-profit organizations, fundraising</p>
                          </div>
                          <span className="text-2xl font-bold text-green-400">${celebrity.pricing.charity}</span>
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
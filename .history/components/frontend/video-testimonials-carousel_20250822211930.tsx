"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Play, Star, Quote } from "lucide-react"
import Image from "next/image"
import VideoPlayer from "./video-player"

const testimonialVideos = [
  {
    id: 1,
    title: "Amazing Birthday Surprise",
    customer: "Sarah Johnson",
    celebrity: "Emma Stone",
    rating: 5,
    thumbnail: "/placeholder.svg?height=300&width=400",
    duration: "2:15",
    quote: "Emma's message made my daughter's 16th birthday absolutely magical. She was so genuine and personal!",
    occasion: "Birthday",
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "Perfect Wedding Message",
    customer: "Mike & Lisa Chen",
            celebrity: "Sarah",
    rating: 5,
    thumbnail: "/placeholder.svg?height=300&width=400",
    duration: "3:20",
    quote: "John sang a personalized version of 'All of Me' for our wedding. There wasn't a dry eye in the house!",
    occasion: "Wedding",
    date: "2024-01-12",
  },
  {
    id: 3,
    title: "Motivational Masterpiece",
    customer: "David Rodriguez",
    celebrity: "Tony Robbins",
    rating: 5,
    thumbnail: "/placeholder.svg?height=300&width=400",
    duration: "4:45",
    quote: "Tony's motivational message helped me through the toughest time in my career. Life-changing!",
    occasion: "Motivation",
    date: "2024-01-10",
  },
  {
    id: 4,
    title: "Graduation Celebration",
    customer: "Jennifer Martinez",
    celebrity: "Oprah Winfrey",
    rating: 5,
    thumbnail: "/placeholder.svg?height=300&width=400",
    duration: "2:50",
    quote: "Oprah's graduation message for my son was beyond our wildest dreams. So inspiring and heartfelt!",
    occasion: "Graduation",
    date: "2024-01-08",
  },
  {
    id: 5,
    title: "Business Launch Boost",
    customer: "Alex Thompson",
    celebrity: "Gary Vaynerchuk",
    rating: 5,
    thumbnail: "/placeholder.svg?height=300&width=400",
    duration: "1:55",
    quote: "Gary's endorsement video gave our startup the credibility boost we needed. Amazing ROI!",
    occasion: "Business",
    date: "2024-01-05",
  },
]

export default function VideoTestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonialVideos.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonialVideos.length) % testimonialVideos.length)
  }

  const playVideo = (video: any) => {
    setSelectedVideo(video)
    setIsVideoPlayerOpen(true)
  }

  const getVisibleVideos = () => {
    const videos = []
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonialVideos.length
      videos.push(testimonialVideos[index])
    }
    return videos
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-6 bg-purple-500/20 text-purple-200 border-purple-500/30 text-lg px-6 py-2">
            <Quote className="w-4 h-4 mr-2" />
            Customer Stories
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Real Stories, Real Emotions</h2>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            See how our celebrity messages have created unforgettable moments for customers around the world.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <div className="flex items-center justify-center gap-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="grid md:grid-cols-3 gap-6 flex-1 max-w-6xl">
              <AnimatePresence mode="wait">
                {getVisibleVideos().map((video, index) => (
                  <motion.div
                    key={`${currentIndex}-${index}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`${index === 1 ? "md:scale-110 md:z-10" : "md:scale-95 md:opacity-75"} transition-all duration-500`}
                  >
                    <Card className="bg-white/10 border-white/20 backdrop-blur-lg overflow-hidden group hover:bg-white/20 transition-all duration-300">
                      {/* Video Thumbnail */}
                      <div className="relative">
                        <Image
                          src={video.thumbnail || "/placeholder.svg"}
                          alt={video.title}
                          width={400}
                          height={300}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            onClick={() => playVideo(video)}
                            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30"
                          >
                            <Play className="w-6 h-6 text-white ml-1" />
                          </Button>
                        </div>
                        <Badge className="absolute top-3 right-3 bg-black/60 text-white">{video.duration}</Badge>
                        <Badge className="absolute top-3 left-3 bg-purple-500/80 text-white">{video.celebrity}</Badge>
                      </div>

                      <CardContent className="p-6">
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(video.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>

                        <h3 className="text-white font-semibold mb-2">{video.title}</h3>
                        <p className="text-purple-200 text-sm mb-4 line-clamp-3">"{video.quote}"</p>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white text-sm font-medium">{video.customer}</div>
                            <div className="text-purple-300 text-xs">
                              {video.occasion} • {video.date}
                            </div>
                          </div>
                          <Button
                            onClick={() => playVideo(video)}
                            size="sm"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Watch
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 shrink-0"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonialVideos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex ? "bg-purple-500" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">10,000+</div>
            <div className="text-purple-300">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">4.9/5</div>
            <div className="text-purple-300">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">98%</div>
            <div className="text-purple-300">Satisfaction Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">24hrs</div>
            <div className="text-purple-300">Avg. Delivery</div>
          </div>
        </motion.div>
      </div>

      {/* Video Player Modal */}
      <VideoPlayer
        isOpen={isVideoPlayerOpen}
        onClose={() => setIsVideoPlayerOpen(false)}
        title={selectedVideo?.title}
        celebrity={selectedVideo?.celebrity}
        description={selectedVideo?.quote}
        duration={selectedVideo?.duration}
        poster={selectedVideo?.thumbnail}
        autoPlay={true}
      />
    </section>
  )
}
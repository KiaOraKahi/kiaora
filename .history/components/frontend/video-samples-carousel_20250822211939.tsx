"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Play, Star, ExternalLink } from "lucide-react"
import Image from "next/image"
import VideoPlayer from "@/components/frontend/video-player"

const videoSamples = [
  {
    id: 1,
    title: "Birthday Shoutout",
    celebrity: "Emma Stone",
    category: "Shoutouts",
    duration: "1:45",
    service: "Quick shoutouts",
    price: "$199",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoId: "dQw4w9WgXcQ",
  },
  {
    id: 2,
    title: "Wedding Anniversary Message",
            celebrity: "Sarah",
    category: "Personal",
    duration: "3:20",
    service: "Personalised messages",
    price: "$599",
    videoUrl: "https://www.youtube.com/watch?v=L_jWHffIx5E",
    videoId: "L_jWHffIx5E",
  },
  {
    id: 3,
    title: "Friendly Roast",
    celebrity: "Ryan Reynolds",
    category: "Roast",
    duration: "2:30",
    service: "Roast someone",
    price: "$799",
    videoUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    videoId: "kJQP7kiw5Fk",
  },
  {
    id: 4,
    title: "Live Q&A Session",
    celebrity: "Oprah Winfrey",
    category: "Live",
    duration: "15:00",
    service: "Live interaction",
    price: "$1999",
    videoUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    videoId: "9bZkp7q19f0",
  },
  {
    id: 5,
    title: "Product Endorsement",
    celebrity: "Gary Vaynerchuk",
    category: "Business",
    duration: "2:15",
    service: "Business endorsements",
    price: "$1299",
    videoUrl: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
    videoId: "fJ9rUzIMcZQ",
  },
  {
    id: 6,
    title: "Career Motivation",
    celebrity: "Tony Robbins",
    category: "Motivation",
    duration: "4:45",
    service: "Motivational messages",
    price: "$899",
    videoUrl: "https://www.youtube.com/watch?v=YQHsXMglC9A",
    videoId: "YQHsXMglC9A",
  },
]

export default function VideoSamplesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on client side only
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % videoSamples.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + videoSamples.length) % videoSamples.length)
  }

  const playVideo = (video: any) => {
    setSelectedVideo({
      ...video,
      videoUrl: video.videoUrl,
    })
    setIsVideoPlayerOpen(true)
  }

  const openYouTube = (video: any) => {
    window.open(video.videoUrl, "_blank")
  }

  const getVisibleVideos = () => {
    // Use state instead of direct window access
    const videosToShow = isMobile ? 1 : 3
    const videos = []
    for (let i = 0; i < videosToShow; i++) {
      const index = (currentIndex + i) % videoSamples.length
      videos.push(videoSamples[index])
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
            <Play className="w-4 h-4 mr-2" />
            Video Samples
          </Badge>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Watch sample videos from our celebrities and social media personalities to see the quality of personalised
            messages you can expect.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 shrink-0 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 max-w-6xl">
              <AnimatePresence mode="wait">
                {getVisibleVideos().map((video, index) => (
                  <motion.div
                    key={`${currentIndex}-${index}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`${
                      index === 1 && !isMobile ? "md:scale-110 md:z-10" : "md:scale-95 md:opacity-75"
                    } transition-all duration-500`}
                  >
                    <Card className="bg-white/10 border-white/20 backdrop-blur-lg overflow-hidden group hover:bg-white/20 transition-all duration-300">
                      {/* Video Thumbnail - Now Clickable */}
                      <div className="relative cursor-pointer" onClick={() => playVideo(video)}>
                        <Image
                          src={`/placeholder.svg?height=300&width=400&text=${encodeURIComponent(video.celebrity + " - " + video.title)}`}
                          alt={video.title}
                          width={400}
                          height={300}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex gap-2">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                playVideo(video)
                              }}
                              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30"
                              title="Play in Modal"
                            >
                              <Play className="w-4 h-4 text-white ml-0.5" />
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                openYouTube(video)
                              }}
                              className="w-12 h-12 rounded-full bg-red-600/80 backdrop-blur-sm border border-white/30 hover:bg-red-600"
                              title="Open in YouTube"
                            >
                              <ExternalLink className="w-4 h-4 text-white" />
                            </Button>
                          </div>
                        </div>
                        <Badge className="absolute top-3 right-3 bg-black/60 text-white">{video.duration}</Badge>
                        <Badge className="absolute top-3 left-3 bg-purple-500/80 text-white">{video.celebrity}</Badge>

                        {/* Large Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                            <Play className="w-6 h-6 text-white ml-1" />
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30">
                            {video.category}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-white text-sm">Sample</span>
                          </div>
                        </div>

                        <h3 className="text-white font-semibold mb-2">{video.title}</h3>
                        <p className="text-purple-200 text-sm mb-4">{video.service}</p>

                        <div className="flex items-center justify-between">
                          <div className="text-purple-300 text-lg font-bold">{video.price}</div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => playVideo(video)}
                              size="sm"
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Modal
                            </Button>
                            <Button
                              onClick={() => openYouTube(video)}
                              size="sm"
                              variant="outline"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              YouTube
                            </Button>
                          </div>
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
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 shrink-0 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {videoSamples.map((_, index) => (
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
            <div className="text-3xl font-bold text-white mb-2">500+</div>
            <div className="text-purple-300">Video Samples</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">200+</div>
            <div className="text-purple-300">Celebrities</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">HD</div>
            <div className="text-purple-300">Quality Videos</div>
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
        description={`Sample ${selectedVideo?.service} video`}
        duration={selectedVideo?.duration}
        poster={`/placeholder.svg?height=300&width=400&text=${encodeURIComponent((selectedVideo?.celebrity || "") + " - " + (selectedVideo?.title || ""))}`}
        autoPlay={true}
        videoUrl={selectedVideo?.videoUrl}
      />
    </section>
  )
}
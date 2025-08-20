"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Download,
  Share2,
  Heart,
  X,
} from "lucide-react"

interface VideoPlayerProps {
  src?: string
  poster?: string
  title?: string
  description?: string
  celebrity?: string
  duration?: string
  isOpen: boolean
  onClose: () => void
  autoPlay?: boolean
  videoUrl?: string
}

export default function VideoPlayer({
  src = "/placeholder-video.mp4",
  poster,
  title = "Sample Video",
  description,
  celebrity,
  duration,
  isOpen,
  onClose,
  autoPlay = false,
  videoUrl,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSettings, setShowSettings] = useState(false)

  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  // Convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url: unknown) => {
    if (typeof url !== "string" || url.trim().length === 0) return null

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=${autoPlay ? 1 : 0}&rel=0&modestbranding=1`
    }

    return null
  }

  const embedUrl = typeof videoUrl === "string" && videoUrl
    ? getYouTubeEmbedUrl(videoUrl)
    : null

  useEffect(() => {
    if (!embedUrl) {
      const video = videoRef.current
      if (!video) return

      const handleLoadedMetadata = () => {
        setVideoDuration(video.duration)
      }

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime)
      }

      const handlePlay = () => setIsPlaying(true)
      const handlePause = () => setIsPlaying(false)

      video.addEventListener("loadedmetadata", handleLoadedMetadata)
      video.addEventListener("timeupdate", handleTimeUpdate)
      video.addEventListener("play", handlePlay)
      video.addEventListener("pause", handlePause)

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata)
        video.removeEventListener("timeupdate", handleTimeUpdate)
        video.removeEventListener("play", handlePlay)
        video.removeEventListener("pause", handlePause)
      }
    }
  }, [embedUrl])

  useEffect(() => {
    if (autoPlay && isOpen && !embedUrl) {
      handlePlay()
    }
  }, [autoPlay, isOpen, embedUrl])

  const handlePlay = () => {
    const video = videoRef.current
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * videoDuration
    video.currentTime = newTime
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const skip = (seconds: number) => {
    const video = videoRef.current
    if (video) {
      video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, videoDuration))
    }
  }

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current
    if (video) {
      video.playbackRate = rate
      setPlaybackRate(rate)
      setShowSettings(false)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !embedUrl) {
        setShowControls(false)
      }
    }, 3000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-6xl mx-4"
          onClick={(e) => e.stopPropagation()}
          onMouseMove={handleMouseMove}
        >
          {/* Video Container */}
          <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl">
            {/* YouTube Embed or Regular Video */}
            {embedUrl ? (
              <div className="relative w-full aspect-video">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={title}
                />
              </div>
            ) : (
              <>
                {/* Regular Video Element */}
                <video ref={videoRef} className="w-full aspect-video" poster={poster} preload="metadata">
                  <source src={src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Video Placeholder (since we don't have real videos) */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Play className="w-12 h-12 text-white ml-1" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                    {celebrity && <p className="text-purple-200">by {celebrity}</p>}
                    {duration && <p className="text-purple-300 text-sm mt-2">{duration}</p>}
                    <p className="text-purple-300 text-sm mt-4 max-w-md">
                      This is a sample video player. In a real implementation, this would play actual celebrity videos.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Controls Overlay - Only show for non-YouTube videos */}
            {!embedUrl && (
              <AnimatePresence>
                {showControls && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60"
                  >
                    {/* Top Controls */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {celebrity && <Badge className="bg-purple-500/80 text-white">{celebrity}</Badge>}
                        <h3 className="text-white font-semibold">{title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsLiked(!isLiked)}
                          className={`text-white hover:bg-white/20 ${isLiked ? "text-red-400" : ""}`}
                        >
                          <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                          <Share2 className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                          <Download className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Center Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        onClick={handlePlay}
                        className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all"
                      >
                        {isPlaying ? (
                          <Pause className="w-8 h-8 text-white" />
                        ) : (
                          <Play className="w-8 h-8 text-white ml-1" />
                        )}
                      </Button>
                    </div>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-4 left-4 right-4">
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-white/20 rounded-full mb-4 cursor-pointer" onClick={handleSeek}>
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${(currentTime / videoDuration) * 100}%` }}
                        />
                      </div>

                      {/* Control Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePlay}
                            className="text-white hover:bg-white/20"
                          >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => skip(-10)}
                            className="text-white hover:bg-white/20"
                          >
                            <SkipBack className="w-5 h-5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => skip(10)}
                            className="text-white hover:bg-white/20"
                          >
                            <SkipForward className="w-5 h-5" />
                          </Button>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={toggleMute}
                              className="text-white hover:bg-white/20"
                            >
                              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </Button>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={isMuted ? 0 : volume}
                              onChange={handleVolumeChange}
                              className="w-20 accent-purple-500"
                            />
                          </div>

                          <span className="text-white text-sm">
                            {formatTime(currentTime)} / {formatTime(videoDuration)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowSettings(!showSettings)}
                              className="text-white hover:bg-white/20"
                            >
                              <Settings className="w-5 h-5" />
                            </Button>

                            {showSettings && (
                              <div className="absolute bottom-full right-0 mb-2 bg-black/80 backdrop-blur-sm rounded-lg p-3 min-w-32">
                                <div className="text-white text-sm mb-2">Playback Speed</div>
                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                  <button
                                    key={rate}
                                    onClick={() => changePlaybackRate(rate)}
                                    className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-white/20 ${
                                      playbackRate === rate ? "text-purple-400" : "text-white"
                                    }`}
                                  >
                                    {rate}x
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleFullscreen}
                            className="text-white hover:bg-white/20"
                          >
                            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* YouTube Video Controls - Simple overlay */}
            {embedUrl && (
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 bg-black/50"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>

          {/* Video Info */}
          {description && (
            <Card className="mt-4 bg-white/10 border-white/20 backdrop-blur-lg">
              <CardContent className="p-4">
                <p className="text-purple-200">{description}</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
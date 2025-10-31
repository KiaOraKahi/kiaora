"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import {
  Download,
  Heart,
  Maximize,
  Pause,
  Play,
  Share2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  src?: string;
  poster?: string;
  title?: string;
  description?: string;
  celebrity?: string;
  duration?: string;
  isOpen: boolean;
  onClose: () => void;
  autoPlay?: boolean;
  videoUrl?: string;
  isReview?: boolean;
  orderNumber?: string;
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
  isReview = false,
  orderNumber,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  // Convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url: unknown) => {
    if (typeof url !== "string" || url.trim().length === 0) return null;

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=${
        autoPlay ? 1 : 0
      }&rel=0&modestbranding=1`;
    }

    return null;
  };

  const embedUrl =
    typeof videoUrl === "string" && videoUrl
      ? getYouTubeEmbedUrl(videoUrl)
      : null;

  useEffect(() => {
    if (!embedUrl) {
      const video = videoRef.current;
      if (!video) return;

      const handleLoadedMetadata = () => {
        setVideoDuration(video.duration);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
      };
    }
  }, [embedUrl]);

  useEffect(() => {
    if (autoPlay && isOpen && !embedUrl) {
      handlePlay();
    }
  }, [autoPlay, isOpen, embedUrl]);

  const handlePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * videoDuration;
    video.currentTime = newTime;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.max(
        0,
        Math.min(video.currentTime + seconds, videoDuration)
      );
    }
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSettings(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !embedUrl) {
        setShowControls(false);
      }
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-6xl mx-2 sm:mx-4"
          onClick={(e) => e.stopPropagation()}
          onMouseMove={handleMouseMove}
        >
          {/* Video Container */}
          <div className="relative bg-black rounded-lg sm:rounded-xl overflow-hidden shadow-2xl">
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
                <video
                  ref={videoRef}
                  className="w-full aspect-video"
                  poster={poster}
                  preload="metadata"
                >
                  <source src={videoUrl || src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Video Controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60">
                  {/* Center Play Button */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        size="lg"
                        className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 text-white border-2 border-white/30"
                        onClick={togglePlay}
                      >
                        <Play className="w-8 h-8 ml-1" />
                      </Button>
                    </div>
                  )}
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
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex items-start justify-between gap-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-1 min-w-0">
                        {celebrity && (
                          <Badge className="bg-purple-500/80 text-white text-xs sm:text-sm w-fit">
                            {celebrity}
                          </Badge>
                        )}
                        <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                          {title}
                        </h3>
                      </div>
                      <div className="flex z-50 absolute  right-0 items-center gap-1 sm:gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsLiked(!isLiked)}
                          className={`text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10 ${
                            isLiked ? "text-red-400" : ""
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${
                              isLiked ? "fill-current" : ""
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10 hidden xs:flex"
                        >
                          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10 hidden xs:flex"
                        >
                          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={onClose}
                          className="text-white  hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10"
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5" />
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
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                      {/* Progress Bar */}
                      <div className="mb-2 sm:mb-4">
                        <div className="w-full bg-white/20 rounded-full h-1 sm:h-1.5">
                          <div
                            className="bg-white rounded-full h-1 sm:h-1.5 transition-all duration-300"
                            style={{
                              width: `${
                                videoDuration > 0
                                  ? (currentTime / videoDuration) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={togglePlay}
                            className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10"
                          >
                            {isPlaying ? (
                              <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMute}
                            className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10"
                          >
                            {isMuted ? (
                              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </Button>
                          <span className="text-white text-xs sm:text-sm font-medium">
                            {formatTime(currentTime)} /{" "}
                            {formatTime(videoDuration)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleFullscreen}
                            className="text-white hover:bg-white/20 w-8 h-8 sm:w-10 sm:h-10"
                          >
                            <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
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
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 bg-black/50 w-8 h-8 sm:w-10 sm:h-10"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            )}
          </div>

          {/* Video Info */}
          {description && (
            <Card className="mt-2 sm:mt-4 bg-white/10 border-white/20 backdrop-blur-lg">
              <CardContent className="p-3 sm:p-4">
                <p className="text-purple-200 text-sm sm:text-base leading-relaxed">
                  {description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Review Action Buttons */}
          {isReview && orderNumber && (
            <Card className="mt-2 sm:mt-4 bg-white/10 border-white/20 backdrop-blur-lg">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div className="text-center sm:text-left">
                    <h4 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                      Review Video
                    </h4>
                    <p className="text-purple-200 text-xs sm:text-sm">
                      Order: {orderNumber}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30 text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4"
                      onClick={async () => {
                        try {
                          const response = await fetch(
                            `/api/orders/${orderNumber}/decline`,
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                reason: "quality",
                                reasons: ["quality"],
                                feedback: "Video quality needs improvement",
                                requestRevision: true,
                              }),
                            }
                          );
                          if (response.ok) {
                            alert(
                              "Video declined successfully. Changes requested."
                            );
                            onClose();
                          } else {
                            const errorData = await response.json();
                            console.error("Decline error:", errorData);
                            alert("Failed to decline video. Please try again.");
                          }
                        } catch (error) {
                          console.error("Error declining video:", error);
                          alert("Error declining video. Please try again.");
                        }
                      }}
                    >
                      Decline & Request Changes
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4"
                      onClick={async () => {
                        try {
                          const response = await fetch(
                            `/api/orders/${orderNumber}/approve`,
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                            }
                          );
                          if (response.ok) {
                            alert("Video approved successfully!");
                            onClose();
                          } else {
                            alert("Failed to approve video. Please try again.");
                          }
                        } catch (error) {
                          console.error("Error approving video:", error);
                          alert("Error approving video. Please try again.");
                        }
                      }}
                    >
                      Approve Video
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

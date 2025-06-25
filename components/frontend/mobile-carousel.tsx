"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import Image from "next/image"

interface MobileCarouselProps {
  items: any[]
  renderItem: (item: any, index: number) => React.ReactNode
  className?: string
}

export function MobileCarousel({ items, renderItem, className = "" }: MobileCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)
    const threshold = 50
    const velocity = info.velocity.x
    const offset = info.offset.x

    if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
      if (offset > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      } else if (offset < 0 && currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1)
      }
    }

    x.set(0)
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        ref={containerRef}
        className="flex"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{
          x,
          transform: useTransform(x, (value) => `translateX(calc(-${currentIndex * 100}% + ${value}px))`),
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {items.map((item, index) => (
          <div key={index} className="w-full flex-shrink-0 px-2">
            {renderItem(item, index)}
          </div>
        ))}
      </motion.div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? "bg-purple-500 w-6" : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export function TouchOptimizedCelebrityCard({ celebrity }: { celebrity: any }) {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onTapCancel={() => setIsPressed(false)}
      className="touch-manipulation"
    >
      <Card
        className={`bg-white/10 border-white/20 backdrop-blur-lg transition-all duration-200 ${
          isPressed ? "bg-white/20 scale-95" : "hover:bg-white/20"
        }`}
      >
        <CardContent className="p-4">
          <div className="relative mb-4">
            <Image
              src={celebrity.image || "/placeholder.svg"}
              alt={celebrity.name}
              width={300}
              height={200}
              className="w-full h-40 object-cover rounded-lg"
            />
            <Badge className="absolute top-2 right-2 bg-purple-500/80 text-white text-xs">{celebrity.category}</Badge>
          </div>

          <h3 className="text-lg font-bold text-white mb-2">{celebrity.name}</h3>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-white text-sm">{celebrity.rating}</span>
            </div>
            <span className="text-xl font-bold text-purple-300">{celebrity.price}</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-medium touch-manipulation"
          >
            Book Now
          </motion.button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
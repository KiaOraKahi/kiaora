"use client"

import { motion } from "framer-motion"

export function CelebrityCardSkeleton() {
  return (
    <div className="bg-white/10 border border-white/20 backdrop-blur-lg rounded-lg overflow-hidden">
      <div className="p-6">
        {/* Image skeleton */}
        <div className="relative mb-4">
          <motion.div
            className="w-full h-48 bg-white/20 rounded-lg"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <div className="absolute top-2 right-2">
            <motion.div
              className="w-16 h-6 bg-white/20 rounded"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.2 }}
            />
          </div>
        </div>

        {/* Name skeleton */}
        <motion.div
          className="h-6 bg-white/20 rounded mb-2 w-3/4"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.3 }}
        />

        {/* Rating and price skeleton */}
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className="h-4 bg-white/20 rounded w-20"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.4 }}
          />
          <motion.div
            className="h-6 bg-white/20 rounded w-16"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
          />
        </div>

        {/* Button skeleton */}
        <motion.div
          className="h-10 bg-white/20 rounded w-full"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.6 }}
        />
      </div>
    </div>
  )
}

export function SearchResultSkeleton() {
  return (
    <div className="bg-white/10 border border-white/20 backdrop-blur-lg rounded-lg p-6">
      <div className="flex gap-6">
        {/* Image skeleton */}
        <motion.div
          className="w-24 h-32 bg-white/20 rounded-lg flex-shrink-0"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />

        <div className="flex-1">
          {/* Title and category */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <motion.div
                className="h-6 bg-white/20 rounded mb-2 w-32"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.1 }}
              />
              <motion.div
                className="h-4 bg-white/20 rounded w-20"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.2 }}
              />
            </div>
            <motion.div
              className="h-8 bg-white/20 rounded w-16"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.3 }}
            />
          </div>

          {/* Description */}
          <motion.div
            className="h-4 bg-white/20 rounded mb-2 w-full"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.4 }}
          />
          <motion.div
            className="h-4 bg-white/20 rounded mb-4 w-3/4"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
          />

          {/* Stats */}
          <div className="flex items-center gap-4 mb-3">
            <motion.div
              className="h-4 bg-white/20 rounded w-16"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.6 }}
            />
            <motion.div
              className="h-4 bg-white/20 rounded w-20"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.7 }}
            />
          </div>

          {/* Tags */}
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="h-6 bg-white/20 rounded w-16"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.8 + i * 0.1,
                }}
              />
            ))}
          </div>
        </div>

        {/* Button skeleton */}
        <motion.div
          className="h-10 bg-white/20 rounded w-24 flex-shrink-0"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.9 }}
        />
      </div>
    </div>
  )
}

export function VideoCardSkeleton() {
  return (
    <div className="bg-white/10 border border-white/20 backdrop-blur-lg rounded-lg overflow-hidden">
      {/* Video thumbnail skeleton */}
      <motion.div
        className="w-full h-48 bg-white/20"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <div className="p-4">
        {/* Title skeleton */}
        <motion.div
          className="h-5 bg-white/20 rounded mb-2 w-3/4"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.1 }}
        />

        {/* Description skeleton */}
        <motion.div
          className="h-4 bg-white/20 rounded mb-4 w-1/2"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.2 }}
        />

        {/* Footer skeleton */}
        <div className="flex items-center justify-between">
          <motion.div
            className="h-4 bg-white/20 rounded w-20"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.3 }}
          />
          <motion.div
            className="h-8 bg-white/20 rounded w-16"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.4 }}
          />
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Profile image skeleton */}
        <motion.div
          className="w-64 h-80 bg-white/20 rounded-2xl flex-shrink-0"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />

        <div className="flex-1">
          {/* Name and badges */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <motion.div
              className="h-12 bg-white/20 rounded w-64"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.1 }}
            />
            <motion.div
              className="h-8 bg-white/20 rounded w-20"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.2 }}
            />
          </div>

          {/* Bio */}
          <motion.div
            className="h-6 bg-white/20 rounded mb-2 w-full"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.3 }}
          />
          <motion.div
            className="h-6 bg-white/20 rounded mb-6 w-3/4"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.4 }}
          />

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <motion.div
                  className="h-8 bg-white/20 rounded mb-2 w-16 mx-auto"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 0.5 + i * 0.1,
                  }}
                />
                <motion.div
                  className="h-4 bg-white/20 rounded w-20 mx-auto"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 0.6 + i * 0.1,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Pricing and button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <motion.div
              className="h-10 bg-white/20 rounded w-32"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.9 }}
            />
            <motion.div
              className="h-12 bg-white/20 rounded w-32"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1.0 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
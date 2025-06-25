"use client"

import { motion } from "framer-motion"
import { Search, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Navbar from "@/components/frontend/navbar"

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                <Skeleton className="h-14 w-full bg-white/10" />
              </div>
              <div className="flex items-center gap-2 px-6 py-4 bg-white/10 rounded-lg">
                <Filter className="w-5 h-5 text-purple-400" />
                <Skeleton className="h-4 w-16 bg-white/10" />
              </div>
            </div>

            {/* Results Summary Skeleton */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 bg-white/10" />
                <Skeleton className="h-6 w-32 bg-white/10" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-48 bg-white/10" />
                <div className="flex bg-white/10 rounded-lg p-1">
                  <Skeleton className="h-8 w-8 bg-white/10 mr-1" />
                  <Skeleton className="h-8 w-8 bg-white/10" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar Skeleton */}
            <div className="w-80 flex-shrink-0">
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <Skeleton className="h-6 w-16 bg-white/10" />
                    <Skeleton className="h-6 w-20 bg-white/10" />
                  </div>

                  <div className="space-y-6">
                    {/* Category Filter Skeleton */}
                    <div>
                      <Skeleton className="h-5 w-20 bg-white/10 mb-3" />
                      <Skeleton className="h-10 w-full bg-white/10" />
                    </div>

                    {/* Price Range Skeleton */}
                    <div>
                      <Skeleton className="h-5 w-32 bg-white/10 mb-3" />
                      <Skeleton className="h-6 w-full bg-white/10" />
                    </div>

                    {/* Rating Filter Skeleton */}
                    <div>
                      <Skeleton className="h-5 w-28 bg-white/10 mb-3" />
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map((i) => (
                          <Skeleton key={i} className="h-8 w-12 bg-white/10" />
                        ))}
                      </div>
                    </div>

                    {/* Availability Skeleton */}
                    <div>
                      <Skeleton className="h-5 w-24 bg-white/10 mb-3" />
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <Skeleton className="h-4 w-4 bg-white/10" />
                            <Skeleton className="h-4 w-20 bg-white/10" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Grid Skeleton */}
            <div className="flex-1">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                      <CardContent className="p-6">
                        <Skeleton className="w-full h-48 bg-white/10 rounded-lg mb-4" />
                        <Skeleton className="h-6 w-3/4 bg-white/10 mb-2" />
                        <Skeleton className="h-4 w-full bg-white/10 mb-3" />
                        <div className="flex items-center justify-between mb-3">
                          <Skeleton className="h-4 w-16 bg-white/10" />
                          <Skeleton className="h-4 w-20 bg-white/10" />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <Skeleton className="h-8 w-16 bg-white/10" />
                          <Skeleton className="h-4 w-24 bg-white/10" />
                        </div>
                        <Skeleton className="h-10 w-full bg-white/10" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import { Skeleton } from "@/components/ui/skeleton"
import Navbar from "@/components/frontend/navbar"

export default function CelebrityDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      {/* Hero Section Skeleton */}
      <section className="relative pt-20">
        <div className="relative h-96 overflow-hidden">
          <Skeleton className="w-full h-full bg-white/10" />
        </div>

        <div className="relative -mt-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <Skeleton className="w-64 h-80 rounded-2xl bg-white/10" />

              <div className="flex-1 space-y-4">
                <Skeleton className="h-12 w-96 bg-white/10" />
                <Skeleton className="h-6 w-full max-w-3xl bg-white/10" />
                <Skeleton className="h-6 w-2/3 bg-white/10" />

                <div className="grid grid-cols-4 gap-6 py-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="text-center space-y-2">
                      <Skeleton className="h-8 w-16 mx-auto bg-white/10" />
                      <Skeleton className="h-4 w-20 mx-auto bg-white/10" />
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Skeleton className="h-12 w-32 bg-white/10" />
                  <Skeleton className="h-12 w-40 bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-full bg-white/10" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full bg-white/10" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full bg-white/10" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
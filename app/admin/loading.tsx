import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header Skeleton */}
      <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Skeleton className="h-8 w-32 mx-auto mb-6 bg-white/10" />
          <Skeleton className="h-16 w-96 mx-auto mb-4 bg-white/10" />
          <Skeleton className="h-6 w-80 mx-auto bg-white/10" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20 bg-white/10" />
                      <Skeleton className="h-8 w-12 bg-white/10" />
                      <Skeleton className="h-3 w-16 bg-white/10" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full bg-white/10" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <Skeleton className="h-8 w-64 bg-white/10" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-32 bg-white/10" />
                    <Skeleton className="h-4 w-48 bg-white/10" />
                    <Skeleton className="h-4 w-24 bg-white/10" />
                    <Skeleton className="h-4 w-20 bg-white/10" />
                    <Skeleton className="h-4 w-16 bg-white/10" />
                    <Skeleton className="h-8 w-20 bg-white/10" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
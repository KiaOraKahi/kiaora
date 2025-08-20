import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      <div className="relative z-10 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
        <p className="text-purple-200">Loading your dashboard...</p>
      </div>
    </div>
  )
} 
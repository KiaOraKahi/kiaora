"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Star, Calendar, DollarSign, FileText, Settings, Menu } from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminOverview } from "@/components/admin/admin-overview"
import { AdminUsers } from "@/components/admin/admin-users"
import { AdminCelebrities } from "@/components/admin/admin-celebrities"
import { AdminBookings } from "@/components/admin/admin-bookings"
import { AdminApplications } from "@/components/admin/admin-applications"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "ADMIN") {
      router.push("/")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return <AdminOverview />
      case "users":
        return <AdminUsers />
      case "celebrities":
        return <AdminCelebrities />
      case "applications":
        return <AdminApplications />
      case "bookings":
        return <AdminBookings />
      case "financials":
        return (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Financial Management</h3>
            <p className="text-gray-400">Financial management features coming soon...</p>
          </div>
        )
      case "content":
        return (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Content Management</h3>
            <p className="text-gray-400">Content management features coming soon...</p>
          </div>
        )
      case "settings":
        return (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Settings</h3>
            <p className="text-gray-400">Settings panel coming soon...</p>
          </div>
        )
      default:
        return <AdminOverview />
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              i % 10 === 0 ? "w-2 h-2 bg-purple-400" : i % 15 === 0 ? "w-1.5 h-1.5 bg-pink-400" : "w-1 h-1 bg-white"
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <div  className="fixed">
        <AdminSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Header */}
          <div className="lg:hidden bg-black/80 backdrop-blur-xl border-b border-purple-500/30 p-4 sticky top-0 z-30">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="text-white hover:text-purple-400 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </Button>
              <h1 className="text-lg font-semibold text-white">Admin Dashboard</h1>
              <div className="w-6"></div> {/* Spacer for centering */}
            </div>
          </div>

          {/* Content Area */}
          <main className="p-4 lg:ml-64 lg:p-8">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderActiveSection()}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}

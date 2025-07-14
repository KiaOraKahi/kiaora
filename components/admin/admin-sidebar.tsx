"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  Star,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { signOut } from "next-auth/react"

interface AdminSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

interface SidebarStats {
  totalUsers: number
  totalCelebrities: number
  pendingApplications: number
  totalBookings: number
}

export function AdminSidebar({ activeSection, setActiveSection, sidebarOpen, setSidebarOpen }: AdminSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["main"])
  const [stats, setStats] = useState<SidebarStats>({
    totalUsers: 0,
    totalCelebrities: 0,
    pendingApplications: 0,
    totalBookings: 0,
  })

  useEffect(() => {
    fetchSidebarStats()
  }, [])

  const fetchSidebarStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats({
          totalUsers: data.totalUsers,
          totalCelebrities: data.totalCelebrities,
          pendingApplications: data.pendingApplications,
          totalBookings: data.totalBookings,
        })
      }
    } catch (error) {
      console.error("Error fetching sidebar stats:", error)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const menuItems = [
    {
      id: "main",
      title: "Main",
      items: [
        { id: "overview", label: "Overview", icon: LayoutDashboard, badge: null },
        { id: "users", label: "Users", icon: Users, badge: stats.totalUsers > 0 ? stats.totalUsers.toString() : null },
        {
          id: "celebrities",
          label: "Celebrities",
          icon: Star,
          badge: stats.totalCelebrities > 0 ? stats.totalCelebrities.toString() : null,
        },
      ],
    },
    {
      id: "operations",
      title: "Operations",
      items: [
        {
          id: "bookings",
          label: "Bookings",
          icon: Calendar,
          badge: stats.totalBookings > 0 ? stats.totalBookings.toString() : null,
        },
        { id: "financials", label: "Financials", icon: DollarSign, badge: null },
        {
          id: "content",
          label: "Content",
          icon: FileText,
          badge: stats.pendingApplications > 0 ? stats.pendingApplications.toString() : null,
        },
      ],
    },
    {
      id: "system",
      title: "System",
      items: [{ id: "settings", label: "Settings", icon: Settings, badge: null }],
    },
  ]

  const handleItemClick = (itemId: string) => {
    setActiveSection(itemId)
    setSidebarOpen(false) // Close sidebar on mobile after selection
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-black/90 backdrop-blur-xl border-r border-purple-500/30 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Admin Panel
                </h2>
                <p className="text-sm text-gray-400">Kia Ora Platform</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {menuItems.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-400 hover:text-white transition-colors mb-2"
                  >
                    <span>{section.title}</span>
                    {expandedSections.includes(section.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedSections.includes(section.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 ml-2">
                          {section.items.map((item) => {
                            const Icon = item.icon
                            const isActive = activeSection === item.id
                            return (
                              <button
                                key={item.id}
                                onClick={() => handleItemClick(item.id)}
                                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                  isActive
                                    ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/30"
                                    : "text-gray-300 hover:text-white hover:bg-white/5"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : ""}`} />
                                  <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs"
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-purple-500/30">
            <Button
              onClick={() => signOut()}
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

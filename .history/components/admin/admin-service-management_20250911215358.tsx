"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Save, 
  X,
  Calendar,
  DollarSign,
  Clock,
  Star,
  Zap,
  MessageCircle,
  Video,
  Building,
  Gift,
  Camera,
  Briefcase,
  Heart,
  Music,
  Mic,
  Users,
  Award,
  Target,
  TrendingUp
} from "lucide-react"
import { toast } from "sonner"

interface ServiceFeature {
  id: string
  text: string
  order: number
}

interface Service {
  id: string
  title: string
  shortDescription: string
  fullDescription: string
  icon: string
  color: string
  startingPrice: number
  asapPrice: number
  duration: string
  deliveryTime: string
  asapDeliveryTime: string
  popular: boolean
  isActive: boolean
  currency: string
  order: number
  features: ServiceFeature[]
  createdAt: string
  updatedAt: string
}

const iconOptions = [
  { value: "Camera", label: "Camera", icon: Camera },
  { value: "Video", label: "Video", icon: Video },
  { value: "MessageCircle", label: "Message", icon: MessageCircle },
  { value: "Building", label: "Building", icon: Building },
  { value: "Gift", label: "Gift", icon: Gift },
  { value: "Briefcase", label: "Briefcase", icon: Briefcase },
  { value: "Heart", label: "Heart", icon: Heart },
  { value: "Music", label: "Music", icon: Music },
  { value: "Mic", label: "Mic", icon: Mic },
  { value: "Users", label: "Users", icon: Users },
  { value: "Award", label: "Award", icon: Award },
  { value: "Target", label: "Target", icon: Target },
  { value: "TrendingUp", label: "Trending", icon: TrendingUp },
  { value: "Zap", label: "Zap", icon: Zap },
  { value: "Star", label: "Star", icon: Star }
]

const colorOptions = [
  { value: "from-yellow-500 to-orange-500", label: "Yellow to Orange", color: "bg-gradient-to-r from-yellow-500 to-orange-500" },
  { value: "from-blue-500 to-purple-500", label: "Blue to Purple", color: "bg-gradient-to-r from-blue-500 to-purple-500" },
  { value: "from-pink-500 to-red-500", label: "Pink to Red", color: "bg-gradient-to-r from-pink-500 to-red-500" },
  { value: "from-green-500 to-blue-500", label: "Green to Blue", color: "bg-gradient-to-r from-green-500 to-blue-500" },
  { value: "from-purple-500 to-pink-500", label: "Purple to Pink", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
  { value: "from-indigo-500 to-purple-500", label: "Indigo to Purple", color: "bg-gradient-to-r from-indigo-500 to-purple-500" },
  { value: "from-emerald-500 to-teal-500", label: "Emerald to Teal", color: "bg-gradient-to-r from-emerald-500 to-teal-500" },
  { value: "from-rose-500 to-pink-500", label: "Rose to Pink", color: "bg-gradient-to-r from-rose-500 to-pink-500" }
]

export default function AdminServiceManagement() {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    title: "",
    shortDescription: "",
    fullDescription: "",
    icon: "Briefcase",
    color: "from-purple-500 to-pink-500",
    startingPrice: 0,
    asapPrice: 0,
    duration: "",
    deliveryTime: "",
    asapDeliveryTime: "",
    popular: false,
    isActive: true,
    features: [""]
  })

  // Fetch services on component mount
  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/services")
      if (response.ok) {
        const data = await response.json()
        console.log("Admin services API response:", data)
        
        // Handle both old format (direct array) and new format (wrapped in services property)
        const servicesArray = Array.isArray(data) ? data : (Array.isArray(data.services) ? data.services : [])
        setServices(servicesArray)
        setFilteredServices(servicesArray)
      } else {
        toast.error("Failed to fetch services")
        // Set empty arrays as fallback
        setServices([])
        setFilteredServices([])
      }
    } catch (error) {
      console.error("Error fetching services:", error)
      // Set empty arrays as fallback to prevent map error
      setServices([])
      setFilteredServices([])
      toast.error("Failed to fetch services")
    } finally {
      setLoading(false)
    }
  }

  // Filter services based on search
  useEffect(() => {
    let filtered = services

    if (searchTerm) {
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredServices(filtered)
  }, [services, searchTerm])

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(option => option.value === iconName)
    if (iconOption) {
      const IconComponent = iconOption.icon
      return <IconComponent className="w-6 h-6" />
    }
    return <Settings className="w-6 h-6" />
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setEditFormData({
      title: service.title,
      shortDescription: service.shortDescription,
      fullDescription: service.fullDescription || service.shortDescription,
      icon: service.icon,
      color: service.color,
      startingPrice: service.startingPrice,
      asapPrice: service.asapPrice,
      duration: service.duration,
      deliveryTime: service.deliveryTime,
      asapDeliveryTime: service.asapDeliveryTime,
      popular: service.popular,
      isActive: service.isActive,
      features: service.features.map(f => f.text)
    })
    setShowEditModal(true)
  }

  const handleUpdateService = async () => {
    if (!editingService) return

    try {
      const response = await fetch(`/api/admin/services/${editingService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editFormData,
          features: editFormData.features.filter((f) => f.trim() !== ""),
        }),
      })

      if (response.ok) {
        toast.success("Service updated successfully!")
        setShowEditModal(false)
        setEditingService(null)
        fetchServices() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to update service")
      }
    } catch (error) {
      console.error("Error updating service:", error)
      toast.error("Error updating service")
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Service deleted successfully!")
        fetchServices() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to delete service")
      }
    } catch (error) {
      console.error("Error deleting service:", error)
      toast.error("Error deleting service")
    }
  }

  const addFeature = () => {
    setEditFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }))
  }

  const removeFeature = (index: number) => {
    setEditFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const updateFeature = (index: number, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }))
  }

  const getColorClass = (colorValue: string) => {
    const colorOption = colorOptions.find(option => option.value === colorValue)
    return colorOption ? colorOption.color : "bg-gradient-to-r from-gray-500 to-gray-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Service Management</h2>
          <p className="text-gray-400">Manage your platform services and offerings</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Service
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search services..."
              className="pl-10 bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading services...</p>
          </div>
        ) : (
          <AnimatePresence>
            {Array.isArray(filteredServices) && filteredServices.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-gray-900/50 border-gray-700 hover:border-gray-600 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getColorClass(service.color)}`}>
                          {getIconComponent(service.icon)}
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{service.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={service.isActive ? "bg-green-500" : "bg-gray-500"}>
                              {service.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {service.popular && (
                              <Badge className="bg-yellow-500">Popular</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300 text-sm">{service.shortDescription}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-1 text-gray-400 mb-1">
                          <DollarSign className="w-3 h-3" />
                          Starting
                        </div>
                        <div className="text-white font-medium">${service.startingPrice}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-gray-400 mb-1">
                          <Zap className="w-3 h-3" />
                          ASAP
                        </div>
                        <div className="text-orange-400 font-medium">${service.asapPrice}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-gray-400 mb-1">
                          <Clock className="w-3 h-3" />
                          Duration
                        </div>
                        <div className="text-white">{service.duration}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-gray-400 mb-1">
                          <Calendar className="w-3 h-3" />
                          Delivery
                        </div>
                        <div className="text-white">{service.deliveryTime}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-400 text-sm mb-2">Features ({service.features.length})</div>
                      <div className="space-y-1">
                        {service.features.slice(0, 3).map((feature) => (
                          <div key={feature.id} className="text-white text-sm">• {feature.text}</div>
                        ))}
                        {service.features.length > 3 && (
                          <div className="text-gray-400 text-sm">+{service.features.length - 3} more...</div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-blue-600/20 border-blue-500 text-blue-300 hover:bg-blue-600/30 hover:border-blue-400"
                        onClick={() => handleEditService(service)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-600/20 border-red-500 text-red-300 hover:bg-red-600/30 hover:border-red-400"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!loading && filteredServices.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Settings className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No services found</h3>
            <p className="text-gray-500">Try adjusting your search or create a new service</p>
          </div>
        )}
      </div>

      {/* Edit Service Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Edit Service</h3>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-gray-300">Title</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="text-sm font-medium text-gray-300">Short Description</label>
                <input
                  type="text"
                  value={editFormData.shortDescription}
                  onChange={(e) => setEditFormData({...editFormData, shortDescription: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="text-sm font-medium text-gray-300">Full Description</label>
                <textarea
                  value={editFormData.fullDescription}
                  onChange={(e) => setEditFormData({...editFormData, fullDescription: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                  rows={3}
                />
              </div>

              {/* Icon and Color */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Icon</label>
                  <select
                    value={editFormData.icon}
                    onChange={(e) => setEditFormData({...editFormData, icon: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                  >
                    {iconOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Color</label>
                  <select
                    value={editFormData.color}
                    onChange={(e) => setEditFormData({...editFormData, color: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                  >
                    {colorOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Starting Price ($)</label>
                  <input
                    type="number"
                    value={editFormData.startingPrice}
                    onChange={(e) => setEditFormData({...editFormData, startingPrice: Number(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">ASAP Price ($)</label>
                  <input
                    type="number"
                    value={editFormData.asapPrice}
                    onChange={(e) => setEditFormData({...editFormData, asapPrice: Number(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Duration and Delivery */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Duration</label>
                  <input
                    type="text"
                    value={editFormData.duration}
                    onChange={(e) => setEditFormData({...editFormData, duration: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                    placeholder="e.g., 30-60 seconds"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Delivery Time</label>
                  <input
                    type="text"
                    value={editFormData.deliveryTime}
                    onChange={(e) => setEditFormData({...editFormData, deliveryTime: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                    placeholder="e.g., 3-7 days"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">ASAP Delivery</label>
                  <input
                    type="text"
                    value={editFormData.asapDeliveryTime}
                    onChange={(e) => setEditFormData({...editFormData, asapDeliveryTime: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                    placeholder="e.g., 24-48 hours"
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="text-sm font-medium text-gray-300">Features</label>
                <div className="space-y-2">
                  {editFormData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                        placeholder="Enter feature"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                    onClick={addFeature}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editFormData.popular}
                    onChange={(e) => setEditFormData({...editFormData, popular: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Popular</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData({...editFormData, isActive: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Active</span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-6">
              <Button
                onClick={handleUpdateService}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Update Service
              </Button>
              <Button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingService(null)
                }}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

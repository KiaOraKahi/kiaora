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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newService, setNewService] = useState({
    title: "",
    shortDescription: "",
    fullDescription: "",
    icon: "",
    color: "",
    startingPrice: 0,
    asapPrice: 0,
    duration: "",
    deliveryTime: "",
    asapDeliveryTime: "",
    popular: false,
    isActive: true,
    currency: "nzd",
    features: [] as string[]
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
        setServices(data)
      } else {
        toast.error("Failed to fetch services")
      }
    } catch (error) {
      console.error("Error fetching services:", error)
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

  const handleCreateService = async () => {
    if (!newService.title || !newService.shortDescription || !newService.icon || !newService.color) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch("/api/admin/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newService),
      })

      if (response.ok) {
        const createdService = await response.json()
        setServices([createdService, ...services])
        setNewService({
          title: "",
          shortDescription: "",
          fullDescription: "",
          icon: "",
          color: "",
          startingPrice: 0,
          asapPrice: 0,
          duration: "",
          deliveryTime: "",
          asapDeliveryTime: "",
          popular: false,
          isActive: true,
          currency: "nzd",
          features: []
        })
        setIsCreateDialogOpen(false)
        toast.success("Service created successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to create service")
      }
    } catch (error) {
      console.error("Error creating service:", error)
      toast.error("Failed to create service")
    }
  }

  const handleEditService = async () => {
    if (!editingService) return

    try {
      const response = await fetch(`/api/admin/services/${editingService.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingService),
      })

      if (response.ok) {
        const updatedService = await response.json()
        setServices(services.map(service => 
          service.id === editingService.id ? updatedService : service
        ))
        setEditingService(null)
        setIsEditDialogOpen(false)
        toast.success("Service updated successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update service")
      }
    } catch (error) {
      console.error("Error updating service:", error)
      toast.error("Failed to update service")
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return

    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setServices(services.filter(service => service.id !== id))
        toast.success("Service deleted successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to delete service")
      }
    } catch (error) {
      console.error("Error deleting service:", error)
      toast.error("Failed to delete service")
    }
  }

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(option => option.value === iconName)
    if (iconOption) {
      const IconComponent = iconOption.icon
      return <IconComponent className="w-6 h-6" />
    }
    return <Settings className="w-6 h-6" />
  }

  const getColorClass = (colorValue: string) => {
    const colorOption = colorOptions.find(option => option.value === colorValue)
    return colorOption ? colorOption.color : "bg-gradient-to-r from-gray-500 to-gray-600"
  }

  const addFeature = (service: Service | typeof newService) => {
    const featureText = prompt("Enter feature text:")
    if (featureText && featureText.trim()) {
      if ('features' in service && Array.isArray(service.features)) {
        // For editing existing service
        const updatedFeatures = [...service.features, { id: Date.now().toString(), text: featureText.trim(), order: service.features.length }]
        setEditingService({ ...service, features: updatedFeatures })
      } else {
        // For new service
        setNewService({ ...service, features: [...service.features, featureText.trim()] })
      }
    }
  }

  const removeFeature = (index: number, service: Service | typeof newService) => {
    if ('features' in service && Array.isArray(service.features)) {
      // For editing existing service
      const updatedFeatures = service.features.filter((_, i) => i !== index)
      setEditingService({ ...service, features: updatedFeatures })
    } else {
      // For new service
      const updatedFeatures = service.features.filter((_, i) => i !== index)
      setNewService({ ...service, features: updatedFeatures })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Service Management</h2>
          <p className="text-gray-400">Manage your platform services and offerings</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Service
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
              <p className="text-gray-400">Add a new service to your platform offerings.</p>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Service Title</label>
                  <Input
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                    placeholder="e.g., Quick Shout-outs"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Icon</label>
                  <Select value={newService.icon} onValueChange={(value) => setNewService({ ...newService, icon: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                          <div className="flex items-center gap-2">
                            <option.icon className="w-4 h-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Color Gradient</label>
                <Select value={newService.color} onValueChange={(value) => setNewService({ ...newService, color: value })}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {colorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${option.color}`}></div>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Short Description</label>
                <Textarea
                  value={newService.shortDescription}
                  onChange={(e) => setNewService({ ...newService, shortDescription: e.target.value })}
                  placeholder="Brief description for cards..."
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Full Description</label>
                <Textarea
                  value={newService.fullDescription}
                  onChange={(e) => setNewService({ ...newService, fullDescription: e.target.value })}
                  placeholder="Detailed description for service page..."
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Starting Price ($)</label>
                  <Input
                    type="number"
                    value={newService.startingPrice}
                    onChange={(e) => setNewService({ ...newService, startingPrice: parseFloat(e.target.value) || 0 })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">ASAP Price ($)</label>
                  <Input
                    type="number"
                    value={newService.asapPrice}
                    onChange={(e) => setNewService({ ...newService, asapPrice: parseFloat(e.target.value) || 0 })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Duration</label>
                  <Input
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                    placeholder="e.g., 30-60 seconds"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Delivery Time</label>
                  <Input
                    value={newService.deliveryTime}
                    onChange={(e) => setNewService({ ...newService, deliveryTime: e.target.value })}
                    placeholder="e.g., 3-7 days"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">ASAP Delivery</label>
                  <Input
                    value={newService.asapDeliveryTime}
                    onChange={(e) => setNewService({ ...newService, asapDeliveryTime: e.target.value })}
                    placeholder="e.g., 24-48 hours"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Features</label>
                <div className="space-y-2">
                  {newService.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => {
                          const updatedFeatures = [...newService.features]
                          updatedFeatures[index] = e.target.value
                          setNewService({ ...newService, features: updatedFeatures })
                        }}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index, newService)}
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addFeature(newService)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    + Add Feature
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newService.popular}
                    onCheckedChange={(checked) => setNewService({ ...newService, popular: checked })}
                  />
                  <label className="text-sm font-medium text-gray-300">Mark as Popular</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newService.isActive}
                    onCheckedChange={(checked) => setNewService({ ...newService, isActive: checked })}
                  />
                  <label className="text-sm font-medium text-gray-300">Active</label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateService} className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Save className="w-4 h-4 mr-2" />
                  Create Service
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
            {filteredServices.map((service) => (
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
                        {service.features.slice(0, 3).map((feature, index) => (
                          <div key={feature.id} className="text-white text-sm">• {feature.text}</div>
                        ))}
                        {service.features.length > 3 && (
                          <div className="text-gray-400 text-sm">+{service.features.length - 3} more...</div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingService(service)
                              setIsEditDialogOpen(true)
                            }}
                            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Service</DialogTitle>
                            <p className="text-gray-400">Update the service details and settings.</p>
                          </DialogHeader>
                          {editingService && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-300">Service Title</label>
                                  <Input
                                    value={editingService.title}
                                    onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                                    className="bg-gray-800 border-gray-600 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-300">Icon</label>
                                  <Select value={editingService.icon} onValueChange={(value) => setEditingService({ ...editingService, icon: value })}>
                                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-600">
                                      {iconOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                                          <div className="flex items-center gap-2">
                                            <option.icon className="w-4 h-4" />
                                            {option.label}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-300">Color Gradient</label>
                                <Select value={editingService.color} onValueChange={(value) => setEditingService({ ...editingService, color: value })}>
                                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-800 border-gray-600">
                                    {colorOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-4 h-4 rounded ${option.color}`}></div>
                                          {option.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-300">Short Description</label>
                                <Textarea
                                  value={editingService.shortDescription}
                                  onChange={(e) => setEditingService({ ...editingService, shortDescription: e.target.value })}
                                  className="bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-300">Full Description</label>
                                <Textarea
                                  value={editingService.fullDescription}
                                  onChange={(e) => setEditingService({ ...editingService, fullDescription: e.target.value })}
                                  className="bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-300">Starting Price ($)</label>
                                  <Input
                                    type="number"
                                    value={editingService.startingPrice}
                                    onChange={(e) => setEditingService({ ...editingService, startingPrice: parseFloat(e.target.value) || 0 })}
                                    className="bg-gray-800 border-gray-600 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-300">ASAP Price ($)</label>
                                  <Input
                                    type="number"
                                    value={editingService.asapPrice}
                                    onChange={(e) => setEditingService({ ...editingService, asapPrice: parseFloat(e.target.value) || 0 })}
                                    className="bg-gray-800 border-gray-600 text-white"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-300">Duration</label>
                                  <Input
                                    value={editingService.duration}
                                    onChange={(e) => setEditingService({ ...editingService, duration: e.target.value })}
                                    className="bg-gray-800 border-gray-600 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-300">Delivery Time</label>
                                  <Input
                                    value={editingService.deliveryTime}
                                    onChange={(e) => setEditingService({ ...editingService, deliveryTime: e.target.value })}
                                    className="bg-gray-800 border-gray-600 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-300">ASAP Delivery</label>
                                  <Input
                                    value={editingService.asapDeliveryTime}
                                    onChange={(e) => setEditingService({ ...editingService, asapDeliveryTime: e.target.value })}
                                    className="bg-gray-800 border-gray-600 text-white"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-300">Features</label>
                                <div className="space-y-2">
                                  {editingService.features.map((feature, index) => (
                                    <div key={feature.id} className="flex items-center gap-2">
                                      <Input
                                        value={feature.text}
                                        onChange={(e) => {
                                          const updatedFeatures = [...editingService.features]
                                          updatedFeatures[index] = { ...feature, text: e.target.value }
                                          setEditingService({ ...editingService, features: updatedFeatures })
                                        }}
                                        className="bg-gray-800 border-gray-600 text-white"
                                      />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeFeature(index, editingService)}
                                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    variant="outline"
                                    onClick={() => addFeature(editingService)}
                                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                                  >
                                    + Add Feature
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={editingService.popular}
                                    onCheckedChange={(checked) => setEditingService({ ...editingService, popular: checked })}
                                  />
                                  <label className="text-sm font-medium text-gray-300">Mark as Popular</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={editingService.isActive}
                                    onCheckedChange={(checked) => setEditingService({ ...editingService, isActive: checked })}
                                  />
                                  <label className="text-sm font-medium text-gray-300">Active</label>
                                </div>
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleEditService} className="bg-gradient-to-r from-purple-600 to-pink-600">
                                  <Save className="w-4 h-4 mr-2" />
                                  Update Service
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteService(service.id)}
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
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
    </div>
  )
}

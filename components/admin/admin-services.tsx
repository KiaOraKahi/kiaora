"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Edit,
  Trash2,
  X,
  DollarSign,
  Clock,
  Zap,
  MessageCircle,
  Video,
  Briefcase,
  Sparkles,
  Laugh,
  Gift,
  Eye,
  EyeOff,
} from "lucide-react"
import { toast } from "sonner"

interface ServiceFeature {
  id?: string
  text: string
  order: number
}

interface Service {
  id: string
  numericId: number
  title: string
  description: string
  shortDescription?: string
  fullDescription?: string
  icon: string
  color: string
  startingPrice: number
  asapPrice: number
  currency: string
  duration: string
  deliveryTime: string
  asapDeliveryTime: string
  isActive: boolean
  popular: boolean
  order: number
  features: ServiceFeature[]
  samples: any[]
  talents: any[]
  createdAt: string
  updatedAt: string
}

const iconOptions = [
  { value: "Zap", label: "Zap", icon: <Zap className="w-4 h-4" /> },
  { value: "MessageCircle", label: "Message Circle", icon: <MessageCircle className="w-4 h-4" /> },
  { value: "Video", label: "Video", icon: <Video className="w-4 h-4" /> },
  { value: "Briefcase", label: "Briefcase", icon: <Briefcase className="w-4 h-4" /> },
  { value: "Sparkles", label: "Sparkles", icon: <Sparkles className="w-4 h-4" /> },
  { value: "Laugh", label: "Laugh", icon: <Laugh className="w-4 h-4" /> },
  { value: "Gift", label: "Gift", icon: <Gift className="w-4 h-4" /> },
]

const colorOptions = [
  { value: "from-yellow-500 to-orange-500", label: "Yellow to Orange" },
  { value: "from-purple-500 to-pink-500", label: "Purple to Pink" },
  { value: "from-blue-500 to-cyan-500", label: "Blue to Cyan" },
  { value: "from-green-500 to-emerald-500", label: "Green to Emerald" },
  { value: "from-red-500 to-pink-500", label: "Red to Pink" },
  { value: "from-indigo-500 to-purple-500", label: "Indigo to Purple" },
]

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Service>>({})
  const [features, setFeatures] = useState<string[]>([])

  // Fetch services
  const fetchServices = async () => {
    try {
      const response = await fetch("/api/admin/services")
      if (!response.ok) throw new Error("Failed to fetch services")
      const data = await response.json()
      setServices(data.services || [])
    } catch (error) {
      console.error("Error fetching services:", error)
      toast.error("Failed to load services")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  // Handle create service
  const handleCreateService = async () => {
    try {
      const response = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          features,
          samples: [],
          talents: [],
        }),
      })

      if (!response.ok) throw new Error("Failed to create service")

      toast.success("Service created successfully!")
      setIsCreateModalOpen(false)
      resetForm()
      fetchServices()
    } catch (error) {
      console.error("Error creating service:", error)
      toast.error("Failed to create service")
    }
  }

  // Handle update service
  const handleUpdateService = async () => {
    if (!editingService) return

    try {
      const response = await fetch(`/api/admin/services/${editingService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          features,
        }),
      })

      if (!response.ok) throw new Error("Failed to update service")

      toast.success("Service updated successfully!")
      setIsEditModalOpen(false)
      setEditingService(null)
      resetForm()
      fetchServices()
    } catch (error) {
      console.error("Error updating service:", error)
      toast.error("Failed to update service")
    }
  }

  // Handle delete service
  const handleDeleteService = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete service")

      toast.success("Service deleted successfully!")
      fetchServices()
    } catch (error) {
      console.error("Error deleting service:", error)
      toast.error("Failed to delete service")
    }
  }

  // Handle toggle active status
  const handleToggleActive = async (service: Service) => {
    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...service,
          isActive: !service.isActive,
          features: service.features.map((f) => f.text),
        }),
      })

      if (!response.ok) throw new Error("Failed to update service")

      toast.success(`Service ${!service.isActive ? "activated" : "deactivated"}!`)
      fetchServices()
    } catch (error) {
      console.error("Error updating service:", error)
      toast.error("Failed to update service")
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({})
    setFeatures([])
    setEditingService(null)
  }

  // Open edit modal
  const openEditModal = (service: Service) => {
    setEditingService(service)
    setFormData(service)
    setFeatures(service.features.map((f) => f.text))
    setIsEditModalOpen(true)
  }

  // Add feature
  const addFeature = () => {
    setFeatures([...features, ""])
  }

  // Update feature
  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  // Remove feature
  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  // Get icon component
  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find((option) => option.value === iconName)
    return iconOption?.icon || <Sparkles className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Service Management</h2>
          <p className="text-yellow-200 mt-2">Manage your platform services and pricing</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-yellow-500 to-purple-500 text-black font-bold">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
              <DialogDescription className="text-yellow-200">Add a new service to your platform</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Service Title</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white/10 border-white/20"
                  />
                </div>
                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <Select
                    value={formData.icon || ""}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20">
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white/20">
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white">
                          <div className="flex items-center gap-2">
                            {option.icon}
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="color">Color Gradient</Label>
                <Select
                  value={formData.color || ""}
                  onValueChange={(value) => setFormData({ ...formData, color: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/20">
                    {colorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white/10 border-white/20"
                  rows={3}
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startingPrice">Starting Price ($)</Label>
                  <Input
                    id="startingPrice"
                    type="number"
                    value={formData.startingPrice || ""}
                    onChange={(e) => setFormData({ ...formData, startingPrice: Number.parseFloat(e.target.value) })}
                    className="bg-white/10 border-white/20"
                  />
                </div>
                <div>
                  <Label htmlFor="asapPrice">ASAP Price ($)</Label>
                  <Input
                    id="asapPrice"
                    type="number"
                    value={formData.asapPrice || ""}
                    onChange={(e) => setFormData({ ...formData, asapPrice: Number.parseFloat(e.target.value) })}
                    className="bg-white/10 border-white/20"
                  />
                </div>
              </div>

              {/* Timing */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration || ""}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="bg-white/10 border-white/20"
                    placeholder="e.g., 30-60 seconds"
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryTime">Delivery Time</Label>
                  <Input
                    id="deliveryTime"
                    value={formData.deliveryTime || ""}
                    onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                    className="bg-white/10 border-white/20"
                    placeholder="e.g., 3-7 days"
                  />
                </div>
                <div>
                  <Label htmlFor="asapDeliveryTime">ASAP Delivery</Label>
                  <Input
                    id="asapDeliveryTime"
                    value={formData.asapDeliveryTime || ""}
                    onChange={(e) => setFormData({ ...formData, asapDeliveryTime: e.target.value })}
                    className="bg-white/10 border-white/20"
                    placeholder="e.g., 24-48 hours"
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <Label>Service Features</Label>
                <div className="space-y-2 mt-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="bg-white/10 border-white/20"
                        placeholder="Enter feature description"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeFeature(index)}
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFeature}
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
              </div>

              {/* Settings */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="popular"
                    checked={formData.popular || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
                  />
                  <Label htmlFor="popular">Mark as Popular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive !== false}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateService}
                className="bg-gradient-to-r from-yellow-500 to-purple-500 text-black"
              >
                Create Service
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Grid */}
      <div className="grid gap-6">
        <AnimatePresence>
          {services.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="group"
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center`}
                      >
                        {getIconComponent(service.icon)}
                      </div>
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          {service.title}
                          {service.popular && (
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs">
                              Popular
                            </Badge>
                          )}
                          {!service.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-yellow-200 text-sm">
                          Starting at ${service.startingPrice} • {service.deliveryTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(service)}
                        className="text-white hover:bg-white/10"
                      >
                        {service.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(service)}
                        className="text-white hover:bg-white/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/20">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-black border-white/20">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete Service</AlertDialogTitle>
                            <AlertDialogDescription className="text-yellow-200">
                              Are you sure you want to delete "{service.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteService(service.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-yellow-200 mb-4">{service.description}</p>
                      <div className="space-y-2">
                        <h4 className="text-white font-semibold">Features:</h4>
                        <ul className="space-y-1">
                          {service.features.map((feature, index) => (
                            <li key={index} className="text-yellow-200 text-sm flex items-center gap-2">
                              <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                              {feature.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-yellow-300 text-sm mb-1">
                            <DollarSign className="w-4 h-4" />
                            Starting Price
                          </div>
                          <div className="text-white font-semibold">${service.startingPrice}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-orange-300 text-sm mb-1">
                            <Zap className="w-4 h-4" />
                            ASAP Price
                          </div>
                          <div className="text-white font-semibold">${service.asapPrice}</div>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-yellow-300 text-sm mb-1">
                          <Clock className="w-4 h-4" />
                          Delivery Time
                        </div>
                        <div className="text-white text-sm">
                          Standard: {service.deliveryTime} • ASAP: {service.asapDeliveryTime}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-black border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription className="text-yellow-200">Update service information and settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Same form fields as create modal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Service Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white/10 border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="edit-icon">Icon</Label>
                <Select
                  value={formData.icon || ""}
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20">
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/20">
                    {iconOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white">
                        <div className="flex items-center gap-2">
                          {option.icon}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-color">Color Gradient</Label>
              <Select
                value={formData.color || ""}
                onValueChange={(value) => setFormData({ ...formData, color: value })}
              >
                <SelectTrigger className="bg-white/10 border-white/20">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/20">
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white/10 border-white/20"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-startingPrice">Starting Price ($)</Label>
                <Input
                  id="edit-startingPrice"
                  type="number"
                  value={formData.startingPrice || ""}
                  onChange={(e) => setFormData({ ...formData, startingPrice: Number.parseFloat(e.target.value) })}
                  className="bg-white/10 border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="edit-asapPrice">ASAP Price ($)</Label>
                <Input
                  id="edit-asapPrice"
                  type="number"
                  value={formData.asapPrice || ""}
                  onChange={(e) => setFormData({ ...formData, asapPrice: Number.parseFloat(e.target.value) })}
                  className="bg-white/10 border-white/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-duration">Duration</Label>
                <Input
                  id="edit-duration"
                  value={formData.duration || ""}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="bg-white/10 border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="edit-deliveryTime">Delivery Time</Label>
                <Input
                  id="edit-deliveryTime"
                  value={formData.deliveryTime || ""}
                  onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                  className="bg-white/10 border-white/20"
                />
              </div>
              <div>
                <Label htmlFor="edit-asapDeliveryTime">ASAP Delivery</Label>
                <Input
                  id="edit-asapDeliveryTime"
                  value={formData.asapDeliveryTime || ""}
                  onChange={(e) => setFormData({ ...formData, asapDeliveryTime: e.target.value })}
                  className="bg-white/10 border-white/20"
                />
              </div>
            </div>

            {/* Features */}
            <div>
              <Label>Service Features</Label>
              <div className="space-y-2 mt-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="bg-white/10 border-white/20"
                      placeholder="Enter feature description"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeFeature(index)}
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFeature}
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-popular"
                  checked={formData.popular || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
                />
                <Label htmlFor="edit-popular">Mark as Popular</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive !== false}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateService} className="bg-gradient-to-r from-yellow-500 to-purple-500 text-black">
              Update Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {services.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-yellow-200 mb-4">No services found</div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-yellow-500 to-purple-500 text-black font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Service
          </Button>
        </div>
      )}
    </div>
  )
}
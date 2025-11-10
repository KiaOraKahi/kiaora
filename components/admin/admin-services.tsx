"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Save,
  Briefcase,
  MessageCircle,
  Video,
  Zap,
  Laugh,
  Gift,
  Sparkles,
  DollarSign,
  Clock,
  Timer,
  Star,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import ServiceForm from "@/components/admin/ServiceForm"

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
  order: number
  features: ServiceFeature[]
  createdAt: string
  updatedAt: string
}

interface ServiceFeature {
  id: string
  text: string
  order: number
}

interface ServiceFormData {
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
  features: string[]
}

interface LoadingStates {
  creating: boolean
  updating: boolean
  deleting: string | null
  toggling: string | null
}

const iconOptions = [
  { value: "Briefcase", label: "Briefcase", icon: <Briefcase className="w-4 h-4" /> },
  { value: "MessageCircle", label: "Message Circle", icon: <MessageCircle className="w-4 h-4" /> },
  { value: "Video", label: "Video", icon: <Video className="w-4 h-4" /> },
  { value: "Zap", label: "Zap", icon: <Zap className="w-4 h-4" /> },
  { value: "Laugh", label: "Laugh", icon: <Laugh className="w-4 h-4" /> },
  { value: "Gift", label: "Gift", icon: <Gift className="w-4 h-4" /> },
  { value: "Sparkles", label: "Sparkles", icon: <Sparkles className="w-4 h-4" /> },
]

const colorOptions = [
  { value: "from-purple-500 to-pink-500", label: "Purple to Pink" },
  { value: "from-blue-500 to-cyan-500", label: "Blue to Cyan" },
  { value: "from-green-500 to-emerald-500", label: "Green to Emerald" },
  { value: "from-yellow-500 to-orange-500", label: "Yellow to Orange" },
  { value: "from-red-500 to-pink-500", label: "Red to Pink" },
  { value: "from-indigo-500 to-purple-500", label: "Indigo to Purple" },
]

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "Briefcase":
      return <Briefcase className="w-8 h-8" />
    case "MessageCircle":
      return <MessageCircle className="w-8 h-8" />
    case "Video":
      return <Video className="w-8 h-8" />
    case "Zap":
      return <Zap className="w-8 h-8" />
    case "Laugh":
      return <Laugh className="w-8 h-8" />
    case "Gift":
      return <Gift className="w-8 h-8" />
    case "Sparkles":
      return <Sparkles className="w-8 h-8" />
    default:
      return <Briefcase className="w-8 h-8" />
  }
}

export function AdminServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    creating: false,
    updating: false,
    deleting: null,
    toggling: null,
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>({
    title: "",
    shortDescription: "",
    fullDescription: "",
    icon: "Briefcase",
    color: "from-purple-500 to-pink-500",
    startingPrice: 249,
    asapPrice: 349,
    duration: "30-60 seconds",
    deliveryTime: "3-7 days",
    asapDeliveryTime: "24-48 hours",
    popular: false,
    isActive: true,
    features: [""],
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      console.log("Fetching services from admin API...")

      const response = await fetch("/api/admin/services")
      console.log("Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Received data:", data)
        console.log("Services array:", data.services)

        setServices(data.services || [])

        if (data.services && data.services.length > 0) {
          console.log(`Successfully loaded ${data.services.length} services`)
        } else {
          console.log("No services found in response")
        }
      } else {
        const errorData = await response.json()
        console.error("API Error:", errorData)
        toast.error(`Failed to fetch services: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error fetching services:", error)
      toast.error("Error loading services")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      shortDescription: "",
      fullDescription: "",
      icon: "Briefcase",
      color: "from-purple-500 to-pink-500",
      startingPrice: 249,
      asapPrice: 349,
      duration: "30-60 seconds",
      deliveryTime: "3-7 days",
      asapDeliveryTime: "24-48 hours",
      popular: false,
      isActive: true,
      features: [""],
    })
  }

  const handleCreateService = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, creating: true }))
      
      const response = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          features: formData.features.filter((f) => f.trim() !== ""),
        }),
      })

      if (response.ok) {
        toast.success("Service created successfully!")
        setShowCreateModal(false)
        resetForm()
        fetchServices()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to create service")
      }
    } catch (error) {
      console.error("Error creating service:", error)
      toast.error("Error creating service")
    } finally {
      setLoadingStates(prev => ({ ...prev, creating: false }))
    }
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setFormData({
      title: service.title,
      shortDescription: service.shortDescription,
      fullDescription: service.fullDescription,
      icon: service.icon,
      color: service.color,
      startingPrice: service.startingPrice,
      asapPrice: service.asapPrice,
      duration: service.duration,
      deliveryTime: service.deliveryTime,
      asapDeliveryTime: service.asapDeliveryTime,
      popular: service.popular,
      isActive: service.isActive,
      features: service.features.map((f) => f.text),
    })
  }

  const handleUpdateService = async () => {
    if (!editingService) return

    try {
      setLoadingStates(prev => ({ ...prev, updating: true }))
      
      const response = await fetch(`/api/admin/services/${editingService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          features: formData.features.filter((f) => f.trim() !== ""),
        }),
      })

      if (response.ok) {
        toast.success("Service updated successfully!")
        setEditingService(null)
        resetForm()
        fetchServices()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to update service")
      }
    } catch (error) {
      console.error("Error updating service:", error)
      toast.error("Error updating service")
    } finally {
      setLoadingStates(prev => ({ ...prev, updating: false }))
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, deleting: serviceId }))
      
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Service deleted successfully!")
        fetchServices()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to delete service")
      }
    } catch (error) {
      console.error("Error deleting service:", error)
      toast.error("Error deleting service")
    } finally {
      setLoadingStates(prev => ({ ...prev, deleting: null }))
    }
  }

  const toggleServiceStatus = async (serviceId: string, isActive: boolean) => {
    try {
      setLoadingStates(prev => ({ ...prev, toggling: serviceId }))
      
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        toast.success(`Service ${isActive ? "activated" : "deactivated"}!`)
        fetchServices()
      } else {
        toast.error("Failed to update service status")
      }
    } catch (error) {
      console.error("Error updating service status:", error)
      toast.error("Error updating service status")
    } finally {
      setLoadingStates(prev => ({ ...prev, toggling: null }))
    }
  }

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }))
  }

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const updateFeature = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }))
  }

  // const ServiceForm = () => (
  //   <div className="space-y-6 max-h-[70vh] text-gray-400 overflow-y-auto">
  //     <div className="grid grid-cols-2 gap-4">
  //       <div>
  //         <Label htmlFor="title">Service Title</Label>
  //         <Input
  //           id="title"
  //           value={formData.title}
  //           onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
  //           placeholder="e.g., Quick Shout-outs"
  //         />
  //       </div>
  //       <div>
  //         <Label htmlFor="icon">Icon</Label>
  //         <Select value={formData.icon} onValueChange={(value) => setFormData((prev) => ({ ...prev, icon: value }))}>
  //           <SelectTrigger>
  //             <SelectValue />
  //           </SelectTrigger>
  //           <SelectContent>
  //             {iconOptions.map((option) => (
  //               <SelectItem key={option.value} value={option.value}>
  //                 <div className="flex items-center gap-2">
  //                   {option.icon}
  //                   {option.label}
  //                 </div>
  //               </SelectItem>
  //             ))}
  //           </SelectContent>
  //         </Select>
  //       </div>
  //     </div>

  //     <div>
  //       <Label htmlFor="color">Color Gradient</Label>
  //       <Select value={formData.color} onValueChange={(value) => setFormData((prev) => ({ ...prev, color: value }))}>
  //         <SelectTrigger>
  //           <SelectValue />
  //         </SelectTrigger>
  //         <SelectContent>
  //           {colorOptions.map((option) => (
  //             <SelectItem key={option.value} value={option.value}>
  //               <div className="flex items-center gap-2">
  //                 <div className={`w-4 h-4 rounded bg-gradient-to-r ${option.value}`} />
  //                 {option.label}
  //               </div>
  //             </SelectItem>
  //           ))}
  //         </SelectContent>
  //       </Select>
  //     </div>

  //     <div>
  //       <Label htmlFor="shortDescription">Short Description</Label>
  //       <Textarea
  //         id="shortDescription"
  //         value={formData.shortDescription}
  //         onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
  //         placeholder="Brief description for cards..."
  //         rows={2}
  //       />
  //     </div>

  //     <div>
  //       <Label htmlFor="fullDescription">Full Description</Label>
  //       <Textarea
  //         id="fullDescription"
  //         value={formData.fullDescription}
  //         onChange={(e) => setFormData((prev) => ({ ...prev, fullDescription: e.target.value }))}
  //         placeholder="Detailed description for service page..."
  //         rows={3}
  //       />
  //     </div>

  //     <div className="grid grid-cols-2 gap-4">
  //       <div>
  //         <Label htmlFor="startingPrice">Starting Price ($)</Label>
  //         <Input
  //           id="startingPrice"
  //           type="number"
  //           value={formData.startingPrice}
  //           onChange={(e) => setFormData((prev) => ({ ...prev, startingPrice: Number(e.target.value) }))}
  //         />
  //       </div>
  //       <div>
  //         <Label htmlFor="asapPrice">ASAP Price ($)</Label>
  //         <Input
  //           id="asapPrice"
  //           type="number"
  //           value={formData.asapPrice}
  //           onChange={(e) => setFormData((prev) => ({ ...prev, asapPrice: Number(e.target.value) }))}
  //         />
  //       </div>
  //     </div>

  //     <div className="grid grid-cols-3 gap-4">
  //       <div>
  //         <Label htmlFor="duration">Duration</Label>
  //         <Input
  //           id="duration"
  //           value={formData.duration}
  //           onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
  //           placeholder="30-60 seconds"
  //         />
  //       </div>
  //       <div>
  //         <Label htmlFor="deliveryTime">Delivery Time</Label>
  //         <Input
  //           id="deliveryTime"
  //           value={formData.deliveryTime}
  //           onChange={(e) => setFormData((prev) => ({ ...prev, deliveryTime: e.target.value }))}
  //           placeholder="3-7 days"
  //         />
  //       </div>
  //       <div>
  //         <Label htmlFor="asapDeliveryTime">ASAP Delivery</Label>
  //         <Input
  //           id="asapDeliveryTime"
  //           value={formData.asapDeliveryTime}
  //           onChange={(e) => setFormData((prev) => ({ ...prev, asapDeliveryTime: e.target.value }))}
  //           placeholder="24-48 hours"
  //         />
  //       </div>
  //     </div>

  //     <div>
  //       <Label>Features</Label>
  //       <div className="space-y-2">
  //         {formData.features.map((feature, index) => (
  //           <div key={index} className="flex items-center gap-2">
  //             <Input
  //               value={feature}
  //               onChange={(e) => updateFeature(index, e.target.value)}
  //               placeholder="Enter feature..."
  //             />
  //             <Button
  //               type="button"
  //               variant="outline"
  //               size="sm"
  //               onClick={() => removeFeature(index)}
  //               disabled={formData.features.length === 1}
  //             >
  //               <X className="w-4 h-4" />
  //             </Button>
  //           </div>
  //         ))}
  //         <Button type="button" variant="outline" size="sm" onClick={addFeature}>
  //           <Plus className="w-4 h-4 mr-2" />
  //           Add Feature
  //         </Button>
  //       </div>
  //     </div>

  //     <div className="flex items-center justify-between">
  //       <div className="flex items-center space-x-2">
  //         <Switch
  //           id="popular"
  //           checked={formData.popular}
  //           onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, popular: checked }))}
  //         />
  //         <Label htmlFor="popular">Mark as Popular</Label>
  //       </div>
  //       <div className="flex items-center space-x-2">
  //         <Switch
  //           id="isActive"
  //           checked={formData.isActive}
  //           onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
  //         />
  //         <Label htmlFor="isActive">Active</Label>
  //       </div>
  //     </div>
  //   </div>
  // )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Service Management</h1>
          <p className="text-gray-400">Manage your platform services and offerings</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-black border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Service</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add a new service to your platform offerings.
              </DialogDescription>
            </DialogHeader>
            <ServiceForm
              formData={formData}
              setFormData={setFormData}
              iconOptions={iconOptions}
              colorOptions={colorOptions}
            />
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateModal(false)}
                disabled={loadingStates.creating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateService} 
                className="bg-gradient-to-r from-purple-500 to-pink-500"
                disabled={loadingStates.creating}
              >
                {loadingStates.creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Service
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {services.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              layout
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center`}
                      >
                        <div className="text-white">{getIconComponent(service.icon)}</div>
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{service.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {service.popular && (
                            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                              <Star className="w-3 h-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                          <Badge
                            className={
                              service.isActive
                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                : "bg-red-500/20 text-red-300 border-red-500/30"
                            }
                          >
                            {service.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleServiceStatus(service.id, !service.isActive)}
                      className="text-gray-400 hover:text-white"
                      disabled={loadingStates.toggling === service.id}
                    >
                      {loadingStates.toggling === service.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : service.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300 text-sm">{service.shortDescription}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Starting:
                      </span>
                      <span className="text-white font-semibold">${service.startingPrice}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        ASAP:
                      </span>
                      <span className="text-orange-300 font-semibold">${service.asapPrice}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Duration:
                      </span>
                      <span className="text-white">{service.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        Delivery:
                      </span>
                      <span className="text-white">{service.deliveryTime}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold text-sm mb-2">Features ({service.features.length})</h4>
                    <div className="space-y-1">
                      {service.features.slice(0, 3).map((feature) => (
                        <div key={feature.id} className="text-xs text-gray-400 flex items-center gap-1">
                          <div className="w-1 h-1 bg-purple-400 rounded-full" />
                          {feature.text}
                        </div>
                      ))}
                      {service.features.length > 3 && (
                        <div className="text-xs text-gray-500">+{service.features.length - 3} more...</div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Dialog
                      open={editingService?.id === service.id}
                      onOpenChange={(open) => !open && setEditingService(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                          onClick={() => handleEditService(service)}
                          disabled={loadingStates.updating || loadingStates.deleting === service.id}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-black border-purple-500/30">
                        <DialogHeader>
                          <DialogTitle className="text-white">Edit Service</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Update the service details and settings.
                          </DialogDescription>
                        </DialogHeader>
                        <ServiceForm
                          formData={formData}
                          setFormData={setFormData}
                          iconOptions={iconOptions}
                          colorOptions={colorOptions}
                        />
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setEditingService(null)}
                            disabled={loadingStates.updating}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUpdateService}
                            className="bg-gradient-to-r from-purple-500 to-pink-500"
                            disabled={loadingStates.updating}
                          >
                            {loadingStates.updating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Update Service
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
                          disabled={loadingStates.deleting === service.id || loadingStates.updating}
                        >
                          {loadingStates.deleting === service.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-black border-red-500/30">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Delete Service</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete "{service.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel 
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            disabled={loadingStates.deleting === service.id}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteService(service.id)}
                            className="bg-red-500 hover:bg-red-600"
                            disabled={loadingStates.deleting === service.id}
                          >
                            {loadingStates.deleting === service.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              "Delete Service"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {services.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Services Found</h3>
          <p className="text-gray-400 mb-4">Get started by creating your first service.</p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Service
          </Button>
        </div>
      )}
    </div>
  )
}
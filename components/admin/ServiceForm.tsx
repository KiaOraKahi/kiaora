"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface IconOption {
  value: string
  label: string
  icon: React.ReactNode
}

interface ColorOption {
  value: string
  label: string
}

interface ServiceFormProps {
  formData: ServiceFormData
  setFormData: React.Dispatch<React.SetStateAction<ServiceFormData>>
  iconOptions: IconOption[]
  colorOptions: ColorOption[]
}

export default function ServiceForm({
  formData,
  setFormData,
  iconOptions,
  colorOptions,
}: ServiceFormProps) {
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

  return (
    <div className="space-y-6 max-h-[70vh] text-gray-400 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Service Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Quick Shout-outs"
          />
        </div>
        <div>
          <Label htmlFor="icon">Icon</Label>
          <Select value={formData.icon} onValueChange={(value) => setFormData((prev) => ({ ...prev, icon: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {iconOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
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
        <Select value={formData.color} onValueChange={(value) => setFormData((prev) => ({ ...prev, color: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {colorOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded bg-gradient-to-r ${option.value}`} />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="shortDescription">Short Description</Label>
        <Textarea
          id="shortDescription"
          value={formData.shortDescription}
          onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
          placeholder="Brief description for cards..."
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="fullDescription">Full Description</Label>
        <Textarea
          id="fullDescription"
          value={formData.fullDescription}
          onChange={(e) => setFormData((prev) => ({ ...prev, fullDescription: e.target.value }))}
          placeholder="Detailed description for service page..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startingPrice">Starting Price ($)</Label>
          <Input
            id="startingPrice"
            type="number"
            value={formData.startingPrice}
            onChange={(e) => setFormData((prev) => ({ ...prev, startingPrice: Number(e.target.value) }))}
          />
        </div>
        <div>
          <Label htmlFor="asapPrice">ASAP Price ($)</Label>
          <Input
            id="asapPrice"
            type="number"
            value={formData.asapPrice}
            onChange={(e) => setFormData((prev) => ({ ...prev, asapPrice: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="deliveryTime">Delivery Time</Label>
          <Input
            id="deliveryTime"
            value={formData.deliveryTime}
            onChange={(e) => setFormData((prev) => ({ ...prev, deliveryTime: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="asapDeliveryTime">ASAP Delivery</Label>
          <Input
            id="asapDeliveryTime"
            value={formData.asapDeliveryTime}
            onChange={(e) => setFormData((prev) => ({ ...prev, asapDeliveryTime: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label>Features</Label>
        <div className="space-y-2">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder="Enter feature..."
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeFeature(index)}
                disabled={formData.features.length === 1}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addFeature}>
            <Plus className="w-4 h-4 mr-2" />
            Add Feature
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="popular"
            checked={formData.popular}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, popular: checked }))}
          />
          <Label htmlFor="popular">Mark as Popular</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </div>
    </div>
  )
}

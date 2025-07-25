"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Edit3, Save, Plus, Trash2, Search, RefreshCw, FileText, ImageIcon, Hash, ToggleLeft } from "lucide-react"
import { toast } from "sonner"

interface SiteContent {
  id: string
  key: string
  value: string
  type: "TEXT" | "HTML" | "JSON" | "IMAGE" | "NUMBER" | "BOOLEAN"
  category: string
  description?: string
  isActive: boolean
  updatedBy?: string
  createdAt: string
  updatedAt: string
}

const contentCategories = [
  "homepage",
  "about",
  "how-it-works",
  "faq",
  "pricing",
  "footer",
  "navigation",
  "ui-labels",
  "emails",
  "other",
]

const contentTypes = [
  { value: "TEXT", label: "Text", icon: FileText },
  { value: "HTML", label: "HTML", icon: FileText },
  { value: "JSON", label: "JSON", icon: FileText },
  { value: "IMAGE", label: "Image", icon: ImageIcon },
  { value: "NUMBER", label: "Number", icon: Hash },
  { value: "BOOLEAN", label: "Boolean", icon: ToggleLeft },
]

export function AdminContentManagement() {
  const [content, setContent] = useState<SiteContent[]>([])
  const [filteredContent, setFilteredContent] = useState<SiteContent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [editingItem, setEditingItem] = useState<SiteContent | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)

  const [newContent, setNewContent] = useState({
    key: "",
    value: "",
    type: "TEXT" as const,
    category: "homepage",
    description: "",
    isActive: true,
  })

  useEffect(() => {
    fetchContent()
  }, [])

  useEffect(() => {
    filterContent()
  }, [content, searchTerm, selectedCategory, selectedType])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/content")
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch content",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching content:", error)
      toast({
        title: "Error",
        description: "Failed to fetch content",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterContent = () => {
    let filtered = content

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((item) => item.type === selectedType)
    }

    setFilteredContent(filtered)
  }

  const handleSave = async (item: SiteContent) => {
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/content/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: item.key,
          value: item.value,
          type: item.type,
          category: item.category,
          description: item.description,
          isActive: item.isActive,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Content updated successfully",
        })
        setEditingItem(null)
        fetchContent()
      } else {
        toast({
          title: "Error",
          description: "Failed to update content",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating content:", error)
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = async () => {
    try {
      setSaving(true)
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContent),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Content created successfully",
        })
        setIsCreating(false)
        setNewContent({
          key: "",
          value: "",
          type: "TEXT",
          category: "homepage",
          description: "",
          isActive: true,
        })
        fetchContent()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create content",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating content:", error)
      toast({
        title: "Error",
        description: "Failed to create content",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return

    try {
      const response = await fetch(`/api/admin/content/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Content deleted successfully",
        })
        fetchContent()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete content",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting content:", error)
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      })
    }
  }

  const getTypeIcon = (type: string) => {
    const typeConfig = contentTypes.find((t) => t.value === type)
    return typeConfig ? typeConfig.icon : FileText
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
        <span className="ml-2 text-white">Loading content...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Management</h1>
          <p className="text-gray-400 mt-1">Manage site content and text</p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Content
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {contentCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content List */}
      <div className="grid gap-4">
        {filteredContent.map((item) => {
          const TypeIcon = getTypeIcon(item.type)
          const isEditing = editingItem?.id === item.id

          return (
            <Card key={item.id} className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Key</Label>
                        <Input
                          value={editingItem.key}
                          onChange={(e) => setEditingItem({ ...editingItem, key: e.target.value })}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Category</Label>
                        <Select
                          value={editingItem.category}
                          onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {contentCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-white">Description</Label>
                      <Input
                        value={editingItem.description || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        className="bg-gray-800 border-gray-600 text-white"
                        placeholder="Optional description"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Content</Label>
                      <Textarea
                        value={editingItem.value}
                        onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                        className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                        rows={4}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingItem.isActive}
                        onCheckedChange={(checked) => setEditingItem({ ...editingItem, isActive: checked })}
                      />
                      <Label className="text-white">Active</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSave(editingItem)}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        onClick={() => setEditingItem(null)}
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <TypeIcon className="w-4 h-4 text-purple-400" />
                        <code className="text-purple-300 bg-purple-900/20 px-2 py-1 rounded text-sm">{item.key}</code>
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          {item.category}
                        </Badge>
                        <Badge variant={item.isActive ? "default" : "secondary"}>
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {item.description && <p className="text-gray-400 text-sm mb-2">{item.description}</p>}
                      <div className="bg-gray-800 p-3 rounded border border-gray-700">
                        <p className="text-white text-sm font-mono">
                          {item.value.length > 200 ? `${item.value.substring(0, 200)}...` : item.value}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Updated: {new Date(item.updatedAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => setEditingItem(item)}
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:text-white"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(item.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No content found</h3>
          <p className="text-gray-400">Try adjusting your filters or create new content.</p>
        </div>
      )}

      {/* Create Content Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-gray-900 border-gray-700 w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-white">Create New Content</CardTitle>
              <CardDescription className="text-gray-400">Add new editable content to your site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Key *</Label>
                  <Input
                    value={newContent.key}
                    onChange={(e) => setNewContent({ ...newContent, key: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="e.g., homepage.hero.title"
                  />
                </div>
                <div>
                  <Label className="text-white">Category *</Label>
                  <Select
                    value={newContent.category}
                    onValueChange={(value) => setNewContent({ ...newContent, category: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-white">Type *</Label>
                <Select
                  value={newContent.type}
                  onValueChange={(value: any) => setNewContent({ ...newContent, type: value })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Description</Label>
                <Input
                  value={newContent.description}
                  onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Optional description for admins"
                />
              </div>
              <div>
                <Label className="text-white">Content *</Label>
                <Textarea
                  value={newContent.value}
                  onChange={(e) => setNewContent({ ...newContent, value: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                  rows={4}
                  placeholder="Enter the content..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newContent.isActive}
                  onCheckedChange={(checked) => setNewContent({ ...newContent, isActive: checked })}
                />
                <Label className="text-white">Active</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreate}
                  disabled={saving || !newContent.key || !newContent.value}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {saving ? "Creating..." : "Create Content"}
                </Button>
                <Button
                  onClick={() => setIsCreating(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
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
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Save, 
  X,
  Calendar,
  Tag,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"

interface ContentItem {
  id: string
  key: string
  value: string
  category: string
  type: string
  status: "active" | "inactive"
  updatedAt: string
  description?: string
}

const categories = [
  "All Categories",
  "Homepage",
  "About",
  "How it-works",
  "FAQ",
  "Pricing",
  "Footer",
  "Navigation",
  "UI Labels",
  "Emails"
]

const contentTypes = [
  "All Types",
  "TEXT",
  "HTML",
  "JSON",
  "IMAGE",
  "NUMBER",
  "BOOLEAN"
]



export default function AdminContentManagement() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedType, setSelectedType] = useState("All Types")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newContent, setNewContent] = useState({
    key: "",
    value: "",
    category: "",
    type: "",
    description: ""
  })

  // Fetch content on component mount
  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/content")
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      } else {
        toast.error("Failed to fetch content")
      }
    } catch (error) {
      console.error("Error fetching content:", error)
      toast.error("Failed to fetch content")
    } finally {
      setLoading(false)
    }
  }

  // Filter content based on search and filters
  useEffect(() => {
    let filtered = content

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // Filter by type
    if (selectedType !== "All Types") {
      filtered = filtered.filter(item => item.type === selectedType)
    }

    setFilteredContent(filtered)
  }, [content, searchTerm, selectedCategory, selectedType])

  const handleAddContent = async () => {
    if (!newContent.key || !newContent.value || !newContent.category || !newContent.type) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContent),
      })

      if (response.ok) {
        const createdContent = await response.json()
        setContent([createdContent, ...content])
        setNewContent({ key: "", value: "", category: "", type: "", description: "" })
        setIsAddDialogOpen(false)
        toast.success("Content added successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to add content")
      }
    } catch (error) {
      console.error("Error adding content:", error)
      toast.error("Failed to add content")
    }
  }

  const handleEditContent = async () => {
    if (!editingContent) return

    try {
      const response = await fetch(`/api/admin/content/${editingContent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingContent),
      })

      if (response.ok) {
        const updatedContent = await response.json()
        setContent(content.map(item => 
          item.id === editingContent.id ? updatedContent : item
        ))
        setEditingContent(null)
        setIsEditDialogOpen(false)
        toast.success("Content updated successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update content")
      }
    } catch (error) {
      console.error("Error updating content:", error)
      toast.error("Failed to update content")
    }
  }

  const handleDeleteContent = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/content/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setContent(content.filter(item => item.id !== id))
        toast.success("Content deleted successfully")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to delete content")
      }
    } catch (error) {
      console.error("Error deleting content:", error)
      toast.error("Failed to delete content")
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-500" : "bg-gray-500"
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Homepage": "bg-purple-500",
      "About": "bg-blue-500",
      "FAQ": "bg-orange-500",
      "Pricing": "bg-green-500",
      "Footer": "bg-gray-500",
      "Navigation": "bg-indigo-500",
      "UI Labels": "bg-pink-500",
      "Emails": "bg-yellow-500"
    }
    return colors[category] || "bg-gray-500"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Content Management</h2>
          <p className="text-sm sm:text-base text-gray-400">Manage site content and text</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              <span className="sm:inline">Add Content</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Add New Content</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Content Key</label>
                <Input
                  value={newContent.key}
                  onChange={(e) => setNewContent({ ...newContent, key: e.target.value })}
                  placeholder="e.g., homepage.hero.title"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Content Value</label>
                <Textarea
                  value={newContent.value}
                  onChange={(e) => setNewContent({ ...newContent, value: e.target.value })}
                  placeholder="Enter the content text"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Category</label>
                  <Select value={newContent.category} onValueChange={(value) => setNewContent({ ...newContent, category: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {categories.slice(1).map((category) => (
                        <SelectItem key={category} value={category} className="text-white hover:bg-gray-700">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Type</label>
                  <Select value={newContent.type} onValueChange={(value) => setNewContent({ ...newContent, type: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {contentTypes.slice(1).map((type) => (
                        <SelectItem key={type} value={type} className="text-white hover:bg-gray-700">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Description (Optional)</label>
                <Input
                  value={newContent.description}
                  onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                  placeholder="Brief description of this content"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleAddContent} className="bg-gradient-to-r from-purple-600 to-pink-600 w-full sm:w-auto">
                  Add Content
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search content..."
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="text-white hover:bg-gray-700">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {contentTypes.map((type) => (
                  <SelectItem key={type} value={type} className="text-white hover:bg-gray-700">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading content...</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredContent.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-gray-900/50 border-gray-700 hover:border-gray-600 transition-colors">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs sm:text-sm">
                          {item.key}
                        </Badge>
                        <Badge className={`${getCategoryColor(item.category)} text-white text-xs sm:text-sm`}>
                          {item.category}
                        </Badge>
                        <Badge className={`${getStatusColor(item.status)} text-white text-xs sm:text-sm`}>
                          {item.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-white text-base sm:text-lg mb-2 break-words">{item.value}</div>
                      {item.description && (
                        <p className="text-gray-400 text-sm mb-3 break-words">{item.description}</p>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-500 text-xs sm:text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">Updated: {new Date(item.updatedAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3 flex-shrink-0" />
                          <span>{item.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:ml-4 justify-end sm:justify-start">
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingContent(item)
                              setIsEditDialogOpen(true)
                            }}
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-gray-700 text-white">
                          <DialogHeader>
                            <DialogTitle>Edit Content</DialogTitle>
                          </DialogHeader>
                          {editingContent && (
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium text-gray-300">Content Key</label>
                                <Input
                                  value={editingContent.key}
                                  onChange={(e) => setEditingContent({ ...editingContent, key: e.target.value })}
                                  className="bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-300">Content Value</label>
                                <Textarea
                                  value={editingContent.value}
                                  onChange={(e) => setEditingContent({ ...editingContent, value: e.target.value })}
                                  className="bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-300">Description</label>
                                <Input
                                  value={editingContent.description || ""}
                                  onChange={(e) => setEditingContent({ ...editingContent, description: e.target.value })}
                                  className="bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
                                  Cancel
                                </Button>
                                <Button onClick={handleEditContent} className="bg-gradient-to-r from-purple-600 to-pink-600 w-full sm:w-auto">
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteContent(item.id)}
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        )}

        {!loading && filteredContent.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No content found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
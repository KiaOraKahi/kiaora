"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Play,
  Search,
  Eye,
  Trash2,
  Star,
  MessageSquare,
  Video,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

interface VideoContent {
  id: string
  orderNumber: string
  celebrityName: string
  customerName: string
  videoUrl: string
  fileSize: number
  duration?: number
  createdAt: string
  status: "ACTIVE" | "FLAGGED" | "REMOVED"
}

interface Review {
  id: string
  customerName: string
  celebrityName: string
  rating: number
  comment: string
  orderNumber: string
  createdAt: string
  status: "APPROVED" | "PENDING" | "FLAGGED" | "REMOVED"
}

export function AdminContent() {
  const [videos, setVideos] = useState<VideoContent[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("videos")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchContentData()
  }, [activeTab, searchTerm, statusFilter])

  const fetchContentData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter !== "all") params.append("status", statusFilter)

      if (activeTab === "videos") {
        const response = await fetch(`/api/admin/videos?${params}`)
        if (response.ok) {
          const data = await response.json()
          setVideos(data.videos)
        }
      } else {
        const response = await fetch(`/api/admin/reviews?${params}`)
        if (response.ok) {
          const data = await response.json()
          setReviews(data.reviews)
        }
      }
    } catch (error) {
      toast.error("Error fetching content data")
    } finally {
      setLoading(false)
    }
  }

  const handleContentAction = async (contentId: string, action: string, type: "video" | "review") => {
    setUpdating(true)
    try {
      const endpoint = type === "video" ? "videos" : "reviews"
      const response = await fetch(`/api/admin/${endpoint}/${contentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        toast.success(`${type} ${action} successfully`)
        fetchContentData()
      } else {
        toast.error(`Failed to ${action} ${type}`)
      }
    } catch (error) {
      toast.error(`Error updating ${type}`)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: "bg-green-500", text: "Active", icon: CheckCircle },
      APPROVED: { color: "bg-green-500", text: "Approved", icon: CheckCircle },
      PENDING: { color: "bg-yellow-500", text: "Pending", icon: AlertTriangle },
      FLAGGED: { color: "bg-red-500", text: "Flagged", icon: AlertTriangle },
      REMOVED: { color: "bg-gray-500", text: "Removed", icon: XCircle },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-500",
      text: status,
      icon: AlertTriangle,
    }
    const Icon = config.icon
    return (
      <Badge className={`${config.color} text-white hover:${config.color}/80 flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    )
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-400"}`} />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Content Management
        </h1>
        <p className="text-gray-400">Manage videos, reviews, and content moderation.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Total Videos", value: videos.length, icon: Video, color: "from-blue-500 to-cyan-500" },
          {
            title: "Active Videos",
            value: videos.filter((v) => v.status === "ACTIVE").length,
            icon: CheckCircle,
            color: "from-green-500 to-emerald-500",
          },
          { title: "Total Reviews", value: reviews.length, icon: MessageSquare, color: "from-purple-500 to-pink-500" },
          {
            title: "Flagged Content",
            value: [...videos.filter((v) => v.status === "FLAGGED"), ...reviews.filter((r) => r.status === "FLAGGED")]
              .length,
            icon: AlertTriangle,
            color: "from-red-500 to-pink-500",
          },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-lg p-1">
        {[
          { id: "videos", label: "Videos", icon: Video },
          { id: "reviews", label: "Reviews", icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500"
                />
              </div>
            </div>
            <div className="w-full md:w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all" className="text-white hover:bg-gray-800">
                    All Status
                  </SelectItem>
                  {activeTab === "videos" ? (
                    <>
                      <SelectItem value="ACTIVE" className="text-white hover:bg-gray-800">
                        Active
                      </SelectItem>
                      <SelectItem value="FLAGGED" className="text-white hover:bg-gray-800">
                        Flagged
                      </SelectItem>
                      <SelectItem value="REMOVED" className="text-white hover:bg-gray-800">
                        Removed
                      </SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="APPROVED" className="text-white hover:bg-gray-800">
                        Approved
                      </SelectItem>
                      <SelectItem value="PENDING" className="text-white hover:bg-gray-800">
                        Pending
                      </SelectItem>
                      <SelectItem value="FLAGGED" className="text-white hover:bg-gray-800">
                        Flagged
                      </SelectItem>
                      <SelectItem value="REMOVED" className="text-white hover:bg-gray-800">
                        Removed
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Table */}
      <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white capitalize">{activeTab}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <span className="ml-2 text-gray-300">Loading {activeTab}...</span>
            </div>
          ) : (activeTab === "videos" ? videos : reviews).length === 0 ? (
            <div className="text-center py-12">
              {activeTab === "videos" ? (
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              ) : (
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              )}
              <p className="text-gray-300">No {activeTab} found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-gray-800/50">
                    {activeTab === "videos" ? (
                      <>
                        <TableHead className="text-gray-300">Order</TableHead>
                        <TableHead className="text-gray-300">Celebrity</TableHead>
                        <TableHead className="text-gray-300">Customer</TableHead>
                        <TableHead className="text-gray-300">File Size</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Created</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="text-gray-300">Customer</TableHead>
                        <TableHead className="text-gray-300">Celebrity</TableHead>
                        <TableHead className="text-gray-300">Rating</TableHead>
                        <TableHead className="text-gray-300">Comment</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Created</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(activeTab === "videos" ? videos : reviews).map((item) => (
                    <TableRow key={item.id} className="border-gray-700 hover:bg-gray-800/50 transition-colors">
                      {activeTab === "videos" ? (
                        <>
                          <TableCell className="text-white">{(item as VideoContent).orderNumber}</TableCell>
                          <TableCell className="text-gray-300">{(item as VideoContent).celebrityName}</TableCell>
                          <TableCell className="text-gray-300">{(item as VideoContent).customerName}</TableCell>
                          <TableCell className="text-gray-300">
                            {formatFileSize((item as VideoContent).fileSize)}
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedVideo(item as VideoContent)}
                                    className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                                  >
                                    <Play className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle>Video Details - {selectedVideo?.orderNumber}</DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                      View and manage video content
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedVideo && (
                                    <div className="space-y-6">
                                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                        <video
                                          src={selectedVideo.videoUrl}
                                          controls
                                          className="w-full h-full object-contain"
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm text-gray-400">Order Number</label>
                                          <p className="text-white">{selectedVideo.orderNumber}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm text-gray-400">Celebrity</label>
                                          <p className="text-white">{selectedVideo.celebrityName}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm text-gray-400">Customer</label>
                                          <p className="text-white">{selectedVideo.customerName}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm text-gray-400">File Size</label>
                                          <p className="text-white">{formatFileSize(selectedVideo.fileSize)}</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        {selectedVideo.status === "ACTIVE" && (
                                          <Button
                                            onClick={() => handleContentAction(selectedVideo.id, "flag", "video")}
                                            disabled={updating}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            {updating ? (
                                              <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                              <AlertTriangle className="w-4 h-4" />
                                            )}
                                            Flag Content
                                          </Button>
                                        )}
                                        {selectedVideo.status === "FLAGGED" && (
                                          <>
                                            <Button
                                              onClick={() => handleContentAction(selectedVideo.id, "approve", "video")}
                                              disabled={updating}
                                              className="bg-green-600 hover:bg-green-700"
                                            >
                                              {updating ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                              ) : (
                                                <CheckCircle className="w-4 h-4" />
                                              )}
                                              Approve
                                            </Button>
                                            <Button
                                              onClick={() => handleContentAction(selectedVideo.id, "remove", "video")}
                                              disabled={updating}
                                              className="bg-red-600 hover:bg-red-700"
                                            >
                                              {updating ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                              ) : (
                                                <Trash2 className="w-4 h-4" />
                                              )}
                                              Remove
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-white">{(item as Review).customerName}</TableCell>
                          <TableCell className="text-gray-300">{(item as Review).celebrityName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">{renderStars((item as Review).rating)}</div>
                          </TableCell>
                          <TableCell className="text-gray-300 max-w-xs truncate">{(item as Review).comment}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedReview(item as Review)}
                                    className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Review Details</DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                      View and manage review content
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedReview && (
                                    <div className="space-y-6">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm text-gray-400">Customer</label>
                                          <p className="text-white">{selectedReview.customerName}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm text-gray-400">Celebrity</label>
                                          <p className="text-white">{selectedReview.celebrityName}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm text-gray-400">Order Number</label>
                                          <p className="text-white">{selectedReview.orderNumber}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm text-gray-400">Rating</label>
                                          <div className="flex items-center gap-1">
                                            {renderStars(selectedReview.rating)}
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm text-gray-400">Comment</label>
                                        <p className="text-white mt-1 p-3 bg-gray-800/50 rounded-lg">
                                          {selectedReview.comment}
                                        </p>
                                      </div>
                                      <div className="flex gap-2">
                                        {selectedReview.status === "PENDING" && (
                                          <>
                                            <Button
                                              onClick={() =>
                                                handleContentAction(selectedReview.id, "approve", "review")
                                              }
                                              disabled={updating}
                                              className="bg-green-600 hover:bg-green-700"
                                            >
                                              {updating ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                              ) : (
                                                <CheckCircle className="w-4 h-4" />
                                              )}
                                              Approve
                                            </Button>
                                            <Button
                                              onClick={() => handleContentAction(selectedReview.id, "flag", "review")}
                                              disabled={updating}
                                              className="bg-red-600 hover:bg-red-700"
                                            >
                                              {updating ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                              ) : (
                                                <AlertTriangle className="w-4 h-4" />
                                              )}
                                              Flag
                                            </Button>
                                          </>
                                        )}
                                        {selectedReview.status === "FLAGGED" && (
                                          <>
                                            <Button
                                              onClick={() =>
                                                handleContentAction(selectedReview.id, "approve", "review")
                                              }
                                              disabled={updating}
                                              className="bg-green-600 hover:bg-green-700"
                                            >
                                              {updating ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                              ) : (
                                                <CheckCircle className="w-4 h-4" />
                                              )}
                                              Approve
                                            </Button>
                                            <Button
                                              onClick={() => handleContentAction(selectedReview.id, "remove", "review")}
                                              disabled={updating}
                                              className="bg-red-600 hover:bg-red-700"
                                            >
                                              {updating ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                              ) : (
                                                <Trash2 className="w-4 h-4" />
                                              )}
                                              Remove
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
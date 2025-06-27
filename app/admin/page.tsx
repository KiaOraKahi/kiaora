"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Search,
  Eye,
  Filter,
  Loader2,
  Calendar,
  Mail,
  Phone,
  Globe,
  Award,
  FileText,
  Camera,
  BadgeIcon as IdCard,
} from "lucide-react"
import { toast } from "sonner"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"

interface Application {
  id: string
  fullName: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  profession: string
  category: string
  experience: string
  achievements: string
  instagramHandle?: string
  twitterHandle?: string
  tiktokHandle?: string
  youtubeHandle?: string
  otherSocialMedia?: string
  followerCount: string
  basePrice: number
  rushPrice: number
  languages: string[]
  availability: string
  specialRequests?: string
  motivation: string
  hasProfilePhoto: boolean
  hasIdDocument: boolean
  hasVerificationDocument: boolean
  profilePhotoUrl?: string
  idDocumentUrl?: string
  verificationDocumentUrl?: string
  status: string
  reviewNotes?: string
  reviewedAt?: string
  reviewedBy?: string
  createdAt: string
  updatedAt: string
}

interface Stats {
  total: number
  pending: number
  underReview: number
  approved: number
  rejected: number
  averagePrice: number
}

export default function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    averagePrice: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [reviewStatus, setReviewStatus] = useState("")
  const [reviewNotes, setReviewNotes] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [statusFilter, searchTerm])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/admin/applications?${params}`)
      const data = await response.json()

      if (response.ok) {
        setApplications(data.applications)
        setStats(data.stats)
      } else {
        toast.error("Failed to fetch applications")
      }
    } catch (error) {
      toast.error("Error fetching applications")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedApplication || !reviewStatus) {
      toast.error("Please select a status")
      return
    }

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/applications/${selectedApplication.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reviewStatus,
          reviewNotes,
          reviewedBy: "Admin", // TODO: Replace with actual admin user
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("Application status updated successfully")
        setSelectedApplication(null)
        setReviewStatus("")
        setReviewNotes("")
        fetchApplications()
      } else {
        toast.error(result.error || "Failed to update application")
      }
    } catch (error) {
      toast.error("Error updating application")
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-500", text: "Pending" },
      UNDER_REVIEW: { color: "bg-blue-500", text: "Under Review" },
      APPROVED: { color: "bg-green-500", text: "Approved" },
      REJECTED: { color: "bg-red-500", text: "Rejected" },
      REQUIRES_CHANGES: { color: "bg-orange-500", text: "Requires Changes" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-500",
      text: status,
    }

    return <Badge className={`${config.color} text-white hover:${config.color}/80`}>{config.text}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const statCards = [
    {
      title: "Total Applications",
      value: stats.total,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Pending Review",
      value: stats.pending,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Under Review",
      value: stats.underReview,
      icon: AlertCircle,
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "Approved",
      value: stats.approved,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "from-red-500 to-pink-500",
    },
    {
      title: "Avg. Base Price",
      value: `$${stats.averagePrice}`,
      icon: DollarSign,
      color: "from-purple-500 to-pink-500",
    },
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Starfield Background */}
      <div className="absolute inset-0">
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

      <Navbar />

      <div className="relative z-10 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-300">Manage celebrity applications and review submissions</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
          >
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title} className="bg-black/40 backdrop-blur-xl border-purple-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search by name, email, or profession..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white focus:border-purple-500">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        <SelectItem value="all" className="text-white hover:bg-gray-800">
                          All Applications
                        </SelectItem>
                        <SelectItem value="pending" className="text-white hover:bg-gray-800">
                          Pending
                        </SelectItem>
                        <SelectItem value="under_review" className="text-white hover:bg-gray-800">
                          Under Review
                        </SelectItem>
                        <SelectItem value="approved" className="text-white hover:bg-gray-800">
                          Approved
                        </SelectItem>
                        <SelectItem value="rejected" className="text-white hover:bg-gray-800">
                          Rejected
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Applications Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Celebrity Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                    <span className="ml-2 text-gray-300">Loading applications...</span>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300">No applications found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700 hover:bg-gray-800/50">
                          <TableHead className="text-gray-300">Name</TableHead>
                          <TableHead className="text-gray-300">Email</TableHead>
                          <TableHead className="text-gray-300">Profession</TableHead>
                          <TableHead className="text-gray-300">Category</TableHead>
                          <TableHead className="text-gray-300">Base Price</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Applied</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((application) => (
                          <TableRow
                            key={application.id}
                            className="border-gray-700 hover:bg-gray-800/50 transition-colors"
                          >
                            <TableCell className="text-white font-medium">{application.fullName}</TableCell>
                            <TableCell className="text-gray-300">{application.email}</TableCell>
                            <TableCell className="text-gray-300">{application.profession}</TableCell>
                            <TableCell className="text-gray-300">{application.category}</TableCell>
                            <TableCell className="text-gray-300">${application.basePrice}</TableCell>
                            <TableCell>{getStatusBadge(application.status)}</TableCell>
                            <TableCell className="text-gray-300">{formatDate(application.createdAt)}</TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedApplication(application)}
                                    className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Review
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl font-bold">
                                      Application Review - {selectedApplication?.fullName}
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                      Review and update the application status
                                    </DialogDescription>
                                  </DialogHeader>

                                  {selectedApplication && (
                                    <div className="space-y-6">
                                      {/* Personal Information */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="bg-gray-800/50 border-gray-700">
                                          <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                              <Users className="w-5 h-5 text-purple-400" />
                                              Personal Information
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-3">
                                            <div className="flex items-center gap-2">
                                              <Mail className="w-4 h-4 text-gray-400" />
                                              <span className="text-gray-300">{selectedApplication.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Phone className="w-4 h-4 text-gray-400" />
                                              <span className="text-gray-300">{selectedApplication.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Calendar className="w-4 h-4 text-gray-400" />
                                              <span className="text-gray-300">{selectedApplication.dateOfBirth}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Globe className="w-4 h-4 text-gray-400" />
                                              <span className="text-gray-300">{selectedApplication.nationality}</span>
                                            </div>
                                          </CardContent>
                                        </Card>

                                        <Card className="bg-gray-800/50 border-gray-700">
                                          <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                              <Award className="w-5 h-5 text-purple-400" />
                                              Professional Details
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-3">
                                            <div>
                                              <span className="text-gray-400 text-sm">Profession:</span>
                                              <p className="text-white">{selectedApplication.profession}</p>
                                            </div>
                                            <div>
                                              <span className="text-gray-400 text-sm">Category:</span>
                                              <p className="text-white">{selectedApplication.category}</p>
                                            </div>
                                            <div>
                                              <span className="text-gray-400 text-sm">Followers:</span>
                                              <p className="text-white">{selectedApplication.followerCount}</p>
                                            </div>
                                            <div>
                                              <span className="text-gray-400 text-sm">Languages:</span>
                                              <p className="text-white">{selectedApplication.languages.join(", ")}</p>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </div>

                                      {/* Experience & Achievements */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="bg-gray-800/50 border-gray-700">
                                          <CardHeader>
                                            <CardTitle className="text-lg">Experience</CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                              {selectedApplication.experience}
                                            </p>
                                          </CardContent>
                                        </Card>

                                        <Card className="bg-gray-800/50 border-gray-700">
                                          <CardHeader>
                                            <CardTitle className="text-lg">Achievements</CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                              {selectedApplication.achievements}
                                            </p>
                                          </CardContent>
                                        </Card>
                                      </div>

                                      {/* Pricing & Availability */}
                                      <Card className="bg-gray-800/50 border-gray-700">
                                        <CardHeader>
                                          <CardTitle className="text-lg flex items-center gap-2">
                                            <DollarSign className="w-5 h-5 text-purple-400" />
                                            Pricing & Availability
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <div>
                                            <span className="text-gray-400 text-sm">Base Price:</span>
                                            <p className="text-white font-semibold">${selectedApplication.basePrice}</p>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 text-sm">Rush Price:</span>
                                            <p className="text-white font-semibold">${selectedApplication.rushPrice}</p>
                                          </div>
                                          <div>
                                            <span className="text-gray-400 text-sm">Availability:</span>
                                            <p className="text-white">{selectedApplication.availability}</p>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      {/* Documents */}
                                      <Card className="bg-gray-800/50 border-gray-700">
                                        <CardHeader>
                                          <CardTitle className="text-lg flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-purple-400" />
                                            Documents
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <div className="flex items-center gap-2">
                                            <Camera className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-300">Profile Photo:</span>
                                            {selectedApplication.hasProfilePhoto ? (
                                              <CheckCircle className="w-4 h-4 text-green-400" />
                                            ) : (
                                              <XCircle className="w-4 h-4 text-red-400" />
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <IdCard className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-300">Government ID:</span>
                                            {selectedApplication.hasIdDocument ? (
                                              <CheckCircle className="w-4 h-4 text-green-400" />
                                            ) : (
                                              <XCircle className="w-4 h-4 text-red-400" />
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Award className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-300">Verification:</span>
                                            {selectedApplication.hasVerificationDocument ? (
                                              <CheckCircle className="w-4 h-4 text-green-400" />
                                            ) : (
                                              <XCircle className="w-4 h-4 text-red-400" />
                                            )}
                                          </div>
                                        </CardContent>
                                      </Card>

                                      {/* Motivation */}
                                      <Card className="bg-gray-800/50 border-gray-700">
                                        <CardHeader>
                                          <CardTitle className="text-lg">Motivation</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <p className="text-gray-300 text-sm leading-relaxed">
                                            {selectedApplication.motivation}
                                          </p>
                                        </CardContent>
                                      </Card>

                                      {/* Review Section */}
                                      <Card className="bg-purple-900/20 border-purple-500/30">
                                        <CardHeader>
                                          <CardTitle className="text-lg">Review Application</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                          <div>
                                            <Label htmlFor="status" className="text-white">
                                              Update Status
                                            </Label>
                                            <Select value={reviewStatus} onValueChange={setReviewStatus}>
                                              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                                <SelectValue placeholder="Select new status" />
                                              </SelectTrigger>
                                              <SelectContent className="bg-gray-800 border-gray-600">
                                                <SelectItem value="UNDER_REVIEW" className="text-white">
                                                  Under Review
                                                </SelectItem>
                                                <SelectItem value="APPROVED" className="text-white">
                                                  Approved
                                                </SelectItem>
                                                <SelectItem value="REJECTED" className="text-white">
                                                  Rejected
                                                </SelectItem>
                                                <SelectItem value="REQUIRES_CHANGES" className="text-white">
                                                  Requires Changes
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>

                                          <div>
                                            <Label htmlFor="notes" className="text-white">
                                              Review Notes (optional)
                                            </Label>
                                            <Textarea
                                              id="notes"
                                              value={reviewNotes}
                                              onChange={(e) => setReviewNotes(e.target.value)}
                                              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                                              placeholder="Add any notes or feedback for the applicant..."
                                              rows={3}
                                            />
                                          </div>

                                          <Button
                                            onClick={handleStatusUpdate}
                                            disabled={!reviewStatus || updating}
                                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                          >
                                            {updating ? (
                                              <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Updating...
                                              </>
                                            ) : (
                                              "Update Application Status"
                                            )}
                                          </Button>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

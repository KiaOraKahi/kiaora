"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, XCircle, Eye, Mail, DollarSign, Calendar, FileText, Loader2, Video, Play, Download } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

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
  followerCount: string
  basePrice: number
  rushPrice: number
  languages: string[]
  availability: string
  motivation: string
  profilePhotoUrl?: string
  idDocumentUrl?: string
  verificationDocumentUrl?: string
  status: string
  createdAt: string
}

export function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/applications")
      const data = await response.json()

      if (response.ok) {
        setApplications(data.applications || [])
      } else {
        toast.error("Failed to fetch applications")
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast.error("Failed to fetch applications")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (applicationId: string) => {
    try {
      setProcessingId(applicationId)
      const response = await fetch(`/api/admin/applications/${applicationId}/approve`, {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Application approved successfully")
        fetchApplications()
      } else {
        toast.error(data.error || "Failed to approve application")
      }
    } catch (error) {
      console.error("Error approving application:", error)
      toast.error("Failed to approve application")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (applicationId: string) => {
    try {
      setProcessingId(applicationId)
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: "REJECTED",
          reviewNotes: "Application rejected by admin"
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Application rejected")
        fetchApplications()
      } else {
        toast.error(data.error || "Failed to reject application")
      }
    } catch (error) {
      console.error("Error rejecting application:", error)
      toast.error("Failed to reject application")
    } finally {
      setProcessingId(null)
    }
  }

  const viewApplicationDetails = (application: Application) => {
    setSelectedApplication(application)
    setShowDetails(true)
  }

  const closeDetails = () => {
    setShowDetails(false)
    setSelectedApplication(null)
  }

  const handleViewFile = (url: string, type: string) => {
    if (url) {
      window.open(url, '_blank')
    }
  }

  const handlePlayVideo = (url: string) => {
    if (url) {
      // Open video in a new tab or modal
      window.open(url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  const pendingApplications = applications.filter((app) => app.status === "PENDING")
  const processedApplications = applications.filter((app) => app.status !== "PENDING")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Celebrity Applications</h2>
        <p className="text-purple-200">Review and manage celebrity applications</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Pending Applications ({pendingApplications.length})</h3>
          {pendingApplications.length === 0 ? (
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-8 text-center">
                <FileText className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Pending Applications</h3>
                <p className="text-purple-200">All applications have been processed.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingApplications.map((application) => (
                <Card
                  key={application.id}
                  className="bg-white/10 border-white/20 backdrop-blur-lg"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={application.profilePhotoUrl || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            {application.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-1">{application.fullName}</h3>
                          <p className="text-purple-200 mb-2">
                            {application.profession} • {application.category}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-purple-300">
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {application.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />${application.basePrice}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(application.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => viewApplicationDetails(application)}
                          variant="outline"
                          className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          onClick={() => handleApprove(application.id)}
                          disabled={processingId === application.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {processingId === application.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(application.id)}
                          disabled={processingId === application.id}
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          {processingId === application.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Processed Applications ({processedApplications.length})</h3>
          {processedApplications.length === 0 ? (
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Processed Applications</h3>
                <p className="text-purple-200">Processed applications will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {processedApplications.map((application) => (
                <Card
                  key={application.id}
                  className="bg-white/10 border-white/20 backdrop-blur-lg"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={application.profilePhotoUrl || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            {application.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-white">{application.fullName}</h3>
                          <p className="text-sm text-purple-200">{application.profession}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          className={
                            application.status === "APPROVED"
                              ? "bg-green-500/20 text-green-300"
                              : "bg-red-500/20 text-red-300"
                          }
                        >
                          {application.status}
                        </Badge>
                        <span className="text-sm text-purple-300">
                          {format(new Date(application.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Application Details Modal */}
      {showDetails && selectedApplication && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-purple-500/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Application Details</h2>
                <Button onClick={closeDetails} variant="outline" className="border-gray-600 text-gray-300">
                  ✕ Close
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Personal Info */}
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Personal Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Name:</span>
                        <span className="text-white">{selectedApplication.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white">{selectedApplication.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Phone:</span>
                        <span className="text-white">{selectedApplication.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Date of Birth:</span>
                        <span className="text-white">{selectedApplication.dateOfBirth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Nationality:</span>
                        <span className="text-white">{selectedApplication.nationality}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Professional Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Category:</span>
                        <span className="text-white">{selectedApplication.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Profession:</span>
                        <span className="text-white">{selectedApplication.profession}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Base Price:</span>
                        <span className="text-white">${selectedApplication.basePrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rush Price:</span>
                        <span className="text-white">${selectedApplication.rushPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Languages:</span>
                        <span className="text-white">{selectedApplication.languages.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Documents & Media */}
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Documents & Media</h3>
                    <div className="space-y-3">
                      {/* Profile Photo */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Profile Photo:</span>
                        {selectedApplication.profilePhotoUrl ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={selectedApplication.profilePhotoUrl} />
                              <AvatarFallback className="bg-purple-500 text-white text-xs">
                                {selectedApplication.fullName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                              <Download className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-red-400 border-red-400">Missing</Badge>
                        )}
                      </div>

                      {/* ID Document */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">ID Document:</span>
                        {selectedApplication.idDocumentUrl ? (
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                            <Download className="w-3 h-3 mr-1" />
                            View ID
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-red-400 border-red-400">Missing</Badge>
                        )}
                      </div>

                      {/* Verification Video */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Verification Video:</span>
                        {selectedApplication.verificationDocumentUrl ? (
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                              <Video className="w-3 h-3 mr-1" />
                              View Video
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                              <Play className="w-3 h-3 mr-1" />
                              Play
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-red-400 border-red-400">Missing</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Experience & Motivation</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Experience:</span>
                        <p className="text-white mt-1">{selectedApplication.experience}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Motivation:</span>
                        <p className="text-white mt-1">{selectedApplication.motivation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex justify-end gap-3">
                  <Button
                    onClick={() => handleReject(selectedApplication.id)}
                    disabled={processingId === selectedApplication.id}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    {processingId === selectedApplication.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedApplication.id)}
                    disabled={processingId === selectedApplication.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {processingId === selectedApplication.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Eye, Mail, DollarSign, Calendar, FileText, Loader2 } from "lucide-react"
import { format } from "date-fns"
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

export default function AdminApplications() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "ADMIN") {
      router.push("/")
      return
    }

    fetchApplications()
  }, [session, status, router])

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
        body: JSON.stringify({ action: "reject" }),
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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <Navbar />

        {/* Starfield Background */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen pt-24">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>

        <Footer />
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <Navbar />

        {/* Starfield Background */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-purple-200">This page is only accessible to administrators.</p>
          </div>
        </div>

        <Footer />
      </div>
    )
  }

  const pendingApplications = applications.filter((app) => app.status === "PENDING")
  const processedApplications = applications.filter((app) => app.status !== "PENDING")

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Navbar />

      {/* Starfield Background */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Celebrity Applications</h1>
            <p className="text-purple-200">Review and manage celebrity applications</p>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="bg-white/10 border border-white/20">
              <TabsTrigger value="pending" className="data-[state=active]:bg-purple-500">
                Pending ({pendingApplications.length})
              </TabsTrigger>
              <TabsTrigger value="processed" className="data-[state=active]:bg-purple-500">
                Processed ({processedApplications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-6">
              {pendingApplications.length === 0 ? (
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-8 text-center">
                    <FileText className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Pending Applications</h3>
                    <p className="text-purple-200">All applications have been processed.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {pendingApplications.map((application) => (
                    <Card
                      key={application.id}
                      className="bg-white/10 border-white/20 backdrop-blur-lg cursor-pointer hover:bg-white/15 transition-colors"
                      onClick={() => router.push(`/admin/applications/${application.id}`)}
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
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                  onClick={() => setSelectedApplication(application)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Quick View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl">Application Details</DialogTitle>
                                </DialogHeader>
                                {selectedApplication && (
                                  <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                      <Avatar className="w-20 h-20">
                                        <AvatarImage src={selectedApplication.profilePhotoUrl || "/placeholder.svg"} />
                                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                          {selectedApplication.fullName.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <h3 className="text-2xl font-bold">{selectedApplication.fullName}</h3>
                                        <p className="text-purple-200">{selectedApplication.profession}</p>
                                        <Badge className="mt-2">{selectedApplication.category}</Badge>
                                      </div>
                                    </div>

                                    <Tabs defaultValue="personal" className="w-full">
                                      <TabsList className="bg-gray-800">
                                        <TabsTrigger value="personal">Personal</TabsTrigger>
                                        <TabsTrigger value="professional">Professional</TabsTrigger>
                                        <TabsTrigger value="social">Social & Pricing</TabsTrigger>
                                        <TabsTrigger value="documents">Documents</TabsTrigger>
                                      </TabsList>

                                      <TabsContent value="personal" className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                          <div>
                                            <label className="text-sm text-purple-300">Email</label>
                                            <p className="text-white">{selectedApplication.email}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm text-purple-300">Phone</label>
                                            <p className="text-white">{selectedApplication.phone}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm text-purple-300">Date of Birth</label>
                                            <p className="text-white">{selectedApplication.dateOfBirth}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm text-purple-300">Nationality</label>
                                            <p className="text-white">{selectedApplication.nationality}</p>
                                          </div>
                                        </div>
                                      </TabsContent>

                                      <TabsContent value="professional" className="space-y-4">
                                        <div>
                                          <label className="text-sm text-purple-300">Experience</label>
                                          <p className="text-white mt-1">{selectedApplication.experience}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm text-purple-300">Achievements</label>
                                          <p className="text-white mt-1">{selectedApplication.achievements}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm text-purple-300">Motivation</label>
                                          <p className="text-white mt-1">{selectedApplication.motivation}</p>
                                        </div>
                                      </TabsContent>

                                      <TabsContent value="social" className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                          <div>
                                            <label className="text-sm text-purple-300">Instagram</label>
                                            <p className="text-white">
                                              {selectedApplication.instagramHandle || "Not provided"}
                                            </p>
                                          </div>
                                          <div>
                                            <label className="text-sm text-purple-300">Twitter/X</label>
                                            <p className="text-white">
                                              {selectedApplication.twitterHandle || "Not provided"}
                                            </p>
                                          </div>
                                          <div>
                                            <label className="text-sm text-purple-300">TikTok</label>
                                            <p className="text-white">
                                              {selectedApplication.tiktokHandle || "Not provided"}
                                            </p>
                                          </div>
                                          <div>
                                            <label className="text-sm text-purple-300">YouTube</label>
                                            <p className="text-white">
                                              {selectedApplication.youtubeHandle || "Not provided"}
                                            </p>
                                          </div>
                                          <div>
                                            <label className="text-sm text-purple-300">Follower Count</label>
                                            <p className="text-white">{selectedApplication.followerCount}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm text-purple-300">Languages</label>
                                            <p className="text-white">
                                              {selectedApplication.languages?.join(", ") || "English"}
                                            </p>
                                          </div>
                                          <div>
                                            <label className="text-sm text-purple-300">Base Price</label>
                                            <p className="text-white">${selectedApplication.basePrice}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm text-purple-300">Rush Price</label>
                                            <p className="text-white">${selectedApplication.rushPrice}</p>
                                          </div>
                                        </div>
                                      </TabsContent>

                                      <TabsContent value="documents" className="space-y-4">
                                        <div className="grid md:grid-cols-3 gap-4">
                                          {selectedApplication.profilePhotoUrl && (
                                            <div>
                                              <label className="text-sm text-purple-300">Profile Photo</label>
                                              <img
                                                src={selectedApplication.profilePhotoUrl || "/placeholder.svg"}
                                                alt="Profile"
                                                className="w-full h-32 object-cover rounded-lg mt-2"
                                              />
                                            </div>
                                          )}
                                          {selectedApplication.idDocumentUrl && (
                                            <div>
                                              <label className="text-sm text-purple-300">ID Document</label>
                                              <img
                                                src={selectedApplication.idDocumentUrl || "/placeholder.svg"}
                                                alt="ID Document"
                                                className="w-full h-32 object-cover rounded-lg mt-2"
                                              />
                                            </div>
                                          )}
                                          {selectedApplication.verificationDocumentUrl && (
                                            <div>
                                              <label className="text-sm text-purple-300">Verification Document</label>
                                              <img
                                                src={selectedApplication.verificationDocumentUrl || "/placeholder.svg"}
                                                alt="Verification"
                                                className="w-full h-32 object-cover rounded-lg mt-2"
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </TabsContent>
                                    </Tabs>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
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
            </TabsContent>

            <TabsContent value="processed" className="space-y-6">
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
                      className="bg-white/10 border-white/20 backdrop-blur-lg cursor-pointer hover:bg-white/15 transition-colors"
                      onClick={() => router.push(`/admin/applications/${application.id}`)}
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
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  )
}

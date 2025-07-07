"use client"

import { use, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  Briefcase,
  DollarSign,
  Share2,
  FileText,
  ExternalLink,
} from "lucide-react"

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
  createdAt: string
  reviewNotes?: string
  reviewedAt?: string
  reviewedBy?: string
}

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id: applicationId } = use(params) // Use React.use() to unwrap the Promise

  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "ADMIN") {
      router.push("/")
      return
    }

    fetchApplication()
  }, [session, status, router, applicationId])

  const fetchApplication = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/applications/${applicationId}`)
      if (response.ok) {
        const data = await response.json()
        setApplication(data.application)
        setReviewNotes(data.application.reviewNotes || "")
      } else {
        toast.error("Failed to load application details")
      }
    } catch (error) {
      console.error("Error fetching application:", error)
      toast.error("Failed to load application details")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: "APPROVED" | "REJECTED") => {
    if (!application) return

    try {
      setUpdating(true)
      const endpoint =
        newStatus === "APPROVED"
          ? `/api/admin/applications/${applicationId}/approve`
          : `/api/admin/applications/${applicationId}`

      const response = await fetch(endpoint, {
        method: newStatus === "APPROVED" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          reviewNotes,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (newStatus === "APPROVED") {
          toast.success("Application approved successfully! Celebrity profile created.")
        } else {
          setApplication(data.application)
          toast.success(`Application ${newStatus.toLowerCase()} successfully`)
        }
        // Refresh the application data
        fetchApplication()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update application")
      }
    } catch (error) {
      console.error("Error updating application:", error)
      toast.error("Failed to update application status")
    } finally {
      setUpdating(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading application details...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Application Not Found</h2>
          <p className="text-gray-400">The requested application could not be found.</p>
          <Link href="/admin/applications">
            <Button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500">Back to Applications</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/applications">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Applications
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={application.profilePhotoUrl || "/placeholder.svg"} />
                <AvatarFallback className="bg-purple-500 text-white text-xl">
                  {application.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{application.fullName}</h1>
                <p className="text-gray-400">{application.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    className={
                      application.status === "PENDING"
                        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                        : application.status === "APPROVED"
                          ? "bg-green-500/20 text-green-300 border-green-500/30"
                          : "bg-red-500/20 text-red-300 border-red-500/30"
                    }
                  >
                    {application.status}
                  </Badge>
                  <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                    {application.category}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          {application.status === "PENDING" && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleStatusUpdate("APPROVED")}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {updating ? "Processing..." : "Approve"}
              </Button>
              <Button
                onClick={() => handleStatusUpdate("REJECTED")}
                disabled={updating}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {updating ? "Processing..." : "Reject"}
              </Button>
            </div>
          )}
        </div>

        {/* Application Details */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500">
              <User className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="experience" className="data-[state=active]:bg-purple-500">
              <Briefcase className="w-4 h-4 mr-2" />
              Experience
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-purple-500">
              <DollarSign className="w-4 h-4 mr-2" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-purple-500">
              <Share2 className="w-4 h-4 mr-2" />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="review" className="data-[state=active]:bg-purple-500">
              <FileText className="w-4 h-4 mr-2" />
              Review
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Full Name</label>
                        <p className="text-white font-medium">{application.fullName}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Email</label>
                        <p className="text-white font-medium">{application.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Phone</label>
                        <p className="text-white font-medium">{application.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Date of Birth</label>
                        <p className="text-white font-medium">
                          {new Date(application.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Nationality</label>
                        <p className="text-white font-medium">{application.nationality}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Category</label>
                        <p className="text-white font-medium">{application.category}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Application Date</label>
                        <p className="text-white font-medium">{new Date(application.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {application.languages && application.languages.length > 0 && (
                      <div>
                        <label className="text-sm text-gray-400">Languages</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {application.languages.map((language) => (
                            <Badge key={language} variant="outline" className="border-purple-500/30 text-purple-300">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="text-white">Application Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="text-white text-sm">Application Submitted</p>
                          <p className="text-gray-400 text-xs">{new Date(application.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      {application.reviewedAt && (
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              application.status === "APPROVED" ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></div>
                          <div>
                            <p className="text-white text-sm">Application {application.status}</p>
                            <p className="text-gray-400 text-xs">{new Date(application.reviewedAt).toLocaleString()}</p>
                            {application.reviewedBy && (
                              <p className="text-gray-400 text-xs">by {application.reviewedBy}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="experience" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">Professional Experience</CardTitle>
                <CardDescription className="text-gray-400">Background and experience information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Profession</label>
                    <p className="text-white font-medium">{application.profession}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Experience</label>
                    <p className="text-white leading-relaxed whitespace-pre-wrap">{application.experience}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Notable Achievements</label>
                    <p className="text-white leading-relaxed whitespace-pre-wrap">{application.achievements}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Motivation</label>
                    <p className="text-white leading-relaxed whitespace-pre-wrap">{application.motivation}</p>
                  </div>
                  {application.specialRequests && (
                    <div>
                      <label className="text-sm text-gray-400">Special Requests</label>
                      <p className="text-white leading-relaxed whitespace-pre-wrap">{application.specialRequests}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">Documents</CardTitle>
                <CardDescription className="text-gray-400">Uploaded documents and media</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <FileText className="w-8 h-8 text-purple-400" />
                    <div className="flex-1">
                      <p className="text-white font-medium">Profile Photo</p>
                      <p className="text-gray-400 text-sm">
                        {application.hasProfilePhoto ? "Uploaded" : "Not uploaded"}
                      </p>
                    </div>
                    {application.profilePhotoUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-purple-500/30 text-purple-300 bg-transparent"
                        onClick={() => window.open(application.profilePhotoUrl, "_blank")}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <FileText className="w-8 h-8 text-purple-400" />
                    <div className="flex-1">
                      <p className="text-white font-medium">Government ID</p>
                      <p className="text-gray-400 text-sm">{application.hasIdDocument ? "Uploaded" : "Not uploaded"}</p>
                    </div>
                    {application.idDocumentUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-purple-500/30 text-purple-300 bg-transparent"
                        onClick={() => window.open(application.idDocumentUrl, "_blank")}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <FileText className="w-8 h-8 text-purple-400" />
                    <div className="flex-1">
                      <p className="text-white font-medium">Verification Doc</p>
                      <p className="text-gray-400 text-sm">
                        {application.hasVerificationDocument ? "Uploaded" : "Not uploaded"}
                      </p>
                    </div>
                    {application.verificationDocumentUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-purple-500/30 text-purple-300 bg-transparent"
                        onClick={() => window.open(application.verificationDocumentUrl, "_blank")}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">Pricing Structure</CardTitle>
                <CardDescription className="text-gray-400">
                  Proposed pricing for different service types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-white/5 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Base Price</h3>
                    <p className="text-3xl font-bold text-purple-300 mb-2">${application.basePrice}</p>
                    <p className="text-gray-400 text-sm">Standard delivery time</p>
                  </div>
                  <div className="text-center p-6 bg-white/5 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Rush Price</h3>
                    <p className="text-3xl font-bold text-purple-300 mb-2">${application.rushPrice}</p>
                    <p className="text-gray-400 text-sm">24-hour delivery</p>
                  </div>
                  <div className="text-center p-6 bg-white/5 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Availability</h3>
                    <p className="text-xl font-bold text-green-400 mb-2">{application.availability}</p>
                    <p className="text-gray-400 text-sm">Response time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">Social Media Presence</CardTitle>
                <CardDescription className="text-gray-400">
                  Connected social media accounts and online presence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.instagramHandle && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Instagram</p>
                        <p className="text-gray-400 text-sm">{application.instagramHandle}</p>
                      </div>
                    </div>
                  )}
                  {application.twitterHandle && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Twitter</p>
                        <p className="text-gray-400 text-sm">{application.twitterHandle}</p>
                      </div>
                    </div>
                  )}
                  {application.tiktokHandle && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">TikTok</p>
                        <p className="text-gray-400 text-sm">{application.tiktokHandle}</p>
                      </div>
                    </div>
                  )}
                  {application.youtubeHandle && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">YouTube</p>
                        <p className="text-gray-400 text-sm">{application.youtubeHandle}</p>
                      </div>
                    </div>
                  )}
                  {application.otherSocialMedia && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Other</p>
                        <p className="text-gray-400 text-sm">{application.otherSocialMedia}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-6 p-4 bg-white/5 rounded-lg">
                  <label className="text-sm text-gray-400">Follower Count</label>
                  <p className="text-white font-medium text-lg">{application.followerCount}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">Review & Decision</CardTitle>
                <CardDescription className="text-gray-400">
                  Add review notes and make a decision on this application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Review Notes</label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add your review notes here..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[120px]"
                  />
                </div>
                {application.status === "PENDING" && (
                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={() => handleStatusUpdate("APPROVED")}
                      disabled={updating}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {updating ? "Processing..." : "Approve Application"}
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate("REJECTED")}
                      disabled={updating}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {updating ? "Processing..." : "Reject Application"}
                    </Button>
                  </div>
                )}
                {application.reviewNotes && application.status !== "PENDING" && (
                  <div className="mt-4 p-4 bg-white/5 rounded-lg">
                    <label className="text-sm text-gray-400">Previous Review Notes</label>
                    <p className="text-white mt-1">{application.reviewNotes}</p>
                    {application.reviewedAt && (
                      <p className="text-gray-400 text-xs mt-2">
                        Reviewed on {new Date(application.reviewedAt).toLocaleString()}
                        {application.reviewedBy && ` by ${application.reviewedBy}`}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
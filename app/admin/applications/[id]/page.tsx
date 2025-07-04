"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Globe,
  DollarSign,
  Users,
  Star,
  Instagram,
  Twitter,
  Youtube,
  Loader2,
} from "lucide-react"
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

export default function ApplicationDetail({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "ADMIN") {
      router.push("/")
      return
    }

    fetchApplication()
  }, [session, status, router, params.id])

  const fetchApplication = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/applications/${params.id}`)
      const data = await response.json()

      if (response.ok) {
        setApplication(data.application)
      } else {
        toast.error("Failed to fetch application")
        router.push("/admin/applications")
      }
    } catch (error) {
      console.error("Error fetching application:", error)
      toast.error("Failed to fetch application")
      router.push("/admin/applications")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!application) return

    try {
      setProcessing(true)
      const response = await fetch(`/api/admin/applications/${application.id}/approve`, {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Application approved successfully")
        setApplication({ ...application, status: "APPROVED" })
      } else {
        toast.error(data.error || "Failed to approve application")
      }
    } catch (error) {
      console.error("Error approving application:", error)
      toast.error("Failed to approve application")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!application) return

    try {
      setProcessing(true)
      const response = await fetch(`/api/admin/applications/${application.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "reject" }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Application rejected")
        setApplication({ ...application, status: "REJECTED" })
      } else {
        toast.error(data.error || "Failed to reject application")
      }
    } catch (error) {
      console.error("Error rejecting application:", error)
      toast.error("Failed to reject application")
    } finally {
      setProcessing(false)
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

  if (!application) {
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
            <h1 className="text-2xl font-bold text-white mb-4">Application Not Found</h1>
            <p className="text-purple-200">The requested application could not be found.</p>
            <Button
              onClick={() => router.push("/admin/applications")}
              className="mt-4 bg-purple-600 hover:bg-purple-700"
            >
              Back to Applications
            </Button>
          </div>
        </div>

        <Footer />
      </div>
    )
  }

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
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/applications")}
              className="text-white hover:bg-white/10 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applications
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Application Details</h1>
                <p className="text-purple-200">Review celebrity application</p>
              </div>

              <Badge
                className={
                  application.status === "APPROVED"
                    ? "bg-green-500/20 text-green-300 text-lg px-4 py-2"
                    : application.status === "REJECTED"
                      ? "bg-red-500/20 text-red-300 text-lg px-4 py-2"
                      : "bg-yellow-500/20 text-yellow-300 text-lg px-4 py-2"
                }
              >
                {application.status}
              </Badge>
            </div>
          </div>

          {/* Profile Header */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-lg mb-8">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={application.profilePhotoUrl || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
                    {application.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">{application.fullName}</h2>
                  <p className="text-xl text-purple-200 mb-4">{application.profession}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-purple-300">
                      <Mail className="w-4 h-4" />
                      <span>{application.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-300">
                      <Phone className="w-4 h-4" />
                      <span>{application.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-300">
                      <Calendar className="w-4 h-4" />
                      <span>Applied {format(new Date(application.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-6">
                    <Badge className="bg-purple-500/20 text-purple-300">{application.category}</Badge>
                    <Badge className="bg-blue-500/20 text-blue-300">{application.nationality}</Badge>
                    {application.languages.map((lang) => (
                      <Badge key={lang} className="bg-green-500/20 text-green-300">
                        {lang}
                      </Badge>
                    ))}
                  </div>

                  {application.status === "PENDING" && (
                    <div className="flex gap-4">
                      <Button onClick={handleApprove} disabled={processing} className="bg-green-600 hover:bg-green-700">
                        {processing ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Approve Application
                      </Button>
                      <Button
                        onClick={handleReject}
                        disabled={processing}
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
                      >
                        {processing ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Reject Application
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information */}
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="bg-white/10 border border-white/20">
              <TabsTrigger value="personal" className="data-[state=active]:bg-purple-500">
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="professional" className="data-[state=active]:bg-purple-500">
                Professional
              </TabsTrigger>
              <TabsTrigger value="social" className="data-[state=active]:bg-purple-500">
                Social & Pricing
              </TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-purple-500">
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-purple-300 font-medium">Full Name</label>
                      <p className="text-white text-lg">{application.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-purple-300 font-medium">Email Address</label>
                      <p className="text-white text-lg">{application.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-purple-300 font-medium">Phone Number</label>
                      <p className="text-white text-lg">{application.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm text-purple-300 font-medium">Date of Birth</label>
                      <p className="text-white text-lg">{application.dateOfBirth}</p>
                    </div>
                    <div>
                      <label className="text-sm text-purple-300 font-medium">Nationality</label>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-purple-400" />
                        <p className="text-white text-lg">{application.nationality}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-purple-300 font-medium">Languages</label>
                      <div className="flex gap-2 mt-1">
                        {application.languages.map((lang) => (
                          <Badge key={lang} className="bg-green-500/20 text-green-300">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional" className="space-y-6">
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white">Professional Background</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-purple-300 font-medium">Profession</label>
                      <p className="text-white text-lg">{application.profession}</p>
                    </div>
                    <div>
                      <label className="text-sm text-purple-300 font-medium">Category</label>
                      <Badge className="bg-purple-500/20 text-purple-300 text-base px-3 py-1">
                        {application.category}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="bg-white/20" />

                  <div>
                    <label className="text-sm text-purple-300 font-medium">Experience</label>
                    <p className="text-white mt-2 leading-relaxed">{application.experience}</p>
                  </div>

                  <div>
                    <label className="text-sm text-purple-300 font-medium">Achievements</label>
                    <p className="text-white mt-2 leading-relaxed">{application.achievements}</p>
                  </div>

                  <div>
                    <label className="text-sm text-purple-300 font-medium">Motivation</label>
                    <p className="text-white mt-2 leading-relaxed">{application.motivation}</p>
                  </div>

                  <div>
                    <label className="text-sm text-purple-300 font-medium">Availability</label>
                    <p className="text-white mt-2">{application.availability}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Social Media
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-purple-300 font-medium">Follower Count</label>
                      <p className="text-white text-lg">{application.followerCount}</p>
                    </div>

                    <Separator className="bg-white/20" />

                    <div className="space-y-3">
                      {application.instagramHandle && (
                        <div className="flex items-center gap-3">
                          <Instagram className="w-5 h-5 text-pink-400" />
                          <span className="text-white">@{application.instagramHandle}</span>
                        </div>
                      )}
                      {application.twitterHandle && (
                        <div className="flex items-center gap-3">
                          <Twitter className="w-5 h-5 text-blue-400" />
                          <span className="text-white">@{application.twitterHandle}</span>
                        </div>
                      )}
                      {application.youtubeHandle && (
                        <div className="flex items-center gap-3">
                          <Youtube className="w-5 h-5 text-red-400" />
                          <span className="text-white">{application.youtubeHandle}</span>
                        </div>
                      )}
                      {application.tiktokHandle && (
                        <div className="flex items-center gap-3">
                          <Star className="w-5 h-5 text-purple-400" />
                          <span className="text-white">@{application.tiktokHandle}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <label className="text-sm text-green-300 font-medium">Base Price</label>
                        <p className="text-white text-2xl font-bold">${application.basePrice}</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <label className="text-sm text-yellow-300 font-medium">Rush Price</label>
                        <p className="text-white text-2xl font-bold">${application.rushPrice}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-white">Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {application.profilePhotoUrl && (
                      <div>
                        <label className="text-sm text-purple-300 font-medium">Profile Photo</label>
                        <div className="mt-2 border border-white/20 rounded-lg overflow-hidden">
                          <img
                            src={application.profilePhotoUrl || "/placeholder.svg"}
                            alt="Profile"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      </div>
                    )}
                    {application.idDocumentUrl && (
                      <div>
                        <label className="text-sm text-purple-300 font-medium">ID Document</label>
                        <div className="mt-2 border border-white/20 rounded-lg overflow-hidden">
                          <img
                            src={application.idDocumentUrl || "/placeholder.svg"}
                            alt="ID Document"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      </div>
                    )}
                    {application.verificationDocumentUrl && (
                      <div>
                        <label className="text-sm text-purple-300 font-medium">Verification Document</label>
                        <div className="mt-2 border border-white/20 rounded-lg overflow-hidden">
                          <img
                            src={application.verificationDocumentUrl || "/placeholder.svg"}
                            alt="Verification"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {!application.profilePhotoUrl &&
                    !application.idDocumentUrl &&
                    !application.verificationDocumentUrl && (
                      <div className="text-center py-8">
                        <p className="text-purple-300">No documents uploaded</p>
                      </div>
                    )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  )
}
"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  DollarSign,
  Clock,
  Users,
  Shield,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Upload,
  User,
  Briefcase,
  Camera,
  FileText,
  Globe,
  Award,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import { toast } from "sonner"

const benefits = [
  {
    icon: <DollarSign className="w-8 h-8" />,
    title: "Earn Extra Income",
    description: "Set your own rates and earn money from your fanbase",
    color: "from-green-500 to-emerald-500",
    details: ["Keep 80% of your earnings", "Weekly payouts", "No hidden fees", "Transparent pricing"],
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Connect with Fans",
    description: "Build deeper relationships with your audience",
    color: "from-blue-500 to-cyan-500",
    details: ["Direct fan interaction", "Personalised messages", "Global reach", "Meaningful connections"],
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: "Flexible Schedule",
    description: "Work on your own time and terms",
    color: "from-purple-500 to-pink-500",
    details: ["Set your availability", "Choose request types", "Work from anywhere", "No minimum commitments"],
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Safe & Secure",
    description: "Protected platform with verified users",
    color: "from-orange-500 to-red-500",
    details: ["Verified user base", "Content moderation", "Secure payments", "Privacy protection"],
  },
]

const requirements = [
  "Verified social media presence with 10K+ followers",
  "Professional experience in entertainment, sports, or business",
  "Ability to create high-quality video content",
  "Commitment to responding to requests within stated timeframes",
  "Agreement to platform terms and community guidelines",
]

const steps = [
  {
    step: 1,
    title: "Personal Information",
    description: "Basic details and contact information",
    icon: <User className="w-6 h-6" />,
  },
  {
    step: 2,
    title: "Professional Details",
    description: "Career background and achievements",
    icon: <Briefcase className="w-6 h-6" />,
  },
  {
    step: 3,
    title: "Social Media & Pricing",
    description: "Online presence and rate setting",
    icon: <Globe className="w-6 h-6" />,
  },
  {
    step: 4,
    title: "Documents & Verification",
    description: "Upload required documents",
    icon: <FileText className="w-6 h-6" />,
  },
]

const categories = [
  "Actor/Actress",
  "Musician/Artist",
  "Athlete",
  "Social Media Influencer",
  "Comedian",
  "Author/Writer",
  "Business Leader",
  "Reality TV Star",
  "Model",
  "Chef",
  "Fitness Trainer",
  "Other",
]

const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Other",
]

interface ApplicationData {
  // Personal Information
  fullName: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string

  // Professional Information
  profession: string
  category: string
  experience: string
  achievements: string

  // Social Media
  socialMedia: {
    instagram: string
    twitter: string
    tiktok: string
    youtube: string
    other: string
  }
  followerCount: string

  // Pricing
  basePrice: number
  rushPrice: number

  // Additional Info
  languages: string[]
  availability: string
  specialRequests: string
  motivation: string

  // Documents
  profilePhoto: File | null
  idDocument: File | null
  verificationDocument: File | null
}

export default function JoinCelebrityPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({})

  const [formData, setFormData] = useState<ApplicationData>({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    nationality: "",
    profession: "",
    category: "",
    experience: "",
    achievements: "",
    socialMedia: {
      instagram: "",
      twitter: "",
      tiktok: "",
      youtube: "",
      other: "",
    },
    followerCount: "",
    basePrice: 50,
    rushPrice: 100,
    languages: [],
    availability: "",
    specialRequests: "",
    motivation: "",
    profilePhoto: null,
    idDocument: null,
    verificationDocument: null,
  })

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleLanguageToggle = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }))
  }

  const handleFileUpload = async (file: File, type: string) => {
    if (!file) return

    setUploadingFiles((prev) => ({ ...prev, [type]: true }))

    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("type", type)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      })

      const result = await response.json()

      if (response.ok) {
        setFormData((prev) => ({ ...prev, [type]: file }))
        toast.success(`${type.replace(/([A-Z])/g, " $1").toLowerCase()} uploaded successfully!`)
      } else {
        toast.error(result.error || "Upload failed. Please try again.")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Upload failed. Please try again.")
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [type]: false }))
    }
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.fullName && formData.email && formData.phone && formData.dateOfBirth && formData.nationality)
      case 1:
        return !!(
          formData.profession &&
          formData.category &&
          formData.experience.length >= 50 &&
          formData.achievements.length >= 50
        )
      case 2:
        return !!(
          formData.followerCount &&
          formData.basePrice >= 10 &&
          formData.rushPrice >= 10 &&
          formData.languages.length > 0 &&
          formData.availability &&
          formData.motivation.length >= 50
        )
      case 3:
        return !!(formData.profilePhoto && formData.idDocument && formData.verificationDocument)
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    } else {
      toast.error("Please fill in all required fields before continuing.")
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error("Please complete all required fields.")
      return
    }

    setIsSubmitting(true)

    try {
      const applicationData = {
        ...formData,
        hasProfilePhoto: !!formData.profilePhoto,
        hasIdDocument: !!formData.idDocument,
        hasVerificationDocument: !!formData.verificationDocument,
      }

      const response = await fetch("/api/celebrity/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationData),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        toast.success("Application submitted successfully!")
      } else {
        toast.error(result.error || "Something went wrong")
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Personal Information</h3>
              <p className="text-purple-200">Let's start with your basic details</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-white mb-2 block">Full Name *</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
                  placeholder="Your full legal name"
                />
              </div>
              <div>
                <Label className="text-white mb-2 block">Email Address *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-white mb-2 block">Phone Number *</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label className="text-white mb-2 block">Date of Birth *</Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <Label className="text-white mb-2 block">Nationality *</Label>
              <Input
                value={formData.nationality}
                onChange={(e) => handleInputChange("nationality", e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
                placeholder="Your nationality"
              />
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Briefcase className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Professional Details</h3>
              <p className="text-purple-200">Tell us about your career and achievements</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-white mb-2 block">Profession *</Label>
                <Input
                  value={formData.profession}
                  onChange={(e) => handleInputChange("profession", e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
                  placeholder="e.g., Actor, Musician, Athlete"
                />
              </div>
              <div>
                <Label className="text-white mb-2 block">Category *</Label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:border-purple-500"
                >
                  <option value="" className="bg-slate-800">
                    Select your category
                  </option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-slate-800">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label className="text-white mb-2 block">Professional Experience * (minimum 50 characters)</Label>
              <Textarea
                rows={4}
                value={formData.experience}
                onChange={(e) => handleInputChange("experience", e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500 resize-none"
                placeholder="Describe your professional background, career highlights, and relevant experience..."
              />
              <p className="text-sm text-purple-300 mt-1">{formData.experience.length}/50 characters</p>
            </div>

            <div>
              <Label className="text-white mb-2 block">Notable Achievements * (minimum 50 characters)</Label>
              <Textarea
                rows={4}
                value={formData.achievements}
                onChange={(e) => handleInputChange("achievements", e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500 resize-none"
                placeholder="List your awards, recognitions, major projects, or career milestones..."
              />
              <p className="text-sm text-purple-300 mt-1">{formData.achievements.length}/50 characters</p>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Globe className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Social Media & Pricing</h3>
              <p className="text-purple-200">Your online presence and rates</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Social Media Profiles</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white mb-2 block">Instagram</Label>
                  <Input
                    value={formData.socialMedia.instagram}
                    onChange={(e) => handleInputChange("socialMedia.instagram", e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
                    placeholder="@username or profile URL"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2 block">Twitter/X</Label>
                  <Input
                    value={formData.socialMedia.twitter}
                    onChange={(e) => handleInputChange("socialMedia.twitter", e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
                    placeholder="@username or profile URL"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2 block">TikTok</Label>
                  <Input
                    value={formData.socialMedia.tiktok}
                    onChange={(e) => handleInputChange("socialMedia.tiktok", e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
                    placeholder="@username or profile URL"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2 block">YouTube</Label>
                  <Input
                    value={formData.socialMedia.youtube}
                    onChange={(e) => handleInputChange("socialMedia.youtube", e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
                    placeholder="Channel URL"
                  />
                </div>
              </div>
              <div>
                <Label className="text-white mb-2 block">Other Platform</Label>
                <Input
                  value={formData.socialMedia.other}
                  onChange={(e) => handleInputChange("socialMedia.other", e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
                  placeholder="Any other social media platform"
                />
              </div>
            </div>

            <div>
              <Label className="text-white mb-2 block">Total Follower Count *</Label>
              <select
                value={formData.followerCount}
                onChange={(e) => handleInputChange("followerCount", e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:border-purple-500"
              >
                <option value="" className="bg-slate-800">
                  Select follower range
                </option>
                <option value="10k-50k" className="bg-slate-800">
                  10K - 50K
                </option>
                <option value="50k-100k" className="bg-slate-800">
                  50K - 100K
                </option>
                <option value="100k-500k" className="bg-slate-800">
                  100K - 500K
                </option>
                <option value="500k-1m" className="bg-slate-800">
                  500K - 1M
                </option>
                <option value="1m+" className="bg-slate-800">
                  1M+
                </option>
              </select>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Pricing (USD)</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white mb-2 block">Base Price * (minimum $10)</Label>
                  <Input
                    type="number"
                    min="10"
                    value={formData.basePrice}
                    onChange={(e) => handleInputChange("basePrice", Number(e.target.value))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
                    placeholder="50"
                  />
                  <p className="text-sm text-purple-300 mt-1">Standard video message price</p>
                </div>
                <div>
                  <Label className="text-white mb-2 block">Rush Price * (24hr delivery)</Label>
                  <Input
                    type="number"
                    min="10"
                    value={formData.rushPrice}
                    onChange={(e) => handleInputChange("rushPrice", Number(e.target.value))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500"
                    placeholder="100"
                  />
                  <p className="text-sm text-purple-300 mt-1">Rush delivery premium price</p>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-white mb-2 block">Languages Spoken * (select all that apply)</Label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {languages.map((language) => (
                  <Button
                    key={language}
                    type="button"
                    variant={formData.languages.includes(language) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLanguageToggle(language)}
                    className={
                      formData.languages.includes(language)
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "border-white/20 text-white hover:bg-white/10"
                    }
                  >
                    {language}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-white mb-2 block">Availability *</Label>
              <select
                value={formData.availability}
                onChange={(e) => handleInputChange("availability", e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:border-purple-500"
              >
                <option value="" className="bg-slate-800">
                  Select your availability
                </option>
                <option value="1-3 days" className="bg-slate-800">
                  1-3 days
                </option>
                <option value="3-7 days" className="bg-slate-800">
                  3-7 days
                </option>
                <option value="1-2 weeks" className="bg-slate-800">
                  1-2 weeks
                </option>
                <option value="Flexible" className="bg-slate-800">
                  Flexible
                </option>
              </select>
            </div>

            <div>
              <Label className="text-white mb-2 block">Special Requests (optional)</Label>
              <Textarea
                rows={3}
                value={formData.specialRequests}
                onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500 resize-none"
                placeholder="Any special requirements or limitations for video requests..."
              />
            </div>

            <div>
              <Label className="text-white mb-2 block">
                Why do you want to join Kia Ora? * (minimum 50 characters)
              </Label>
              <Textarea
                rows={3}
                value={formData.motivation}
                onChange={(e) => handleInputChange("motivation", e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-purple-500 resize-none"
                placeholder="Tell us why you're interested in connecting with fans through personalised messages..."
              />
              <p className="text-sm text-purple-300 mt-1">{formData.motivation.length}/50 characters</p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <FileText className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Documents & Verification</h3>
              <p className="text-purple-200">Upload required documents for verification</p>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-white/5 border border-white/20 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Camera className="w-6 h-6 text-purple-400" />
                  <h4 className="text-lg font-semibold text-white">Profile Photo *</h4>
                </div>
                <p className="text-purple-200 mb-4">
                  High-quality headshot that will be used on your profile (JPG, PNG, or WebP, max 5MB)
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, "profilePhoto")
                    }}
                    className="hidden"
                    id="profile-photo"
                  />
                  <label htmlFor="profile-photo" className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                      disabled={uploadingFiles.profilePhoto}
                      asChild
                    >
                      <span>
                        {uploadingFiles.profilePhoto ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Choose File
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                  {formData.profilePhoto && (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">{formData.profilePhoto.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/20 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-purple-400" />
                  <h4 className="text-lg font-semibold text-white">Government ID *</h4>
                </div>
                <p className="text-purple-200 mb-4">
                  Valid government-issued photo ID (driver's license, passport, etc.) for identity verification
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, "idDocument")
                    }}
                    className="hidden"
                    id="id-document"
                  />
                  <label htmlFor="id-document" className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                      disabled={uploadingFiles.idDocument}
                      asChild
                    >
                      <span>
                        {uploadingFiles.idDocument ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Choose File
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                  {formData.idDocument && (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">{formData.idDocument.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/20 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-purple-400" />
                  <h4 className="text-lg font-semibold text-white">Verification Document *</h4>
                </div>
                <p className="text-purple-200 mb-4">
                  Document proving your professional status (press kit, agency contract, verified social media
                  screenshot, etc.)
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, "verificationDocument")
                    }}
                    className="hidden"
                    id="verification-document"
                  />
                  <label htmlFor="verification-document" className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                      disabled={uploadingFiles.verificationDocument}
                      asChild
                    >
                      <span>
                        {uploadingFiles.verificationDocument ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Choose File
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                  {formData.verificationDocument && (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">{formData.verificationDocument.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
              <p className="text-sm text-purple-200">
                <Shield className="w-4 h-4 inline mr-2" />
                All documents are securely stored and used only for verification purposes. Your privacy is our priority.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black">
        <div className="starfield">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className={`star ${i % 10 === 0 ? "diamond" : i % 7 === 0 ? "sapphire" : ""}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
        <Navbar />
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                <CardContent className="p-12">
                  <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
                  <h1 className="text-3xl font-bold text-white mb-4">Application Submitted!</h1>
                  <p className="text-purple-200 mb-6">
                    Thank you for your interest in joining Kia Ora as talent. We've received your application and will
                    review it within 5-7 business days.
                  </p>
                  <p className="text-purple-200 mb-8">
                    You'll receive an email notification once we've completed our review process.
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/")}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Back to Home
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="starfield">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className={`star ${i % 10 === 0 ? "diamond" : i % 7 === 0 ? "sapphire" : ""}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-purple-500/20 text-purple-200 border-purple-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Join Our Platform
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              Become Kia Ora Talent
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
              Join thousands of celebrities earning extra income while connecting with fans through personalised video
              messages.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section - No heading/subheading */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg h-full">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-r ${benefit.color} flex items-center justify-center mx-auto mb-4`}
                    >
                      <div className="text-white">{benefit.icon}</div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                    <p className="text-purple-200 mb-4">{benefit.description}</p>
                    <ul className="space-y-2">
                      {benefit.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-purple-300 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Eligibility Requirements</h2>
                <ul className="space-y-4">
                  {requirements.map((requirement, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-purple-200">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Talent Application</h2>

                {/* Progress Steps */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    {steps.map((step, index) => (
                      <div key={step.step} className="flex items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            index <= currentStep
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                              : "bg-white/10 text-purple-300"
                          }`}
                        >
                          {index < currentStep ? <CheckCircle className="w-5 h-5" /> : step.step}
                        </div>
                        {index < steps.length - 1 && (
                          <div
                            className={`w-full h-1 mx-2 ${
                              index < currentStep ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-white/10"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">{steps[currentStep].title}</h3>
                    <p className="text-purple-200 text-sm">{steps[currentStep].description}</p>
                  </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50 bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep === steps.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !validateStep(currentStep)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4 mr-2" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!validateStep(currentStep)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
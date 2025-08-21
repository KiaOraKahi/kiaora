"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Calendar,
  Tag,
  ArrowLeft
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import MobileNavbar from "@/components/frontend/mobile-navbar"

interface TicketResponse {
  id: string
  message: string
  isFromSupport: boolean
  createdAt: string
}

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  responses: TicketResponse[]
}

export default function TicketTrackingPage() {
  const params = useParams()
  const ticketNumber = params.ticketNumber as string
  
  const [email, setEmail] = useState("")
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error("Please enter your email address")
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/support?ticketNumber=${ticketNumber}&email=${encodeURIComponent(email)}`)
      const result = await response.json()

      if (response.ok) {
        setTicket(result)
        toast.success("Ticket found!")
      } else {
        setTicket(null)
        toast.error(result.error || "Ticket not found")
      }
    } catch (error) {
      console.error("Search error:", error)
      toast.error("Failed to search for ticket")
    } finally {
      setIsSearching(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-blue-500"
      case "in_progress":
        return "bg-yellow-500"
      case "resolved":
        return "bg-green-500"
      case "closed":
        return "bg-gray-500"
      default:
        return "bg-purple-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "normal":
        return "bg-blue-500"
      case "low":
        return "bg-gray-500"
      default:
        return "bg-purple-500"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {isMobile ? <MobileNavbar /> : <Navbar />}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-purple-500/20 text-purple-200 border-purple-500/30">
              <MessageCircle className="w-4 h-4 mr-2" />
              Support Ticket Tracking
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              Track Your Support Ticket
            </h1>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto mb-8">
              Enter your email address to check the status of your support request and view any responses from our team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Form */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-white text-center">Ticket #{ticketNumber}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="text-white">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter the email you used when submitting the ticket"
                      className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <>
                        <Search className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Track Ticket
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Ticket Details */}
      {ticket && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-lg mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-white">{ticket.subject}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Tag className="w-5 h-5 text-purple-400" />
                        <span className="text-purple-200">Ticket Number: {ticket.ticketNumber}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        <span className="text-purple-200">Created: {formatDate(ticket.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-purple-400" />
                        <span className="text-purple-200">Updated: {formatDate(ticket.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Responses */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">Conversation History</h3>
                {ticket.responses.length === 0 ? (
                  <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                    <CardContent className="p-6 text-center">
                      <MessageCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-purple-200">No responses yet. Our support team will get back to you soon!</p>
                    </CardContent>
                  </Card>
                ) : (
                  ticket.responses.map((response, index) => (
                    <motion.div
                      key={response.id}
                      initial={{ opacity: 0, x: response.isFromSupport ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className={`bg-white/10 border-white/20 backdrop-blur-lg ${
                        response.isFromSupport ? "border-l-4 border-l-green-500" : "border-l-4 border-l-blue-500"
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              response.isFromSupport 
                                ? "bg-green-500/20 text-green-400" 
                                : "bg-blue-500/20 text-blue-400"
                            }`}>
                              {response.isFromSupport ? <User className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-semibold text-white">
                                  {response.isFromSupport ? "Support Team" : "You"}
                                </span>
                                <span className="text-sm text-purple-300">
                                  {formatDate(response.createdAt)}
                                </span>
                              </div>
                              <p className="text-purple-200 leading-relaxed">{response.message}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Back to Support */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/contact">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Support
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

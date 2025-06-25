"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Scale, AlertTriangle, Users, CreditCard, Shield, Sparkles } from "lucide-react"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"

const termsSections = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    icon: <FileText className="w-6 h-6" />,
    content: [
      {
        text: "By accessing and using the Kia Ora platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
      },
      {
        text: "These Terms of Service constitute a legally binding agreement between you and Kia Ora. We reserve the right to update these terms at any time, and your continued use of the platform constitutes acceptance of any changes.",
      },
    ],
  },
  {
    id: "platform-use",
    title: "Platform Use",
    icon: <Users className="w-6 h-6" />,
    content: [
      {
        subtitle: "Permitted Use",
        text: "You may use our platform to book personalized video messages from celebrities for personal, non-commercial purposes unless you have purchased a commercial license.",
      },
      {
        subtitle: "Prohibited Activities",
        text: "You may not use our platform for any illegal activities, harassment, spam, or to request content that violates our community guidelines or applicable laws.",
      },
      {
        subtitle: "Account Responsibility",
        text: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
      },
    ],
  },
  {
    id: "booking-terms",
    title: "Booking and Payment Terms",
    icon: <CreditCard className="w-6 h-6" />,
    content: [
      {
        subtitle: "Booking Process",
        text: "When you book a celebrity message, you enter into a contract with both Kia Ora and the celebrity. Payment is required at the time of booking.",
      },
      {
        subtitle: "Delivery Guarantee",
        text: "We guarantee delivery of your video message within the timeframe specified on the celebrity's profile. If not delivered on time, you will receive a full refund.",
      },
      {
        subtitle: "Refund Policy",
        text: "Refunds are available if a celebrity declines your request, fails to deliver within the promised timeframe, or if you're not satisfied with the final product (subject to our satisfaction guarantee terms).",
      },
      {
        subtitle: "Pricing",
        text: "All prices are clearly displayed before booking. Additional fees may apply for rush delivery, extended length, or commercial licensing.",
      },
    ],
  },
  {
    id: "content-rights",
    title: "Content and Intellectual Property",
    icon: <Scale className="w-6 h-6" />,
    content: [
      {
        subtitle: "Your Content",
        text: "You retain ownership of any content you provide (message requests, personal information). By submitting content, you grant us a license to use it to fulfill your booking.",
      },
      {
        subtitle: "Celebrity Content",
        text: "Video messages created by celebrities are for your personal use unless you purchase a commercial license. You may not redistribute, sell, or use the content for commercial purposes without proper licensing.",
      },
      {
        subtitle: "Platform Content",
        text: "All content on our platform, including text, graphics, logos, and software, is owned by Kia Ora and protected by intellectual property laws.",
      },
    ],
  },
  {
    id: "celebrity-terms",
    title: "Celebrity Partner Terms",
    icon: <Users className="w-6 h-6" />,
    content: [
      {
        subtitle: "Independence",
        text: "Celebrities on our platform are independent contractors, not employees of Kia Ora. They set their own rates and availability within our platform guidelines.",
      },
      {
        subtitle: "Content Standards",
        text: "All celebrity content must meet our quality and content standards. Celebrities may decline requests that violate their personal boundaries or our community guidelines.",
      },
      {
        subtitle: "Verification",
        text: "All celebrities undergo a verification process to ensure authenticity. We are not responsible for any misrepresentation by unverified accounts.",
      },
    ],
  },
  {
    id: "limitations",
    title: "Limitations and Disclaimers",
    icon: <AlertTriangle className="w-6 h-6" />,
    content: [
      {
        subtitle: "Service Availability",
        text: "We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. We are not liable for any damages resulting from service interruptions.",
      },
      {
        subtitle: "Content Disclaimer",
        text: "Celebrity messages reflect the personal views of the celebrities and do not necessarily represent the views of Kia Ora. We are not responsible for the content of celebrity messages.",
      },
      {
        subtitle: "Limitation of Liability",
        text: "Our liability is limited to the amount you paid for the specific service. We are not liable for any indirect, incidental, or consequential damages.",
      },
    ],
  },
  {
    id: "termination",
    title: "Account Termination",
    icon: <Shield className="w-6 h-6" />,
    content: [
      {
        subtitle: "Termination by You",
        text: "You may terminate your account at any time by contacting our support team. Pending orders will be fulfilled or refunded according to our standard policies.",
      },
      {
        subtitle: "Termination by Us",
        text: "We reserve the right to terminate accounts that violate our terms of service, engage in fraudulent activity, or abuse our platform.",
      },
      {
        subtitle: "Effect of Termination",
        text: "Upon termination, your access to the platform will be revoked, but you will retain access to any video messages you have already received.",
      },
    ],
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-purple-500/20 text-purple-200 border-purple-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Terms of Service
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
              Please read these terms carefully before using our platform. These terms govern your use of Kia Ora and
              outline your rights and responsibilities.
            </p>
            <div className="text-purple-300">
              <p>Last updated: June 24, 2025</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            {termsSections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <div className="text-white">{section.icon}</div>
                      </div>
                      <h2 className="text-3xl font-bold text-white">{section.title}</h2>
                    </div>

                    <div className="space-y-6">
                      {section.content.map((item, idx) => (
                        <div key={idx}>
                          {"subtitle" in item && item.subtitle && (
                            <h3 className="text-xl font-semibold text-white mb-3">{item.subtitle}</h3>
                          )}
                          <p className="text-purple-200 leading-relaxed">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-white/20 rounded-3xl p-12">
            <Scale className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Questions About Our Terms?</h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              If you have any questions about these Terms of Service, please contact our legal team.
            </p>
            <div className="space-y-4">
              <p className="text-purple-200">
                <strong>Email:</strong> legal@kiaora.com
              </p>
              <p className="text-purple-200">
                <strong>Address:</strong> 1234 Hollywood Blvd, Suite 567, Los Angeles, CA 90028
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Scale,
  AlertTriangle,
  Users,
  Shield,
  Sparkles,
  Clock,
  Eye,
  DollarSign,
  UserCheck,
  Gavel,
  Building,
} from "lucide-react"
import Navbar from "@/components/frontend/navbar"
import Footer from "@/components/frontend/footer"
import { useEffect, useState } from "react"
import MobileNavbar from "@/components/frontend/mobile-navbar"

const termsSections = [
  {
    id: "welcome",
    title: "1. Welcome to Kia Ora Kahi",
    icon: <Sparkles className="w-6 h-6" />,
    content: [
      {
        text: 'The Terms of Use is a contract between you ("You" or "Your") and Kia Ora Kahi NZBN 9429050890835 ("KOK", "We", "Us" or "Our"), and each a "party". The Terms apply to Your use of Our Products as a celebrity. Any use by You of our Website other than as a celebrity will be governed by the User Terms.',
      },
      {
        text: "By accepting the Terms, you agree to comply with them and you also agree to comply with our Privacy Policy, which can be found on Our Website. Our Privacy Policy explains how we collect, use, and share information that We collect.",
      },
    ],
  },
  {
    id: "changes",
    title: "2. Changes to Terms",
    icon: <FileText className="w-6 h-6" />,
    content: [
      {
        text: "KOK may amend these Terms from time to time, such as if we introduce a new product, change functionality, or as required by law. If KOK makes any changes to these Terms, KOK will notify You via email or through the KOK App.",
      },
      {
        text: "Unless the change is material, the revised Terms will become effective 30 days after notice, when You consent to the change or when You accept a new Request, whichever is earlier. The revised Terms will not apply to any Requests that have already been accepted by You before notification by KOK.",
      },
    ],
  },
  {
    id: "relationship",
    title: "3. Our Relationship",
    icon: <Users className="w-6 h-6" />,
    content: [
      {
        text: "Our Products allow Users to connect with Celebrities via Our Website. By completing a KOK Application Form and accepting these Terms, You are applying to be a celebrity on our Website. Your acceptance as a celebrity will be subject to approval by KOK, in its absolute discretion.",
      },
      {
        text: "Acceptance of these Terms creates an independent contractor relationship between You and KOK, and You acknowledge that nothing in this Agreement creates any other relationship (including as an employee, partner, or agent) between You and KOK.",
      },
      {
        text: "The relationship between You and KOK is non-exclusive, meaning that You can provide similar services to third parties and We can engage third parties (including other celebrities) to provide similar services to those contemplated under these Terms.",
      },
    ],
  },
  {
    id: "obligations",
    title: "4. Your Obligations",
    icon: <UserCheck className="w-6 h-6" />,
    content: [
      {
        subtitle: "Age and Information Requirements",
        text: "You confirm that you are either more than 18 years of age, or You are entering these Terms with the supervision and consent of your legal parent or guardian. When registering with KOK, You will not provide KOK any information that is false, inaccurate, or misleading.",
      },
      {
        subtitle: "Request Handling",
        text: "If a User makes a Request for a Video from You, You agree to either: (i) Accept such Request, record the Video, and send the completed Video to KOK; or (ii) Decline such Request (in your discretion) via Our App. We kindly request that You fulfil your obligations under this clause as soon as reasonably possible, but no longer than 7 days following the Request.",
      },
      {
        subtitle: "Marketing Materials Required",
        text: "Before being published as a celebrity on the Website, you must provide to Us the following marketing materials: Your full name; A high-resolution image of yourself; A welcome video of approximately 15-30 seconds; A brief personal bio; and Any other marketing material that You agree to provide to KOK.",
      },
    ],
  },
  {
    id: "video-rules",
    title: "5. Video Rules",
    icon: <Eye className="w-6 h-6" />,
    content: [
      {
        subtitle: "Content Requirements",
        text: "If You accept a Request, You agree to record a Video and return to KOK as per the User's instructions provided by KOK. You must not record an Offensive Video unless it is a light-hearted, fun Roasting video requested by the customer.",
      },
      {
        subtitle: "Video Must Include",
        text: "Each Video must include: Your full name; The User's name (following any pronunciation guide, if provided); The name of any other party as requested by the User; and The purpose for the video, such as a birthday message (if stated by the User).",
      },
      {
        subtitle: "Quality Standards",
        text: "A video must be of sufficient quality (as approved by KOK) and filmed using a smartphone or webcam. The duration of each video depends on the service selected by the User.",
      },
      {
        subtitle: "Revision Policy",
        text: "If You complete a Video but the User is not satisfied with the Video, we will review the Video. If we determine that the general instructions of the User were not adequately followed, We may elect to either request that the Video be re-filmed for no extra cost or wholly or partially refund the customer.",
      },
    ],
  },
  {
    id: "fees-payment",
    title: "6. Fees and Payment",
    icon: <DollarSign className="w-6 h-6" />,
    content: [
      {
        subtitle: "Service Pricing",
        text: "KOK has services with set pricings to be paid by a User for a Video from You within a range determined by KOK.",
      },
      {
        subtitle: "Celebrity Fee Structure",
        text: "We will pay You a Fee for each Completed Video made by You. This Fee will equal 70% of the Price, or as otherwise agreed in writing with KOK. You may also opt not to receive a Fee. For the avoidance of doubt, no Fee will be payable for any declined or expired Request, or any Video that is refunded.",
      },
      {
        subtitle: "Tips",
        text: "100% of customer tips will go directly to the Talent.",
      },
      {
        subtitle: "Payment Method",
        text: "All payments owed to You under this Agreement will be paid by bank transfer in New Zealand dollars to your nominated bank account via Stripe. Any Fees earned will be displayed in the KOK App in the user Dashboard, which can be withdrawn at any time by You via Stripe.",
      },
      {
        subtitle: "Inactive Accounts",
        text: "Your account will be deemed inactive if you have not completed a Video or withdrawn funds within more than 12 months. To keep an Inactive Account open, you must pay a monthly fee of $10 to KOK, which will be deducted from your available funds.",
      },
    ],
  },
  {
    id: "tax-gst",
    title: "7. Tax & GST",
    icon: <Building className="w-6 h-6" />,
    content: [
      {
        text: "KOK does not provide any accounting or tax advice. You are solely responsible for ensuring that you are compliant with all applicable tax laws and regulations. As you may be earning income, we recommend consulting Your accountant or tax professional for guidance on Your tax obligations.",
      },
      {
        text: "Unless otherwise stated, all amounts specified in these Terms are exclusive of any applicable GST. By accepting the Terms, the Parties agree to the terms of the Recipient Created Tax Invoice Agreement in Schedule 1.",
      },
    ],
  },
  {
    id: "content-licenses",
    title: "8. Celebrity Content and Licenses",
    icon: <Scale className="w-6 h-6" />,
    content: [
      {
        subtitle: "Content License to KOK",
        text: "When you upload, submit, store, send or approve Celebrity Content to KOK, You grant to us a perpetual, non-exclusive, royalty-free, fully paid, unlimited, worldwide, sublicensable, and irrevocable license to modify, reproduce, publicly display and to use Your Celebrity Content for operating, marketing or otherwise promoting the Website and/or Products.",
      },
      {
        subtitle: "User License",
        text: "You grant to User and any person named as the intended recipient of the Video by the User a perpetual, non-exclusive, royalty-free, fully paid, worldwide and sublicensable license to use, reproduce, publicly display or otherwise share a Video made by You, solely following the KOK User Terms.",
      },
      {
        subtitle: "Content Standards",
        text: "You represent and warrant that: You own all rights in Your Celebrity Content; Your Celebrity Content does not infringe the rights of any third party; You will not create an Offensive Video; You will not communicate with any User outside of delivering the Video; You will not sell any content or services to Users without KOK approval.",
      },
    ],
  },
  {
    id: "confidentiality",
    title: "9. Confidentiality",
    icon: <Shield className="w-6 h-6" />,
    content: [
      {
        text: "Each party shall only use the other party's confidential information to carry out the purposes of these Celebrity Terms and shall protect the other party's confidential information using the same degree of care it uses to protect its confidential information.",
      },
      {
        text: "KOK's confidential information includes the terms of this Agreement, including any KOK Application Form. Each party may disclose confidential information if required or authorised by any law to disclose that confidential information.",
      },
    ],
  },
  {
    id: "cancellation",
    title: "10. Cancellation and Unavailability",
    icon: <Clock className="w-6 h-6" />,
    content: [
      {
        subtitle: "Voluntary Cancellation",
        text: "You may cease being a Celebrity available for Requests at any time by contacting KOK at admin@kiaorakahi.com or notifying KOK via the app. KOK reserves the right to remove You from being a Celebrity available for Requests for any reason at its sole discretion.",
      },
      {
        subtitle: "Temporary Unavailability",
        text: "If You would like to temporarily be listed as unavailable, please contact KOK at admin@kiaorakahi.com or update your status in the KOK app. KOK reserves the right to temporarily list You as unavailable for any reason at its sole discretion.",
      },
      {
        subtitle: "Removal Factors",
        text: "In determining whether to temporarily list a Celebrity as unavailable or remove a Celebrity from the Website, KOK may take a variety of factors into account including but not limited to demand from Users, content of reviews, time taken to complete Requests, the creation of Offensive Videos or other incidents that do not align with the values of KOK.",
      },
    ],
  },
  {
    id: "liability",
    title: "11. Limitation of Liability and Indemnity",
    icon: <AlertTriangle className="w-6 h-6" />,
    content: [
      {
        subtitle: "Service Disclaimer",
        text: 'To the maximum extent permitted by law, the Website and Products are provided by KOK on an "as is" basis and give no undertaking or assurance in respect of the performance of the Website and Products or its reliability, accuracy, adequacy or completeness.',
      },
      {
        subtitle: "Liability Limitations",
        text: "To the full extent permitted by law, Your and Our liability for all claims, no matter how arising, will not exceed the lesser of $5,000 or the aggregate value of Fees that You receive during the 12 months preceding the claim giving rise to such liability.",
      },
      {
        subtitle: "Indemnification",
        text: "You indemnify KOK against all liability, costs, expenses, loss or damage suffered or incurred by KOK as a result of any third party claim arising from a breach by You of Your obligations, and any warranties and representations made by You under this Agreement.",
      },
    ],
  },
  {
    id: "general",
    title: "12. General Provisions",
    icon: <Gavel className="w-6 h-6" />,
    content: [
      {
        subtitle: "Currency and Governing Law",
        text: "All amounts referenced in and payments made under these Celebrity Terms will be in New Zealand dollars. This Agreement is governed by the laws of New Zealand. Each of the parties irrevocably submits to the non-exclusive jurisdiction of the courts of New Zealand.",
      },
      {
        subtitle: "Disputes and Notices",
        text: "We will handle all complaints made by a User relating to the use of the Products. Any notice served under these Celebrity Terms must be in legible writing, in English, and sent to the recipient at the address, telephone number, or email address specified by the recipient.",
      },
      {
        subtitle: "Assignment and Waiver",
        text: "You may not transfer or assign any rights You may have under these Celebrity Terms without Our prior written consent. We may transfer or assign these Celebrity Terms to a third party, and we will notify You in advance of such a transfer or assignment.",
      },
    ],
  },
]

// Subtle starfield component
const SubtleLuxuryStarfield = () => {
  useEffect(() => {
    const existingStarfield = document.querySelector(".starfield")
    if (existingStarfield) {
      existingStarfield.remove()
    }

    const createStar = () => {
      const star = document.createElement("div")
      const size = Math.random() * 2 + 1
      const type = Math.random()

      if (type > 0.97) {
        star.className = "star diamond"
        star.style.width = `${size * 1.5}px`
        star.style.height = `${size * 1.5}px`
      } else if (type > 0.93) {
        star.className = "star sapphire"
        star.style.width = `${size * 1.2}px`
        star.style.height = `${size * 1.2}px`
      } else {
        star.className = "star"
        star.style.width = `${size}px`
        star.style.height = `${size}px`
      }

      star.style.left = `${Math.random() * 100}%`
      star.style.top = `${Math.random() * 100}%`
      star.style.animationDelay = `${Math.random() * 5}s`

      return star
    }

    const starfield = document.createElement("div")
    starfield.className = "starfield"

    for (let i = 0; i < 60; i++) {
      starfield.appendChild(createStar())
    }

    document.body.appendChild(starfield)

    return () => {
      const starfieldToRemove = document.querySelector(".starfield")
      if (starfieldToRemove && document.body.contains(starfieldToRemove)) {
        document.body.removeChild(starfieldToRemove)
      }
    }
  }, [])

  return null
}

export default function TermsPage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {isMobile ? <MobileNavbar /> : <Navbar />}

      <SubtleLuxuryStarfield />

      {/* Important Notice Banner */}
      <section className="relative pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-lg border border-red-500/30 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-white mb-2">IMPORTANT NOTICE</h3>
                <p className="text-red-200 leading-relaxed">
                  YOU ACKNOWLEDGE THAT KIA ORA KAHI IS A SOCIAL PLATFORM THAT WANTS TO OFFER A SAFE AND POSITIVE USER
                  EXPERIENCE. KOK WILL NOT TOLERATE ANTI-SOCIAL OR INAPPROPRIATE BEHAVIOUR AND WILL TAKE APPROPRIATE
                  ACTION IF AN OFFENSIVE VIDEO IS RECORDED, WHICH MAY INCLUDE BUT IS NOT LIMITED TO PERMANENT REMOVAL
                  FROM THE PLATFORM.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-6 bg-purple-500/20 text-purple-200 border-purple-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Celebrity Terms & Conditions
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
              Terms and Conditions
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
              Please read these terms and conditions carefully as they impose rules, obligations, and other
              responsibilities on you in respect of the use of KOK products. We encourage you to print and/or store a
              copy of these terms.
            </p>
            <div className="text-purple-300">
              <p>Updated 8 August 2025</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-12">
            {termsSections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/15 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                        <div className="text-white">{section.icon}</div>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{section.title}</h2>
                    </div>

                    <div className="space-y-6">
                      {section.content.map((item, idx) => (
                        <div key={idx}>
                          {"subtitle" in item && item.subtitle && (
                            <h3 className="text-xl font-semibold text-white mb-3 text-shadow">{item.subtitle}</h3>
                          )}
                          <p className="text-purple-200 leading-relaxed text-base">{item.text}</p>
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

      {/* Key Definitions Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">Key Definitions</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Completed Video</h4>
                      <p className="text-purple-200 text-sm">
                        A Video that is filmed by You and sent to a User by KOK. Does not include videos where the User
                        requests a refund.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Fee</h4>
                      <p className="text-purple-200 text-sm">
                        The amount paid by KOK to You (70% of the service price).
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Offensive Video</h4>
                      <p className="text-purple-200 text-sm">
                        Content that is unlawful, hateful, discriminatory, defamatory, abusive, threatening, violent,
                        inappropriate, or sexually suggestive.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Request</h4>
                      <p className="text-purple-200 text-sm">
                        A purchase by a User to receive a personalised video from You.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Celebrity Content</h4>
                      <p className="text-purple-200 text-sm">
                        Videos, marketing materials, and other content relating to You as outlined in the agreement.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Products</h4>
                      <p className="text-purple-200 text-sm">
                        The Website, app, or other platforms operated by KOK that allow Celebrities to connect with
                        fans.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-white/20 rounded-3xl p-12">
            <Scale className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 drop-shadow-2xl">
              Questions About Our Terms?
            </h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              If you have any questions about these Terms and Conditions, please contact our team.
            </p>
            <div className="space-y-4">
              <p className="text-purple-200">
                <strong>Email:</strong> admin@kiaorakahi.com
              </p>
              <p className="text-purple-200">
                <strong>Company:</strong> Kia Ora Kahi NZBN 9429050890835
              </p>
              <p className="text-purple-200">
                <strong>Governing Law:</strong> New Zealand
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}

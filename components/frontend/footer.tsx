"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Star,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Heart,
  MessageCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
// import { useContentByKey } from "@/hooks/useContent" // Temporarily disabled

interface Service {
  id: string;
  title: string;
  shortDescription?: string;
  description: string;
}

export default function Footer() {
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Fetch services from API to get actual database IDs
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        const response = await fetch("/api/services");
        const data = await response.json();

        if (response.ok && data.services) {
          setServices(data.services);
        } else {
          console.error("Failed to fetch services for footer:", data.error);
        }
      } catch (error) {
        console.error("Error fetching services for footer:", error);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Use dummy data for now to avoid API issues
  const footerDescription =
    "Connect with your favorite celebrities for personalised video messages, birthday greetings, and exclusive experiences. Making dreams come true, one message at a time.";
  const footerCopyright = "© 2025 Kia Ora Kahi.";

  // Create service links dynamically from fetched services
  const createServiceLinks = () => {
    if (servicesLoading) {
      // Show loading state with generic links
      return [{ name: "Loading services...", href: "/services" }];
    }

    if (services.length === 0) {
      // Fallback links if no services available
      return [{ name: "View all services", href: "/services" }];
    }

    // Use actual service data with database IDs
    return services.map((service) => ({
      name: service.title,
      href: `/services?service=${service.id}`,
    }));
  };

  const footerSections = [
    {
      title: "Services",
      links: createServiceLinks(),
    },
    {
      title: "Support",
      links: [
        { name: "Contact Us", href: "/contact" },
        { name: "FAQ", href: "/faq" },
        // {
        //   name: "Sign Language Support",
        //   href: "/contact?support=sign-language",
        // },
      ],
    },
    {
      title: "Legals",
      links: [
        { name: "Terms and Conditions", href: "/terms" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Community Guidelines", href: "/community-guidelines" },
        { name: "Cookie Policy", href: "/cookies" },
      ],
    },
  ];

  const socialLinks = [
    {
      icon: Facebook,
      href: "https://facebook.com/kiaorakahi",
      label: "Facebook",
    },
    { icon: Twitter, href: "https://twitter.com/kiaorakahi", label: "Twitter" },
    {
      icon: Instagram,
      href: "https://instagram.com/kiaorakahi",
      label: "Instagram",
    },
    {
      icon: Youtube,
      href: "https://youtube.com/@kiaorakahi",
      label: "YouTube",
    },
    {
      icon: MessageCircle,
      href: "https://tiktok.com/@kiaorakahi",
      label: "TikTok",
    },
    {
      icon: Linkedin,
      href: "https://linkedin.com/company/kiaorakahi",
      label: "LinkedIn",
    },
    { icon: Users, href: "https://twitch.tv/kiaorakahi", label: "Twitch" },
    {
      icon: MessageCircle,
      href: "https://discord.gg/kiaorakahi",
      label: "Discord",
    },
  ].filter((social) => social.icon); // Filter out any undefined icons

  try {
    return (
      <footer className="relative bg-gradient-to-b from-slate-900 to-black border-t border-white/10">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.1),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(138,43,226,0.1),transparent)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Newsletter Section */}
          {/* <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="py-16 text-center border-b border-white/10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Stay Updated with Talent News</h2>
          <p className="text-xl text-yellow-200 mb-8 max-w-2xl mx-auto">
            Get the latest updates on new talent, exclusive offers, and platform features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-500"
            />
            <Button className="bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600 text-black font-bold px-8">
              Subscribe
            </Button>
          </div>
        </motion.div> */}

          {/* Main Footer Content */}
          <div className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
              {/* Brand Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="lg:col-span-2"
              >
                <Link href="/" className="flex items-center space-x-2 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-black" />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                    Kia Ora Kahi
                  </span>
                </Link>
                <p className="text-yellow-200 mb-6 leading-relaxed">
                  {footerDescription}
                </p>
                <div className="space-y-3">
                  {/* <div className="flex items-center space-x-3 text-yellow-200">
                    <Mail className="w-5 h-5" />
                    <span>hello@kiaora.com</span>
                  </div>{" "} */}
                  <div className="flex items-center space-x-3 text-yellow-200">
                    <Mail className="w-5 h-5" />
                    <span>admin@kiaorakahi.com</span>
                  </div>
                  {/* <div className="flex items-center space-x-3 text-yellow-200">
                  <Phone className="w-5 h-5" />
                  <span>+1 (555) 123-4567</span>
                </div> */}
                  {/* <div className="flex items-center space-x-3 text-yellow-200">
                  <MapPin className="w-5 h-5" />
                  <span>Los Angeles, CA</span>
                </div> */}
                </div>
              </motion.div>

              {/* Footer Links */}
              {footerSections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-white font-semibold mb-4">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-yellow-200 hover:text-white transition-colors duration-200"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="py-8 border-t border-white/10"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
              {/* Copyright */}
              <div className="flex items-center space-x-2 text-yellow-200">
                <span>{footerCopyright}</span>
              </div>

              {/* Copyright Notice */}
              <div className="text-yellow-200 text-sm">
                <span>
                  All rights reserved. Made with ❤️ for the Pacific community.
                </span>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                {socialLinks && socialLinks.length > 0 ? (
                  socialLinks.map((social) => {
                    const IconComponent = social.icon;
                    if (!IconComponent) return null;
                    return (
                      <Button
                        key={social.label}
                        variant="ghost"
                        size="icon"
                        className="text-yellow-200 hover:text-white hover:bg-white/10 transition-colors duration-200"
                        asChild
                      >
                        <Link href={social.href} aria-label={social.label}>
                          <IconComponent className="w-5 h-5" />
                        </Link>
                      </Button>
                    );
                  })
                ) : (
                  <div className="text-yellow-200 text-sm">
                    Social links coming soon
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    );
  } catch (error) {
    console.error("Footer rendering error:", error);
    return (
      <footer className="relative bg-gradient-to-b from-slate-900 to-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-yellow-200">
            <p>Footer temporarily unavailable</p>
          </div>
        </div>
      </footer>
    );
  }
}

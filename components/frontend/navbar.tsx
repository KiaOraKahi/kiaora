"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, Star, User } from "lucide-react"
import Link from "next/link"
import SearchAutocomplete from "@/components/frontend/search-autocomplete"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Celebrities", href: "/celebrities" },
    { name: "Categories", href: "/categories" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "About", href: "/about" },
  ]

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-slate-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-purple-500/10"
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Kia Ora
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white/80 hover:text-white transition-colors duration-200 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="w-64">
              <SearchAutocomplete placeholder="Search..." className="w-full" />
            </div>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className={`lg:hidden overflow-hidden ${isMobileMenuOpen ? "max-h-96" : "max-h-0"}`}
          initial={false}
          animate={{
            height: isMobileMenuOpen ? "auto" : 0,
            opacity: isMobileMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="py-4 space-y-4 bg-slate-900/95 backdrop-blur-xl rounded-b-2xl border-b border-white/10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="px-4 pt-4 space-y-3 border-t border-white/10">
              <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                Get Started
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  )
}

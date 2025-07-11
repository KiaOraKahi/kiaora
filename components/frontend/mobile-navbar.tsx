"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, Star, User, Search, Users, HelpCircle, LogOut, Crown, LayoutDashboard, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { AuthModal } from "@/components/auth/auth-modal"
import SearchAutocomplete from "@/components/frontend/search-autocomplete"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

export default function MobileNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signin")
  const { data: session, status } = useSession()
  const router = useRouter();


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "About", href: "/about", icon: <Star className="w-5 h-5" /> },
    { name: "Celebrities", href: "/celebrities", icon: <Users className="w-5 h-5" /> },
    { name: "How It Works", href: "/how-it-works", icon: <HelpCircle className="w-5 h-5" /> },
    { name: "Become Talent", href: "/join-celebrity", icon: <Star className="w-5 h-5" /> },
  ]

  // Close menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setShowSearch(false)
  }, [])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
    setIsMobileMenuOpen(false)
  }

  const handleSignInClick = () => {
    setAuthModalTab("signin")
    setShowAuthModal(true)
    setIsMobileMenuOpen(false)
  }

  const handleSignUpClick = () => {
    setAuthModalTab("signup")
    setShowAuthModal(true)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 lg:hidden ${
          isScrolled
            ? "bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-lg"
            : "bg-slate-900/80 backdrop-blur-sm"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Kia Ora Kahi
              </span>
            </Link>

            {/* Mobile actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(!showSearch)}
                className="text-white hover:bg-white/20"
              >
                <Search className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:bg-white/20"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-t border-white/10 pt-4 pb-4"
              >
                <SearchAutocomplete placeholder="Search celebrities..." onSearch={() => setShowSearch(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-xl border-r border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">Kia Ora Kahi</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* User Section */}
                {session && (
                  <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {session.user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{session.user?.name}</p>
                        <p className="text-xs text-white/60 truncate">{session.user?.email}</p>
                        {session.user?.role === "CELEBRITY" && (
                          <span className="inline-flex items-center gap-1 text-xs text-yellow-400 mt-1">
                            <Crown className="w-3 h-3" />
                            Celebrity
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Items */}
                <div className="space-y-2 mb-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 touch-manipulation"
                    >
                      {item.icon}
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mb-8">
                  {session ? (
                    <>
                    <Button
                      variant="outline"
                      className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 touch-manipulation"
                      onClick={() => router.push("/orders")}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      My Orders
                    </Button>
                    {session.user?.role === "CELEBRITY" && (
                      <Button
                        variant="outline"
                        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 touch-manipulation"
                        onClick={() => router.push("/celebrity-dashboard")}
                      >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                      </Button>
                    )}
                    {session.user?.role === "ADMIN" && (
                      <Button
                        variant="outline"
                        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 touch-manipulation"
                        onClick={() => router.push("/admin")}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 touch-manipulation"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 touch-manipulation"
                        onClick={handleSignInClick}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Sign In
                      </Button>
                      <Button
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white touch-manipulation"
                        onClick={handleSignUpClick}
                      >
                        Get Started
                      </Button>
                    </>
                  )}
                </div>

                {/* Quick Links */}
                <div className="pt-6 border-t border-white/10">
                  <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Link
                      href="/help"
                      className="text-purple-200 hover:text-white transition-colors touch-manipulation"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Help Center
                    </Link>
                    <Link
                      href="/pricing"
                      className="text-purple-200 hover:text-white transition-colors touch-manipulation"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Pricing
                    </Link>
                    <Link
                      href="/faq"
                      className="text-purple-200 hover:text-white transition-colors touch-manipulation"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      FAQ
                    </Link>
                    <Link
                      href="/contact"
                      className="text-purple-200 hover:text-white transition-colors touch-manipulation"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Support
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab={authModalTab} />
    </>
  )
}
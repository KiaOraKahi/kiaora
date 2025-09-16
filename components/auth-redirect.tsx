"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AuthRedirectProps {
  children: React.ReactNode
  requiredRole?: "ADMIN" | "CELEBRITY" | "FAN"
  redirectTo?: string
}

export default function AuthRedirect({ 
  children, 
  requiredRole, 
  redirectTo 
}: AuthRedirectProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (requiredRole && session.user?.role !== requiredRole) {
      // Redirect based on user's actual role
      switch (session.user?.role) {
        case "ADMIN":
          router.push("/admin/dashboard")
          break
        case "CELEBRITY":
          router.push("/celebrity-dashboard")
          break
        case "FAN":
          router.push("/")
          break
        default:
          router.push(redirectTo || "/")
      }
      return
    }
  }, [session, status, requiredRole, redirectTo, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (requiredRole && session.user?.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}

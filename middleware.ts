import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin routes protection
    if (pathname.startsWith("/admin")) {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/login", req.url))
      }
    }

    // Celebrity dashboard protection
    if (pathname.startsWith("/celebrity-dashboard")) {
      if (!token || token.role !== "CELEBRITY") {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    // API routes protection
    if (pathname.startsWith("/api/admin")) {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    if (pathname.startsWith("/api/celebrity")) {
      if (!token || token.role !== "CELEBRITY") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Public routes that don't require authentication
        const publicRoutes = [
          "/",
          "/auth/signin",
          "/auth/signup",
          "/auth/forgot-password",
          "/auth/reset-password",
          "/auth/error",
          "/celebrities",
          "/about",
          "/contact",
          "/terms",
          "/privacy",
          "/join-celebrity",
          "/admin/login"
        ]

        if (publicRoutes.includes(pathname)) {
          return true
        }

        // All other routes require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/celebrity-dashboard/:path*",
    "/api/admin/:path*",
    "/api/celebrity/:path*",
    "/api/user/:path*"
  ]
}

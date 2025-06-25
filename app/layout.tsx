import type React from "react"
import type { Metadata, Viewport } from "next/dist/lib/metadata/types/metadata-interface"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kia Ora - Connect with Celebrities",
  description: "Book personalized messages from your favorite celebrities",
  keywords: ["celebrities", "personalized messages", "video messages", "celebrity booking"],
  authors: [{ name: "Kia Ora Team" }],
  creator: "Kia Ora",
  publisher: "Kia Ora",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://kiaora.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kia Ora - Connect with Celebrities",
    description: "Book personalized messages from your favorite celebrities",
    url: "https://kiaora.com",
    siteName: "Kia Ora",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kia Ora - Celebrity Messages",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kia Ora - Connect with Celebrities",
    description: "Book personalized messages from your favorite celebrities",
    images: ["/og-image.png"],
    creator: "@kiaora",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#8b5cf6" },
    { media: "(prefers-color-scheme: dark)", color: "#8b5cf6" },
  ],
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Kia Ora" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={`${inter.className} touch-manipulation`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
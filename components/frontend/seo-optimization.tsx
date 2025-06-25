"use client"

import Head from "next/head"
import { usePathname } from "next/navigation"

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  type?: "website" | "article" | "profile"
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
}

const defaultSEO = {
  title: "Kia Ora - Personalized Celebrity Messages",
  description:
    "Get personalized video messages from your favorite celebrities. Perfect for birthdays, anniversaries, graduations, and special occasions. Book now!",
  keywords: [
    "celebrity messages",
    "personalized videos",
    "celebrity cameo",
    "birthday messages",
    "celebrity greetings",
    "custom videos",
    "celebrity endorsements",
    "special occasions",
    "personalized gifts",
    "celebrity bookings",
  ],
  image: "/og-image.jpg",
  type: "website" as const,
}

export default function SEOOptimization({
  title,
  description,
  keywords = [],
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
}: SEOProps) {
  const pathname = usePathname()
  const baseUrl = "https://kiaora.com"
  const fullUrl = `${baseUrl}${pathname}`

  const seoTitle = title ? `${title} | Kia Ora` : defaultSEO.title
  const seoDescription = description || defaultSEO.description
  const seoKeywords = [...defaultSEO.keywords, ...keywords].join(", ")
  const seoImage = image || defaultSEO.image
  const fullImageUrl = seoImage.startsWith("http") ? seoImage : `${baseUrl}${seoImage}`

  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kia Ora",
    description: seoDescription,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      "https://twitter.com/kiaora",
      "https://facebook.com/kiaora",
      "https://instagram.com/kiaora",
      "https://linkedin.com/company/kiaora",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-555-KIA-ORA1",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Celebrity Lane",
      addressLocality: "Los Angeles",
      addressRegion: "CA",
      postalCode: "90210",
      addressCountry: "US",
    },
  }

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: pathname
      .split("/")
      .filter(Boolean)
      .map((segment, index, array) => ({
        "@type": "ListItem",
        position: index + 1,
        name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
        item: `${baseUrl}/${array.slice(0, index + 1).join("/")}`,
      })),
  }

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content={author || "Kia Ora Team"} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={seoTitle} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Kia Ora" />
      <meta property="og:locale" content="en_US" />

      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      {section && <meta property="article:section" content={section} />}
      {tags.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@kiaora" />
      <meta name="twitter:creator" content="@kiaora" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={seoTitle} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#8b5cf6" />
      <meta name="msapplication-TileColor" content="#8b5cf6" />
      <meta name="application-name" content="Kia Ora" />
      <meta name="apple-mobile-web-app-title" content="Kia Ora" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="format-detection" content="telephone=no" />

      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://api.kiaora.com" />
      <link rel="preconnect" href="https://cdn.kiaora.com" />

      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://connect.facebook.net" />
      <link rel="dns-prefetch" href="https://www.youtube.com" />
    </Head>
  )
}
import { prisma } from "@/lib/prisma"

export interface ContentItem {
  id: string
  key: string
  value: string
  type: string
  category: string
  status: string
  description?: string
  updatedAt: string
}

// Get content by key
export async function getContentByKey(key: string): Promise<string | null> {
  try {
    const content = await prisma.content.findUnique({
      where: { key, status: "active" }
    })
    return content?.value || null
  } catch (error) {
    console.error(`Error fetching content for key ${key}:`, error)
    // Return fallback content if database table doesn't exist
    return fallbackContent[key as keyof typeof fallbackContent] || null
  }
}

// Get content by category
export async function getContentByCategory(category: string): Promise<ContentItem[]> {
  try {
    const content = await prisma.content.findMany({
      where: { 
        category,
        status: "active"
      },
      orderBy: { updatedAt: "desc" }
    })
    return content
  } catch (error) {
    console.error(`Error fetching content for category ${category}:`, error)
    // Return empty array if database table doesn't exist
    return []
  }
}

// Get multiple content items by keys
export async function getContentByKeys(keys: string[]): Promise<Record<string, string>> {
  try {
    const content = await prisma.content.findMany({
      where: { 
        key: { in: keys },
        status: "active"
      }
    })
    
    const contentMap: Record<string, string> = {}
    content.forEach(item => {
      contentMap[item.key] = item.value
    })
    
    return contentMap
  } catch (error) {
    console.error("Error fetching content by keys:", error)
    return {}
  }
}

// Get all active content
export async function getAllActiveContent(): Promise<ContentItem[]> {
  try {
    const content = await prisma.content.findMany({
      where: { status: "active" },
      orderBy: { updatedAt: "desc" }
    })
    return content
  } catch (error) {
    console.error("Error fetching all active content:", error)
    return []
  }
}

// Fallback content for when database content is not available
export const fallbackContent = {
  "homepage.hero.title": "Kia Ora",
  "homepage.hero.subtitle": "Connect with your favorite celebrities",
  "homepage.hero.description": "Get personalized video messages from the stars you love",
  "homepage.cta.primary": "Browse Celebrities",
  "homepage.cta.secondary": "Learn More",
  "homepage.how-it-works.title": "How It Works",
  "homepage.how-it-works.step1.title": "Browse & Discover",
  "homepage.how-it-works.step1.description": "Explore our verified celebrities across entertainment, sports, and more",
  "homepage.how-it-works.step2.title": "Personalise Your Request",
  "homepage.how-it-works.step2.description": "Tell us exactly what you want and who it's for",
  "homepage.how-it-works.step3.title": "Secure Payment",
  "homepage.how-it-works.step3.description": "Complete your booking with our secure payment system",
  "homepage.how-it-works.step4.title": "Receive Your Video",
  "homepage.how-it-works.step4.description": "Get your personalised video within the promised timeframe",
  "homepage.featured.title": "Featured Celebrities",
  "homepage.featured.subtitle": "Discover amazing talent ready to create your perfect message",
  "homepage.services.title": "Our Services",
  "homepage.services.subtitle": "Find the perfect celebrity for any occasion",
  "footer.copyright": "© 2025 Kia Ora. All rights reserved.",
  "footer.description": "Connect with celebrities for personalized video messages",
  "nav.home": "Home",
  "nav.about": "About",
  "nav.celebrities": "Celebrities",
  "nav.how-it-works": "How It Works",
  "nav.pricing": "Pricing",
  "nav.contact": "Contact",
  "ui.buttons.submit": "Submit",
  "ui.buttons.cancel": "Cancel",
  "ui.buttons.browse": "Browse",
  "ui.buttons.learn-more": "Learn More"
}

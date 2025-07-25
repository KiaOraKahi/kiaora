// Base celebrity data from database (matching your Prisma schema)
export interface Celebrity {
  id: string
  userId: string
  bio?: string | null
  longBio?: string | null
  category?: string | null
  price?: number | null
  pricePersonal?: number | null
  priceBusiness?: number | null
  priceCharity?: number | null
  rating?: number | null
  averageRating?: number | null
  totalReviews: number
  completionRate: number
  responseTime: string
  isActive: boolean
  verified: boolean
  featured: boolean
  coverImage?: string | null
  tags: string[]
  achievements: string[]
  nextAvailable?: string | null
  createdAt: Date
  updatedAt: Date
  // User relation for getting the name
  user: {
    id: string
    name?: string | null
    image?: string | null
  }
}

// Service sample with celebrity data
export interface ServiceSample {
  celebrityId?: string
  celebrity: string // Fallback name
  thumbnail: string // Fallback thumbnail
  // Populated from database if celebrityId exists
  realCelebrity?: Celebrity
}

// Service talent with celebrity data
export interface ServiceTalent {
  celebrityId?: string
  name: string // Fallback name
  image: string // Fallback image
  // Populated from database if celebrityId exists
  realCelebrity?: Celebrity
}

// Enhanced service data with populated celebrity info
export interface EnhancedServiceData {
  id: string
  numericId: number
  icon: string
  title: string
  description: string
  shortDescription: string
  fullDescription: string
  color: string
  startingPrice: number
  currency: string
  duration: string
  deliveryTime: string
  asapPrice: number
  asapDeliveryTime: string
  features: string[]
  popular: boolean
  samples: ServiceSample[]
  talents: ServiceTalent[]
}

// API response types
export interface ServicesApiResponse {
  services: EnhancedServiceData[]
  totalCelebrities: number
  fallbackDataUsed: boolean
  stats: {
    total: number
    active: number
    verified: number
  }
}

export interface ServiceApiResponse {
  service: EnhancedServiceData | null
  fallbackDataUsed: boolean
}

// Database query options
export interface ServiceQueryOptions {
  includeCelebrities?: boolean
  activeOnly?: boolean
  limit?: number
  categories?: string[]
}

// Admin service management types
export interface ServiceFormData {
  title: string
  description: string
  shortDescription: string
  fullDescription: string
  icon: string
  color: string
  startingPrice: number
  currency: string
  duration: string
  deliveryTime: string
  asapPrice: number
  asapDeliveryTime: string
  features: string[]
  popular: boolean
  isActive: boolean
}

// Service creation/update payload
export interface ServicePayload extends ServiceFormData {
  samples?: ServiceSample[]
  talents?: ServiceTalent[]
}

// Service statistics
export interface ServiceStats {
  totalServices: number
  activeServices: number
  popularServices: number
  averagePrice: number
  totalBookings: number
  revenue: number
}

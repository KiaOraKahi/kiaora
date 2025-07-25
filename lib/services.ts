import { prisma } from "@/lib/prisma"
import { servicesData, type ServiceData } from "@/lib/services-data"
import type {
  Celebrity,
  EnhancedServiceData,
  ServiceQueryOptions,
  ServiceSample,
  ServiceTalent,
} from "@/types/services"

// Fetch celebrities from database with user relation for names
export async function getCelebrities(options: ServiceQueryOptions = {}): Promise<Celebrity[]> {
  try {
    const celebrities = await prisma.celebrity.findMany({
      where: {
        ...(options.activeOnly && { isActive: true }),
        ...(options.categories && {
          category: {
            in: options.categories,
          },
        }),
      },
      take: options.limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return celebrities.map((celebrity) => ({
      id: celebrity.id,
      userId: celebrity.userId,
      bio: celebrity.bio,
      longBio: celebrity.longBio,
      category: celebrity.category,
      price: celebrity.price,
      pricePersonal: celebrity.pricePersonal,
      priceBusiness: celebrity.priceBusiness,
      priceCharity: celebrity.priceCharity,
      rating: celebrity.rating,
      averageRating: celebrity.averageRating,
      totalReviews: celebrity.totalReviews,
      completionRate: celebrity.completionRate,
      responseTime: celebrity.responseTime,
      isActive: celebrity.isActive,
      verified: celebrity.verified,
      featured: celebrity.featured,
      coverImage: celebrity.coverImage,
      tags: celebrity.tags,
      achievements: celebrity.achievements,
      nextAvailable: celebrity.nextAvailable,
      createdAt: celebrity.createdAt,
      updatedAt: celebrity.updatedAt,
      user: celebrity.user,
    }))
  } catch (error) {
    console.error("Error fetching celebrities:", error)
    return []
  }
}

// Populate service samples with real celebrity data
async function populateServiceSamples(samples: ServiceData["samples"]): Promise<ServiceSample[]> {
  const celebrities = await getCelebrities({ activeOnly: true })

  return samples.map((sample) => {
    // If celebrityId is provided, try to find the real celebrity
    if (sample.celebrityId) {
      const realCelebrity = celebrities.find((c) => c.id === sample.celebrityId)
      if (realCelebrity) {
        return {
          ...sample,
          celebrity: realCelebrity.user.name || "Unknown Celebrity",
          thumbnail: realCelebrity.user.image || realCelebrity.coverImage || sample.thumbnail,
          realCelebrity,
        }
      }
    }

    // Try to find celebrity by name match (fallback)
    const matchedCelebrity = celebrities.find((c) => {
      const celebrityName = c.user.name || ""
      return (
        celebrityName.toLowerCase().includes(sample.celebrity.toLowerCase()) ||
        sample.celebrity.toLowerCase().includes(celebrityName.toLowerCase())
      )
    })

    if (matchedCelebrity) {
      return {
        ...sample,
        celebrity: matchedCelebrity.user.name || sample.celebrity,
        thumbnail: matchedCelebrity.user.image || matchedCelebrity.coverImage || sample.thumbnail,
        realCelebrity: matchedCelebrity,
      }
    }

    // Return fallback data
    return sample
  })
}

// Populate service talents with real celebrity data
async function populateServiceTalents(talents: ServiceData["talents"]): Promise<ServiceTalent[]> {
  const celebrities = await getCelebrities({ activeOnly: true })

  return talents.map((talent) => {
    // If celebrityId is provided, try to find the real celebrity
    if (talent.celebrityId) {
      const realCelebrity = celebrities.find((c) => c.id === talent.celebrityId)
      if (realCelebrity) {
        return {
          ...talent,
          name: realCelebrity.user.name || "Unknown Celebrity",
          image: realCelebrity.user.image || realCelebrity.coverImage || talent.image,
          realCelebrity,
        }
      }
    }

    // Try to find celebrity by name match (fallback)
    const matchedCelebrity = celebrities.find((c) => {
      const celebrityName = c.user.name || ""
      return (
        celebrityName.toLowerCase().includes(talent.name.toLowerCase()) ||
        talent.name.toLowerCase().includes(celebrityName.toLowerCase())
      )
    })

    if (matchedCelebrity) {
      return {
        ...talent,
        name: matchedCelebrity.user.name || talent.name,
        image: matchedCelebrity.user.image || matchedCelebrity.coverImage || talent.image,
        realCelebrity: matchedCelebrity,
      }
    }

    // Return fallback data
    return talent
  })
}

// Get all services with populated celebrity data
export async function getServicesWithCelebrities(options: ServiceQueryOptions = {}): Promise<{
  services: EnhancedServiceData[]
  totalCelebrities: number
  fallbackDataUsed: boolean
}> {
  try {
    const celebrities = await getCelebrities(options)
    const totalCelebrities = celebrities.length
    let fallbackDataUsed = false

    const enhancedServices = await Promise.all(
      servicesData.map(async (service) => {
        const populatedSamples = await populateServiceSamples(service.samples)
        const populatedTalents = await populateServiceTalents(service.talents)

        // Check if any fallback data is being used
        const samplesUsingFallback = populatedSamples.some((s) => !s.realCelebrity)
        const talentsUsingFallback = populatedTalents.some((t) => !t.realCelebrity)

        if (samplesUsingFallback || talentsUsingFallback) {
          fallbackDataUsed = true
        }

        return {
          ...service,
          samples: populatedSamples,
          talents: populatedTalents,
        }
      }),
    )

    return {
      services: enhancedServices,
      totalCelebrities,
      fallbackDataUsed,
    }
  } catch (error) {
    console.error("Error getting services with celebrities:", error)

    // Return fallback data on error
    return {
      services: servicesData.map((service) => ({
        ...service,
        samples: service.samples,
        talents: service.talents,
      })),
      totalCelebrities: 0,
      fallbackDataUsed: true,
    }
  }
}

// Get single service with populated celebrity data
export async function getServiceWithCelebrities(serviceId: string): Promise<{
  service: EnhancedServiceData | null
  fallbackDataUsed: boolean
}> {
  try {
    const service = servicesData.find((s) => s.id === serviceId)
    if (!service) {
      return { service: null, fallbackDataUsed: false }
    }

    const populatedSamples = await populateServiceSamples(service.samples)
    const populatedTalents = await populateServiceTalents(service.talents)

    // Check if any fallback data is being used
    const samplesUsingFallback = populatedSamples.some((s) => !s.realCelebrity)
    const talentsUsingFallback = populatedTalents.some((t) => !t.realCelebrity)
    const fallbackDataUsed = samplesUsingFallback || talentsUsingFallback

    return {
      service: {
        ...service,
        samples: populatedSamples,
        talents: populatedTalents,
      },
      fallbackDataUsed,
    }
  } catch (error) {
    console.error("Error getting service with celebrities:", error)

    // Return fallback data on error
    const service = servicesData.find((s) => s.id === serviceId)
    return {
      service: service
        ? {
            ...service,
            samples: service.samples,
            talents: service.talents,
          }
        : null,
      fallbackDataUsed: true,
    }
  }
}

// Get celebrities by service category (for filtering)
export async function getCelebritiesByService(serviceId: string): Promise<Celebrity[]> {
  try {
    // You can implement category-based filtering here
    // For now, return all active celebrities
    return await getCelebrities({ activeOnly: true })
  } catch (error) {
    console.error("Error getting celebrities by service:", error)
    return []
  }
}

// NEW: Get celebrity statistics - This was missing!
export async function getCelebrityStats() {
  try {
    const [total, active, verified] = await Promise.all([
      prisma.celebrity.count(),
      prisma.celebrity.count({ where: { isActive: true } }),
      prisma.celebrity.count({ where: { verified: true } }),
    ])

    return { total, active, verified }
  } catch (error) {
    console.error("Error getting celebrity stats:", error)
    return { total: 0, active: 0, verified: 0 }
  }
}

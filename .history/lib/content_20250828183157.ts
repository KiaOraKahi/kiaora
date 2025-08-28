import { prisma } from "./prisma"

export interface ContentItem {
  id: string
  key: string
  value: string
  type: string
  category: string
  status: string
  description?: string
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
}

export async function getContentByKey(key: string): Promise<string | null> {
  try {
    const content = await prisma.content.findUnique({
      where: { key, status: "active" }
    })
    return content?.value || null
  } catch (error) {
    console.error(`Error fetching content for key ${key}:`, error)
    return null
  }
}

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
    return []
  }
}

export async function getAllContent(): Promise<ContentItem[]> {
  try {
    const content = await prisma.content.findMany({
      orderBy: { updatedAt: "desc" }
    })
    return content
  } catch (error) {
    console.error("Error fetching all content:", error)
    return []
  }
}

export async function createContent(data: {
  key: string
  value: string
  type: string
  category: string
  description?: string
  updatedBy?: string
}): Promise<ContentItem | null> {
  try {
    const content = await prisma.content.create({
      data: {
        ...data,
        status: "active"
      }
    })
    return content
  } catch (error) {
    console.error("Error creating content:", error)
    return null
  }
}

export async function updateContent(
  id: string,
  data: {
    key?: string
    value?: string
    type?: string
    category?: string
    description?: string
    status?: string
    updatedBy?: string
  }
): Promise<ContentItem | null> {
  try {
    const content = await prisma.content.update({
      where: { id },
      data
    })
    return content
  } catch (error) {
    console.error("Error updating content:", error)
    return null
  }
}

export async function deleteContent(id: string): Promise<boolean> {
  try {
    await prisma.content.delete({
      where: { id }
    })
    return true
  } catch (error) {
    console.error("Error deleting content:", error)
    return false
  }
}

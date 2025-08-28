import { useState, useEffect } from 'react'
import { fallbackContent } from '@/lib/content-utils'

export function useContent(keys: string[]) {
  const [content, setContent] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/content/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ keys }),
        })

        if (response.ok) {
          const data = await response.json()
          setContent(data)
        } else {
          // Fallback to static content
          const fallbackData: Record<string, string> = {}
          keys.forEach(key => {
            fallbackData[key] = fallbackContent[key as keyof typeof fallbackContent] || key
          })
          setContent(fallbackData)
        }
      } catch (error) {
        console.error('Error fetching content:', error)
        // Fallback to static content
        const fallbackData: Record<string, string> = {}
        keys.forEach(key => {
          fallbackData[key] = fallbackContent[key as keyof typeof fallbackContent] || key
        })
        setContent(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [keys.join(',')])

  return { content, loading }
}

export function useContentByKey(key: string) {
  const { content, loading } = useContent([key])
  return { 
    content: content[key] || fallbackContent[key as keyof typeof fallbackContent] || key,
    loading 
  }
}

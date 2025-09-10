import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format rating to 1 decimal place
 */
export function formatRating(rating: number | string | null | undefined): string {
  if (rating === null || rating === undefined) return "0.0"
  const numRating = typeof rating === "string" ? parseFloat(rating) : rating
  if (isNaN(numRating)) return "0.0"
  return numRating.toFixed(1)
}
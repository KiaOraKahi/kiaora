export function isValidUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isLikelyBlobUrl(url?: string | null): boolean {
  if (!isValidUrl(url)) return false;
  try {
    const u = new URL(url as string);
    return (
      u.hostname.endsWith("vercel-storage.com") ||
      u.hostname.includes("blob") // broad match to avoid false negatives across regions
    );
  } catch {
    return false;
  }
}

export function safeMediaSrc(preferred?: string | null, fallback: string = "/placeholder-video.mp4"): string {
  return isValidUrl(preferred) ? (preferred as string) : fallback;
}
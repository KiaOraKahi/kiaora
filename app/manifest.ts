import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kia Ora - Celebrity Messages",
    short_name: "Kia Ora",
    description: "Book personalized messages from your favorite celebrities",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#8b5cf6",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["entertainment", "social"],
    orientation: "portrait-primary",
    scope: "/",
    lang: "en",
  }
}
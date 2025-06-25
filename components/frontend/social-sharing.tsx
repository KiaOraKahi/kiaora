"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface AccessibilitySettings {
  reducedMotion: boolean
  highContrast: boolean
  largeText: boolean
  screenReader: boolean
  keyboardNavigation: boolean
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void
  announceToScreenReader: (message: string) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider")
  }
  return context
}

export default function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: false,
  })

  // Detect user preferences
  useEffect(() => {
    const detectPreferences = () => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const highContrast = window.matchMedia("(prefers-contrast: high)").matches
      const screenReader =
        window.navigator.userAgent.includes("NVDA") ||
        window.navigator.userAgent.includes("JAWS") ||
        window.speechSynthesis !== undefined

      setSettings((prev) => ({
        ...prev,
        reducedMotion,
        highContrast,
        screenReader,
      }))
    }

    detectPreferences()

    // Listen for preference changes
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const contrastQuery = window.matchMedia("(prefers-contrast: high)")

    motionQuery.addEventListener("change", detectPreferences)
    contrastQuery.addEventListener("change", detectPreferences)

    return () => {
      motionQuery.removeEventListener("change", detectPreferences)
      contrastQuery.removeEventListener("change", detectPreferences)
    }
  }, [])

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement

    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty("--motion-duration", "0.01ms")
      root.classList.add("reduce-motion")
    } else {
      root.style.removeProperty("--motion-duration")
      root.classList.remove("reduce-motion")
    }

    // High contrast
    if (settings.highContrast) {
      root.classList.add("high-contrast")
    } else {
      root.classList.remove("high-contrast")
    }

    // Large text
    if (settings.largeText) {
      root.classList.add("large-text")
    } else {
      root.classList.remove("large-text")
    }

    // Keyboard navigation
    if (settings.keyboardNavigation) {
      root.classList.add("keyboard-navigation")
    } else {
      root.classList.remove("keyboard-navigation")
    }
  }, [settings])

  // Keyboard navigation detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setSettings((prev) => ({ ...prev, keyboardNavigation: true }))
      }
    }

    const handleMouseDown = () => {
      setSettings((prev) => ({ ...prev, keyboardNavigation: false }))
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleMouseDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleMouseDown)
    }
  }, [])

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))

    // Save to localStorage
    localStorage.setItem(
      "accessibility-settings",
      JSON.stringify({
        ...settings,
        [key]: value,
      }),
    )
  }

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement("div")
    announcement.setAttribute("aria-live", "polite")
    announcement.setAttribute("aria-atomic", "true")
    announcement.className = "sr-only"
    announcement.textContent = message

    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  // Load saved settings
  useEffect(() => {
    const saved = localStorage.getItem("accessibility-settings")
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved)
        setSettings((prev) => ({ ...prev, ...parsedSettings }))
      } catch (error) {
        console.error("Failed to parse accessibility settings:", error)
      }
    }
  }, [])

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, announceToScreenReader }}>
      {children}

      {/* Screen Reader Announcements */}
      <div id="sr-announcements" className="sr-only" aria-live="polite" aria-atomic="true" />

      {/* Skip Links */}
      <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50">
        <a
          href="#main-content"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>
      </div>
    </AccessibilityContext.Provider>
  )
}
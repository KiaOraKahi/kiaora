"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Toast {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
  toasts: Toast[]
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }

    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    const duration = toast.duration || 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const getIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case "info":
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getColors = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "border-green-500/30 bg-green-500/10"
      case "error":
        return "border-red-500/30 bg-red-500/10"
      case "warning":
        return "border-yellow-500/30 bg-yellow-500/10"
      case "info":
        return "border-blue-500/30 bg-blue-500/10"
    }
  }

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`p-4 rounded-lg border backdrop-blur-lg ${getColors(toast.type)} shadow-lg`}
            >
              <div className="flex items-start gap-3">
                {getIcon(toast.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold text-sm">{toast.title}</h4>
                  {toast.description && (
                    <p className="text-white/80 text-xs mt-1 leading-relaxed">{toast.description}</p>
                  )}
                  {toast.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={toast.action.onClick}
                      className="mt-2 h-7 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      {toast.action.label}
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeToast(toast.id)}
                  className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/20"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
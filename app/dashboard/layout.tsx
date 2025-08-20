import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "User Dashboard - Kia Ora",
  description: "Manage your celebrity video bookings, payments, and profile settings",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 
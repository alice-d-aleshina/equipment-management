"use client"

import { AuthProvider } from "@/lib/context/AuthContext"
import { NotificationProvider } from "@/lib/context/NotificationContext"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-gray-100">
          <div className="container mx-auto py-10">
            {children}
          </div>
        </div>
      </NotificationProvider>
    </AuthProvider>
  )
} 
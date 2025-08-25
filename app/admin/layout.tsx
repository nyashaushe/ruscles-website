'use client'

import type React from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { NotificationProvider } from "@/components/admin/notification-provider"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Show loading spinner while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Don't render admin layout if not authenticated
  if (status === "unauthenticated") {
    return null
  }

  return (
    <SidebarProvider>
      <NotificationProvider>
        <AdminSidebar />
        <SidebarInset>
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6 space-y-6">{children}</main>
        </SidebarInset>
      </NotificationProvider>
    </SidebarProvider>
  )
}

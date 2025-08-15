import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { NotificationProvider } from "@/components/admin/notification-provider"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

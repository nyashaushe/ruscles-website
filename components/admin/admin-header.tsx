"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

export function AdminHeader() {
  const notifications = [
    {
      id: 1,
      title: "New inquiry received",
      message: "John Mukamuri submitted an electrical wiring request",
      time: "5 minutes ago",
      unread: true,
    },
    {
      id: 2,
      title: "Project completed",
      message: "Cold room installation at Fresh Foods completed",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 3,
      title: "Payment received",
      message: "Payment of $2,500 received from Bella Vista Restaurant",
      time: "1 day ago",
      unread: false,
    },
  ]

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search inquiries, customers, projects..."
            className="pl-8 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Add */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Add</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Create New</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>New Inquiry</DropdownMenuItem>
            <DropdownMenuItem>New Project</DropdownMenuItem>
            <DropdownMenuItem>New Customer</DropdownMenuItem>
            <DropdownMenuItem>New Blog Post</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="relative bg-transparent">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <Badge variant="secondary">{unreadCount} new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex-col items-start p-3 cursor-pointer">
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                    </div>
                    {notification.unread && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-2"></div>}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-blue-600 cursor-pointer">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

"use client"

import type * as React from "react"
import {
  BarChart3,
  Building2,
  Calendar,
  FileText,
  Home,
  MessageSquare,
  Settings,
  Users,
  Wrench,
  Zap,
  ChevronUp,
  User2,
  LogOut,
  Bell,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const data = {
  user: {
    name: "Admin User",
    email: "admin@rusclesinvestments.com",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: Home,
    },
    {
      title: "Inquiries",
      url: "/admin/inquiries",
      icon: MessageSquare,
      badge: "12",
      items: [
        {
          title: "All Inquiries",
          url: "/admin/inquiries",
        },
        {
          title: "Pending",
          url: "/admin/inquiries?status=pending",
        },
        {
          title: "In Progress",
          url: "/admin/inquiries?status=in-progress",
        },
        {
          title: "Completed",
          url: "/admin/inquiries?status=completed",
        },
      ],
    },
    {
      title: "Projects",
      url: "/admin/projects",
      icon: Wrench,
      items: [
        {
          title: "All Projects",
          url: "/admin/projects",
        },
        {
          title: "Active Projects",
          url: "/admin/projects?status=active",
        },
        {
          title: "Completed Projects",
          url: "/admin/projects?status=completed",
        },
      ],
    },
    {
      title: "Customers",
      url: "/admin/customers",
      icon: Users,
    },
    {
      title: "Services",
      url: "/admin/services",
      icon: Zap,
      items: [
        {
          title: "Electrical Services",
          url: "/admin/services/electrical",
        },
        {
          title: "HVAC Services",
          url: "/admin/services/hvac",
        },
        {
          title: "Refrigeration",
          url: "/admin/services/refrigeration",
        },
      ],
    },
    {
      title: "Content",
      url: "/admin/content",
      icon: FileText,
      items: [
        {
          title: "Blog Posts",
          url: "/admin/content/blog",
        },
        {
          title: "Testimonials",
          url: "/admin/content/testimonials",
        },
        {
          title: "Portfolio",
          url: "/admin/content/portfolio",
        },
        {
          title: "Pages",
          url: "/admin/content/pages",
        },
      ],
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: BarChart3,
    },
    {
      title: "Calendar",
      url: "/admin/calendar",
      icon: Calendar,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },
    {
      title: "Company Profile",
      url: "/admin/company",
      icon: Building2,
    },
  ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Zap className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Ruscles Admin</span>
                  <span className="truncate text-xs">Management Portal</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gray-200">
                    <User2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{data.user.name}</span>
                    <span className="truncate text-xs">{data.user.email}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <User2 className="mr-2 size-4" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 size-4" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

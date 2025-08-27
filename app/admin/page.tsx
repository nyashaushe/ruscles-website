'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, MessageSquare, Wrench, TrendingUp, Calendar, Phone, Mail, Clock, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { UnifiedActivityFeed } from "@/components/admin/unified-activity-feed"
import { QuickNavigation } from "@/components/admin/quick-navigation"

export default function AdminDashboard() {
  const { stats: dashboardStats, loading: statsLoading } = useDashboardStats()

  const stats = [
    {
      title: "Total Submissions",
      value: dashboardStats?.combined.totalSubmissions.toString() || "0",
      change: "+12%",
      trend: "up",
      icon: MessageSquare,
      description: "Forms & Inquiries",
      href: "/admin/forms"
    },
    {
      title: "Pending Items",
      value: dashboardStats?.combined.pendingItems.toString() || "0",
      change: "+3",
      trend: "up",
      icon: Clock,
      description: "Need attention",
      href: "/admin/forms?status=new"
    },
    {
      title: "Active Items",
      value: dashboardStats?.combined.activeItems.toString() || "0",
      change: "+8%",
      trend: "up",
      icon: Wrench,
      description: "In progress",
      href: "/admin/forms?status=in_progress"
    },
  ]

  // Activity feed and tasks are now handled by dedicated components
  // that fetch real data from the database

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return null
}

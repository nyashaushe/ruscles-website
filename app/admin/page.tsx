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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{statsLoading ? "..." : stat.value}</div>
              <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                <div className="flex items-center">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">{stat.change}</span>
                  <span className="ml-1">{stat.description}</span>
                </div>
                {stat.href && (
                  <Button asChild variant="ghost" size="sm" className="h-6 px-2">
                    <Link href={stat.href}>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Forms & Inquiries Overview */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Legacy Inquiries
                  </CardTitle>
                  <CardDescription>Traditional inquiry data (now part of forms)</CardDescription>
                </div>
                <Button asChild size="sm">
                  <Link href="/admin/forms">View in Forms</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{dashboardStats.inquiries.pending}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{dashboardStats.inquiries.inProgress}</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Inquiries</span>
                  <span className="font-medium">{dashboardStats.inquiries.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Forms Overview
                  </CardTitle>
                  <CardDescription>New form management system</CardDescription>
                </div>
                <Button asChild size="sm">
                  <Link href="/admin/forms">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{dashboardStats.forms.new}</div>
                  <div className="text-sm text-gray-600">New</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{dashboardStats.forms.responded}</div>
                  <div className="text-sm text-gray-600">Responded</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Forms</span>
                  <span className="font-medium">{dashboardStats.forms.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unified Activity Feed */}
        <div className="lg:col-span-2">
          <UnifiedActivityFeed />
        </div>

        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Tasks
            </CardTitle>
            <CardDescription>Your schedule for today</CardDescription>
          </CardHeader>
          <CardContent>
            {/* <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Task management coming soon</p>
              <p className="text-xs">This will integrate with your calendar and project deadlines</p>
            </div> */}
            <Button variant="outline" className="w-full mt-4 bg-transparent" size="sm">
              View Full Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation and Actions */}
      <QuickNavigation />
    </div>
  )
}

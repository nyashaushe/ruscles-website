"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, FileText, Clock, CheckCircle, AlertCircle, Users } from "lucide-react"
import Link from "next/link"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"

export function QuickNavigation() {
  const { stats, loading } = useDashboardStats()

  const navigationItems = [
    {
      title: "Forms Management",
      description: "New form submission system",
      href: "/admin/forms",
      icon: FileText,
      color: "bg-blue-50 text-blue-600 border-blue-200",
      stats: stats ? [
        { label: "New", value: stats.forms.new, color: "bg-red-100 text-red-800" },
        { label: "In Progress", value: stats.forms.inProgress, color: "bg-blue-100 text-blue-800" },
        { label: "Responded", value: stats.forms.responded, color: "bg-green-100 text-green-800" }
      ] : []
    },
    {
      title: "Traditional Inquiries",
      description: "Legacy inquiry management",
      href: "/admin/inquiries",
      icon: MessageSquare,
      color: "bg-green-50 text-green-600 border-green-200",
      stats: stats ? [
        { label: "Pending", value: stats.inquiries.pending, color: "bg-yellow-100 text-yellow-800" },
        { label: "In Progress", value: stats.inquiries.inProgress, color: "bg-blue-100 text-blue-800" },
        { label: "Completed", value: stats.inquiries.completed, color: "bg-green-100 text-green-800" }
      ] : []
    }
  ]

  const quickActions = [
    {
      title: "New Submissions",
      description: "Items needing attention",
      href: "/admin/forms?status=new",
      icon: AlertCircle,
      value: stats?.combined.pendingItems || 0,
      color: "text-red-600"
    },
    {
      title: "Active Items",
      description: "Currently being handled",
      href: "/admin/inquiries?status=in-progress",
      icon: Clock,
      value: stats?.combined.activeItems || 0,
      color: "text-blue-600"
    },
    {
      title: "Completed Today",
      description: "Successfully resolved",
      href: "/admin/forms?status=completed",
      icon: CheckCircle,
      value: stats?.combined.completedItems || 0,
      color: "text-green-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* System Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>System Navigation</CardTitle>
          <CardDescription>Switch between forms and inquiries management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {navigationItems.map((item) => (
              <div key={item.title} className={`p-4 rounded-lg border-2 ${item.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-6 w-6" />
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm opacity-80">{item.description}</p>
                    </div>
                  </div>
                  <Button asChild size="sm">
                    <Link href={item.href}>View</Link>
                  </Button>
                </div>
                
                {!loading && item.stats.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {item.stats.map((stat) => (
                      <Badge key={stat.label} className={stat.color}>
                        {stat.label}: {stat.value}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {loading && (
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump to common tasks and views</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                asChild
                variant="outline"
                className="h-auto p-4 flex-col items-start gap-2 bg-transparent"
              >
                <Link href={action.href}>
                  <div className="flex items-center gap-2 w-full">
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                    <div className="text-left flex-1">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-gray-500">{action.description}</div>
                    </div>
                    <div className={`text-2xl font-bold ${action.color}`}>
                      {loading ? "..." : action.value}
                    </div>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, FileText, Clock, User, ArrowRight } from "lucide-react"
import Link from "next/link"
import { UnifiedSubmissionsApi, type UnifiedSubmission } from "@/lib/api/unified-submissions"
import { formatDistanceToNow } from "date-fns"

interface ActivityItem {
  id: string
  type: 'form' | 'inquiry'
  title: string
  subtitle: string
  status: string
  priority: string
  date: Date
  href: string
  customerName: string
  customerEmail: string
}

export function UnifiedActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        
        // Fetch recent submissions from unified API
        const response = await UnifiedSubmissionsApi.getAllSubmissions({}, 1, 5)
        
        const combinedActivities: ActivityItem[] = response.data.map(submission => ({
          id: submission.id,
          type: submission.type,
          title: submission.subject,
          subtitle: submission.customerInfo.name,
          status: submission.status,
          priority: submission.priority,
          date: submission.submittedAt,
          href: submission.type === 'form' ? `/admin/forms/${submission.id}` : `/admin/inquiries/${submission.id}`,
          customerName: submission.customerInfo.name,
          customerEmail: submission.customerInfo.email
        }))

        setActivities(combinedActivities)
      } catch (error) {
        console.error('Failed to fetch unified activities:', error)
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "responded":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Loading recent forms and inquiries...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest forms and inquiries across all channels</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/forms">
                <FileText className="h-4 w-4 mr-2" />
                Forms
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/inquiries">
                <MessageSquare className="h-4 w-4 mr-2" />
                Inquiries
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {activity.type === 'form' ? (
                    <FileText className="h-5 w-5 text-blue-500" />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <Badge variant="outline" className={getPriorityColor(activity.priority)}>
                      {activity.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{activity.subtitle}</p>
                  <p className="text-xs text-gray-500">{activity.customerEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status.replace('_', ' ')}
                  </Badge>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(activity.date, { addSuffix: true })}
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={activity.href}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
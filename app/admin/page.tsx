import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, MessageSquare, Wrench, TrendingUp, Calendar, Phone, Mail, Clock } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Inquiries",
      value: "247",
      change: "+12%",
      trend: "up",
      icon: MessageSquare,
      description: "This month",
    },
    {
      title: "Active Projects",
      value: "18",
      change: "+3",
      trend: "up",
      icon: Wrench,
      description: "In progress",
    },
    {
      title: "New Customers",
      value: "34",
      change: "+8%",
      trend: "up",
      icon: Users,
      description: "This month",
    },
  ]

  const recentInquiries = [
    {
      id: "INQ-001",
      name: "John Mukamuri",
      email: "john@email.com",
      service: "Electrical Wiring",
      status: "pending",
      date: "2024-01-15",
      priority: "high",
    },
    {
      id: "INQ-002",
      name: "Sarah Chikwanha",
      email: "sarah@email.com",
      service: "Air Conditioning",
      status: "in-progress",
      date: "2024-01-14",
      priority: "medium",
    },
    {
      id: "INQ-003",
      name: "David Moyo",
      email: "david@email.com",
      service: "Cold Room Installation",
      status: "completed",
      date: "2024-01-13",
      priority: "low",
    },
    {
      id: "INQ-004",
      name: "Grace Sibanda",
      email: "grace@email.com",
      service: "Refrigeration Repair",
      status: "pending",
      date: "2024-01-12",
      priority: "high",
    },
  ]

  const upcomingTasks = [
    {
      id: 1,
      title: "Follow up with John Mukamuri",
      type: "call",
      time: "10:00 AM",
      priority: "high",
    },
    {
      id: 2,
      title: "Site visit - Borrowdale project",
      type: "visit",
      time: "2:00 PM",
      priority: "medium",
    },
    {
      id: 3,
      title: "Send quote to Sarah Chikwanha",
      type: "email",
      time: "4:00 PM",
      priority: "high",
    },
  ]

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
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center text-xs text-gray-600 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">{stat.change}</span>
                <span className="ml-1">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inquiries */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Inquiries</CardTitle>
                <CardDescription>Latest customer inquiries and their status</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/admin/inquiries">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">{inquiry.name}</h4>
                      <Badge variant="outline" className={getPriorityColor(inquiry.priority)}>
                        {inquiry.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{inquiry.email}</p>
                    <p className="text-sm text-gray-500">{inquiry.service}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(inquiry.status)}>{inquiry.status}</Badge>
                    <p className="text-xs text-gray-500 mt-1">{inquiry.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="mt-1">
                    {task.type === "call" && <Phone className="h-4 w-4 text-blue-500" />}
                    {task.type === "visit" && <Users className="h-4 w-4 text-green-500" />}
                    {task.type === "email" && <Mail className="h-4 w-4 text-orange-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{task.time}</span>
                      <Badge variant="outline" className={getPriorityColor(task.priority)} size="sm">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent" size="sm">
              View Full Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Link href="/admin/inquiries/new">
                <MessageSquare className="h-6 w-6" />
                <span className="text-sm">New Inquiry</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Link href="/admin/projects/new">
                <Wrench className="h-6 w-6" />
                <span className="text-sm">New Project</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Link href="/admin/customers">
                <Users className="h-6 w-6" />
                <span className="text-sm">Customers</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Link href="/admin/reports">
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Reports</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

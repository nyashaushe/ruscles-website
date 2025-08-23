"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    CheckCircle,
    Clock,
    AlertCircle,
    TrendingUp,
    Users,
    MessageSquare,
    Zap,
    Wrench,
    Snowflake,
    ArrowRight
} from "lucide-react"
import Link from "next/link"

interface DashboardStatusSummaryProps {
    stats: {
        totalSubmissions: number
        pendingItems: number
        activeItems: number
        completedItems: number
        responseRate: number
        avgResponseTime: number
        customerSatisfaction: number
    }
    recentActivity: Array<{
        id: string
        type: 'form' | 'inquiry' | 'response'
        title: string
        timestamp: string
        status: string
    }>
    systemHealth: {
        database: 'healthy' | 'warning' | 'error'
        api: 'healthy' | 'warning' | 'error'
        email: 'healthy' | 'warning' | 'error'
    }
}

export function DashboardStatusSummary({ stats, recentActivity, systemHealth }: DashboardStatusSummaryProps) {
    const getSystemHealthColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'bg-green-100 text-green-800'
            case 'warning': return 'bg-yellow-100 text-yellow-800'
            case 'error': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getSystemHealthIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="h-4 w-4" />
            case 'warning': return <AlertCircle className="h-4 w-4" />
            case 'error': return <AlertCircle className="h-4 w-4" />
            default: return <Clock className="h-4 w-4" />
        }
    }

    return (
        <div className="space-y-6">
            {/* System Health Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-600" />
                        System Status
                    </CardTitle>
                    <CardDescription>Real-time system health and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                            <div className={`p-2 rounded-full ${getSystemHealthColor(systemHealth.database)}`}>
                                {getSystemHealthIcon(systemHealth.database)}
                            </div>
                            <div>
                                <p className="font-medium">Database</p>
                                <p className="text-sm text-gray-600 capitalize">{systemHealth.database}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                            <div className={`p-2 rounded-full ${getSystemHealthColor(systemHealth.api)}`}>
                                {getSystemHealthIcon(systemHealth.api)}
                            </div>
                            <div>
                                <p className="font-medium">API Services</p>
                                <p className="text-sm text-gray-600 capitalize">{systemHealth.api}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                            <div className={`p-2 rounded-full ${getSystemHealthColor(systemHealth.email)}`}>
                                {getSystemHealthIcon(systemHealth.email)}
                            </div>
                            <div>
                                <p className="font-medium">Email System</p>
                                <p className="text-sm text-gray-600 capitalize">{systemHealth.email}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            Performance Metrics
                        </CardTitle>
                        <CardDescription>Key performance indicators and response times</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Response Rate</span>
                                <span className="text-sm text-gray-600">{stats.responseRate}%</span>
                            </div>
                            <Progress value={stats.responseRate} className="h-2" />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Avg Response Time</span>
                                <span className="text-sm text-gray-600">{stats.avgResponseTime}h</span>
                            </div>
                            <Progress value={Math.min((24 - stats.avgResponseTime) / 24 * 100, 100)} className="h-2" />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Customer Satisfaction</span>
                                <span className="text-sm text-gray-600">{stats.customerSatisfaction}%</span>
                            </div>
                            <Progress value={stats.customerSatisfaction} className="h-2" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            Service Distribution
                        </CardTitle>
                        <CardDescription>Breakdown of inquiries by service type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium">Electrical</span>
                                </div>
                                <Badge variant="secondary">45%</Badge>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Wrench className="h-4 w-4 text-green-600" />
                                    <span className="font-medium">HVAC</span>
                                </div>
                                <Badge variant="secondary">35%</Badge>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Snowflake className="h-4 w-4 text-purple-600" />
                                    <span className="font-medium">Refrigeration</span>
                                </div>
                                <Badge variant="secondary">20%</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-orange-600" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription>Latest customer interactions and system updates</CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/admin/forms">
                                View All
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                                <div className="p-2 rounded-full bg-blue-100">
                                    <MessageSquare className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{activity.title}</p>
                                    <p className="text-xs text-gray-600">{activity.timestamp}</p>
                                </div>
                                <StatusBadge status={activity.status} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Button asChild variant="outline" className="h-auto p-4 flex-col items-start gap-2">
                            <Link href="/admin/forms?status=new">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <div className="text-left">
                                    <div className="font-medium">New Submissions</div>
                                    <div className="text-sm text-gray-600">{stats.pendingItems} pending</div>
                                </div>
                            </Link>
                        </Button>

                        <Button asChild variant="outline" className="h-auto p-4 flex-col items-start gap-2">
                            <Link href="/admin/forms?status=in_progress">
                                <Clock className="h-5 w-5 text-blue-600" />
                                <div className="text-left">
                                    <div className="font-medium">Active Items</div>
                                    <div className="text-sm text-gray-600">{stats.activeItems} in progress</div>
                                </div>
                            </Link>
                        </Button>

                        <Button asChild variant="outline" className="h-auto p-4 flex-col items-start gap-2">
                            <Link href="/admin/forms?status=completed">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div className="text-left">
                                    <div className="font-medium">Completed</div>
                                    <div className="text-sm text-gray-600">{stats.completedItems} resolved</div>
                                </div>
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'new': return 'bg-blue-100 text-blue-800'
            case 'in_progress': return 'bg-orange-100 text-orange-800'
            case 'completed': return 'bg-green-100 text-green-800'
            case 'responded': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <Badge className={getStatusColor(status)} variant="secondary">
            {status.replace('_', ' ')}
        </Badge>
    )
}

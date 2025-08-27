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
    return null
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

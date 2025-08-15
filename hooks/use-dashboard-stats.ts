"use client"

import { useState, useEffect } from 'react'
import { UnifiedSubmissionsApi } from '@/lib/api/unified-submissions'

interface DashboardStats {
  inquiries: {
    total: number
    pending: number
    inProgress: number
    completed: number
  }
  forms: {
    total: number
    new: number
    inProgress: number
    responded: number
    completed: number
  }
  combined: {
    totalSubmissions: number
    pendingItems: number
    activeItems: number
    completedItems: number
  }
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        const unifiedStats = await UnifiedSubmissionsApi.getUnifiedStats()

        const combinedStats: DashboardStats = {
          inquiries: {
            total: unifiedStats.byType.inquiry,
            pending: unifiedStats.byStatus.pending || 0,
            inProgress: unifiedStats.byStatus.in_progress || 0,
            completed: unifiedStats.byStatus.completed || 0
          },
          forms: {
            total: unifiedStats.byType.form,
            new: unifiedStats.byStatus.new || 0,
            inProgress: unifiedStats.byStatus.in_progress || 0,
            responded: unifiedStats.byStatus.responded || 0,
            completed: unifiedStats.byStatus.completed || 0
          },
          combined: {
            totalSubmissions: unifiedStats.total,
            pendingItems: (unifiedStats.byStatus.new || 0) + (unifiedStats.byStatus.pending || 0),
            activeItems: unifiedStats.byStatus.in_progress || 0,
            completedItems: unifiedStats.byStatus.completed || 0
          }
        }

        setStats(combinedStats)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error
  }
}
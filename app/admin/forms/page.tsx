"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Clock, CheckCircle, Plus, Filter, ArrowRight, RefreshCw } from "lucide-react"
import Link from "next/link"
import { FormsTable } from "./components/forms-table"
import { FormsFilters } from "./components/forms-filters"
import { MobileSearchFilter } from "./components/mobile-search-filter"
import { useForms, useFormStats } from "@/hooks/use-forms"
import { FormsApi } from "@/lib/api/forms"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { FormFilters, FormSubmission } from "@/lib/types"
export default function FormsPage() {
  const searchParams = useSearchParams();
  // Map status query param to tab value
  const statusToTab = (status?: string) => {
    if (!status) return "all";
    if (status === "new") return "new";
    if (status === "in_progress") return "in-progress";
    if (status === "responded" || status === "completed") return "completed";
    return "all";
  };
  const initialTab = statusToTab(searchParams?.get("status"));
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<string>('submittedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const { stats, loading: statsLoading } = useFormStats()
  // Initialize filters based on active tab
  const getFiltersForTab = (tab: string): FormFilters => {
    switch (tab) {
      case 'new':
        return { status: ['NEW'] }
      case 'in-progress':
        return { status: ['IN_PROGRESS'] }
      case 'completed':
        return { status: ['COMPLETED', 'RESPONDED'] }
      default:
        return {}
    }
  }
  const [filters, setFilters] = useState<FormFilters>(getFiltersForTab(initialTab));
  const { forms, loading, error, pagination, updateFilters, updatePage, refreshForms } = useForms(filters);
  // Update tab and filters when status query param changes
  useEffect(() => {
    const status = searchParams?.get("status");
    const tab = statusToTab(status);
    setActiveTab(tab);
    const newFilters = getFiltersForTab(tab);
    setFilters(newFilters);
    updateFilters(newFilters);
  }, [searchParams]);

  // Refresh forms when the page becomes visible (e.g., when navigating back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshForms();
      }
    };

    const handleFocus = () => {
      refreshForms();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshForms]);
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    const newFilters = getFiltersForTab(tab)
    setFilters(newFilters)
    updateFilters(newFilters)
  }
  const handleFiltersChange = (newFilters: FormFilters) => {
    setFilters(newFilters)
    updateFilters(newFilters)
  }
  const handleClearFilters = () => {
    const clearedFilters = getFiltersForTab(activeTab)
    setFilters(clearedFilters)
    updateFilters(clearedFilters)
  }
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }
  const handleBulkUpdate = async (updates: Partial<FormSubmission>, formIds: string[]) => {
    try {
      await FormsApi.bulkUpdateForms(formIds, updates)
      refreshForms() // Refresh the forms list after bulk update
    } catch (error) {
      console.error('Failed to bulk update forms:', error)
      throw error
    }
  }
  const statsCards = [
    {
      title: "Total Forms",
      value: stats?.total || 0,
      icon: MessageSquare,
      description: "All time submissions",
    },
    {
      title: "New Forms",
      value: stats?.byStatus?.new || 0,
      icon: Clock,
      description: "Awaiting response",
      color: "text-blue-600",
    },
    {
      title: "In Progress",
      value: stats?.byStatus?.in_progress || 0,
      icon: Clock,
      description: "Being handled",
      color: "text-orange-600",
    },
    {
      title: "Completed",
      value: (stats?.byStatus?.completed || 0) + (stats?.byStatus?.responded || 0),
      icon: CheckCircle,
      description: "Successfully resolved",
      color: "text-green-600",
    },
  ]
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Form Submissions</h1>
          <p className="text-gray-600 mt-2">Manage and respond to customer inquiries</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error loading forms: {error}</p>
              <Button onClick={refreshForms} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
            Form Submissions & Inquiries
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Manage and respond to all customer inquiries and form submissions
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button
            onClick={refreshForms}
            variant="outline"
            size="sm"
            disabled={loading}
            className="w-full sm:w-auto touch-manipulation"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Refreshing...</span>
                <span className="sm:hidden">Refresh</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">Refresh</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${stat.color || 'text-gray-400'}`} />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-gray-900">
                {statsLoading ? <LoadingSpinner size="sm" /> : stat.value}
              </div>
              <p className="text-xs text-gray-600 mt-1 leading-tight">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
            <CardDescription>Filter forms by status, priority, type, and more</CardDescription>
          </CardHeader>
          <CardContent>
            <FormsFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </CardContent>
        </Card>
      )} */}

      {/* Forms Table - Mobile Optimized */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-xl">Form Submissions</CardTitle>
              <CardDescription className="text-sm">
                {pagination.total} total submissions
                {filters.search && ` matching "${filters.search}"`}
              </CardDescription>
            </div>

            {/* Mobile-First Tabs */}
            <div className="w-full sm:w-auto">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 sm:w-auto">
                  <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-3">
                    <span className="hidden sm:inline">All</span>
                    <span className="sm:hidden">All</span>
                    {stats?.total && (
                      <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs px-1">
                        {stats.total}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="new" className="text-xs sm:text-sm px-2 sm:px-3">
                    <span className="hidden sm:inline">New</span>
                    <span className="sm:hidden">New</span>
                    {stats?.byStatus?.new && (
                      <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs px-1">
                        {stats.byStatus.new}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="in-progress" className="text-xs sm:text-sm px-2 sm:px-3">
                    <span className="hidden sm:inline">In Progress</span>
                    <span className="sm:hidden">Progress</span>
                    {stats?.byStatus?.in_progress && (
                      <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs px-1">
                        {stats.byStatus.in_progress}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="text-xs sm:text-sm px-2 sm:px-3">
                    <span className="hidden sm:inline">Completed</span>
                    <span className="sm:hidden">Done</span>
                    {((stats?.byStatus?.completed || 0) + (stats?.byStatus?.responded || 0)) > 0 && (
                      <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs px-1">
                        {(stats?.byStatus?.completed || 0) + (stats?.byStatus?.responded || 0)}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {/* Mobile Search and Filters */}
          <div className="md:hidden mb-4">
            <MobileSearchFilter
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              totalResults={pagination.total}
            />
          </div>

          <FormsTable
            forms={forms}
            loading={loading}
            pagination={pagination}
            onPageChange={updatePage}
            onRefresh={refreshForms}
            onBulkUpdate={handleBulkUpdate}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        </CardContent>
      </Card>
    </div>
  )
}
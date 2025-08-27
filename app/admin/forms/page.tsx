"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Clock, CheckCircle, Plus, Filter, ArrowRight } from "lucide-react"
import Link from "next/link"
import { FormsTable } from "./components/forms-table"
import { FormsFilters } from "./components/forms-filters"
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
        return { status: ['new'] }
      case 'in-progress':
        return { status: ['in_progress'] }
      case 'completed':
        return { status: ['completed', 'responded'] }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Form Submissions & Inquiries</h1>
          <p className="text-gray-600 mt-2">Manage and respond to all customer inquiries and form submissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Manual Entry
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color || 'text-gray-400'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {statsLoading ? <LoadingSpinner size="sm" /> : stat.value}
              </div>
              <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
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
      )}

      {/* Forms Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Form Submissions</CardTitle>
              <CardDescription>
                {pagination.total} total submissions
                {filters.search && ` matching "${filters.search}"`}
              </CardDescription>
            </div>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="all">
                  All
                  {stats?.total && (
                    <Badge variant="secondary" className="ml-2">
                      {stats.total}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="new">
                  New
                  {stats?.byStatus?.new && (
                    <Badge variant="secondary" className="ml-2">
                      {stats.byStatus.new}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="in-progress">
                  In Progress
                  {stats?.byStatus?.in_progress && (
                    <Badge variant="secondary" className="ml-2">
                      {stats.byStatus.in_progress}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed
                  {((stats?.byStatus?.completed || 0) + (stats?.byStatus?.responded || 0)) > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {(stats?.byStatus?.completed || 0) + (stats?.byStatus?.responded || 0)}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
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
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Search,
  Plus,
  MessageSquare,
  Filter,
} from "lucide-react"
import { useTestimonialsList, useTestimonial } from "@/hooks/use-testimonials"
import { TestimonialFilters, TestimonialSortOptions, ReorderTestimonialData } from "@/lib/api/testimonials"
import { formatDate } from "@/lib/utils/date"
import { Testimonial } from "@/lib/types/content"
import { TestimonialsSortableTable } from "@/components/admin/testimonials-sortable-table"

export default function TestimonialsListPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all")
  const [featuredFilter, setFeaturedFilter] = useState<string>("all")
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"customerName" | "createdAt" | "displayOrder" | "rating">("displayOrder")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const { toggleVisibility, toggleFeatured, delete: deleteTestimonial, reorder } = useTestimonial()

  // Build filters
  const filters: TestimonialFilters = {}
  if (searchTerm) filters.search = searchTerm
  if (visibilityFilter !== "all") filters.isVisible = visibilityFilter === "visible"
  if (featuredFilter !== "all") filters.isFeatured = featuredFilter === "featured"
  if (projectTypeFilter !== "all") filters.projectType = projectTypeFilter

  const sortOptions: TestimonialSortOptions = {
    sortBy,
    sortOrder
  }

  const { testimonials, loading, error, refresh } = useTestimonialsList({
    filters,
    sortOptions,
    limit: 50
  })

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }



  const handleToggleVisibility = async (testimonial: Testimonial) => {
    const success = await toggleVisibility(testimonial.id, !testimonial.isVisible)
    if (success) {
      refresh()
    }
  }

  const handleToggleFeatured = async (testimonial: Testimonial) => {
    const success = await toggleFeatured(testimonial.id, !testimonial.isFeatured)
    if (success) {
      refresh()
    }
  }

  const handleDelete = async (id: string, customerName: string) => {
    if (window.confirm(`Are you sure you want to delete the testimonial from ${customerName}?`)) {
      const success = await deleteTestimonial(id)
      if (success) {
        refresh()
      }
    }
  }

  const handleReorder = async (reorderedTestimonials: Testimonial[]) => {
    const reorderData: ReorderTestimonialData[] = reorderedTestimonials.map((testimonial, index) => ({
      id: testimonial.id,
      displayOrder: index + 1
    }))

    const success = await reorder(reorderData)
    if (success) {
      refresh()
    }
  }



  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Testimonials</h1>
            <p className="text-gray-600 mt-1">Manage customer testimonials and reviews</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={MessageSquare}
              title="Error loading testimonials"
              description={error}
              action={
                <Button onClick={refresh}>
                  Try Again
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-600 mt-1">Manage customer testimonials and reviews</p>
        </div>
        <Button onClick={() => router.push("/admin/content/testimonials/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search testimonials..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                <SelectTrigger className="w-[120px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="visible">Visible</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>

              <Select value={projectTypeFilter} onValueChange={setProjectTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Project Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="refrigeration">Refrigeration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials Table */}
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          </CardContent>
        </Card>
      ) : testimonials.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={MessageSquare}
              title="No testimonials found"
              description={searchTerm || visibilityFilter !== "all" || featuredFilter !== "all" || projectTypeFilter !== "all"
                ? "No testimonials match your current filters. Try adjusting your search criteria."
                : "Get started by adding your first customer testimonial."
              }
              action={
                <Button onClick={() => router.push("/admin/content/testimonials/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Testimonial
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <TestimonialsSortableTable
          testimonials={testimonials}
          onReorder={handleReorder}
          onToggleVisibility={handleToggleVisibility}
          onToggleFeatured={handleToggleFeatured}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
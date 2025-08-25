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
  Eye,
  EyeOff,
  Star,
  StarOff,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react"
import { useTestimonials } from "@/hooks/use-testimonials-new"
import { formatDate } from "@/lib/utils/date"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TestimonialsListPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all")
  const [featuredFilter, setFeaturedFilter] = useState<string>("all")
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>("all")

  const { 
    testimonials, 
    loading, 
    error, 
    stats, 
    deleteTestimonial, 
    toggleVisibility, 
    toggleFeatured, 
    refresh 
  } = useTestimonials()

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleToggleVisibility = async (testimonial: any) => {
    try {
      await toggleVisibility(testimonial.id, !testimonial.isVisible)
      refresh()
    } catch (error) {
      console.error('Failed to toggle visibility:', error)
    }
  }

  const handleToggleFeatured = async (testimonial: any) => {
    try {
      await toggleFeatured(testimonial.id, !testimonial.isFeatured)
      refresh()
    } catch (error) {
      console.error('Failed to toggle featured:', error)
    }
  }

  const handleDelete = async (id: string, customerName: string) => {
    if (window.confirm(`Are you sure you want to delete the testimonial from ${customerName}?`)) {
      try {
        await deleteTestimonial(id)
        refresh()
      } catch (error) {
        console.error('Failed to delete testimonial:', error)
      }
    }
  }

  // Filter testimonials
  const filteredTestimonials = testimonials.filter((testimonial) => {
    const matchesSearch = searchTerm === "" || 
      testimonial.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.customerCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.testimonialText.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesVisibility = visibilityFilter === "all" || 
      (visibilityFilter === "visible" && testimonial.isVisible) ||
      (visibilityFilter === "hidden" && !testimonial.isVisible)
    
    const matchesFeatured = featuredFilter === "all" || 
      (featuredFilter === "featured" && testimonial.isFeatured) ||
      (featuredFilter === "not-featured" && !testimonial.isFeatured)
    
    const matchesProjectType = projectTypeFilter === "all" || 
      testimonial.projectType === projectTypeFilter
    
    return matchesSearch && matchesVisibility && matchesFeatured && matchesProjectType
  })

  if (loading && testimonials.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Testimonials</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refresh} variant="outline">
              Try Again
            </Button>
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
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href="/admin/content/testimonials/new">
              <Plus className="h-4 w-4 mr-2" />
              New Testimonial
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-sm text-gray-600">Total Testimonials</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.visible}</div>
            <p className="text-sm text-gray-600">Visible</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.featured}</div>
            <p className="text-sm text-gray-600">Featured</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</div>
            <p className="text-sm text-gray-600">Avg Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Testimonials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search testimonials..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Visibility</SelectItem>
                <SelectItem value="visible">Visible</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>

            <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Featured</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="not-featured">Not Featured</SelectItem>
              </SelectContent>
            </Select>

            <Select value={projectTypeFilter} onValueChange={setProjectTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Project Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ELECTRICAL">Electrical</SelectItem>
                <SelectItem value="HVAC">HVAC</SelectItem>
                <SelectItem value="REFRIGERATION">Refrigeration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonials ({filteredTestimonials.length})</CardTitle>
          <CardDescription>All customer testimonials with their status and metadata</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTestimonials.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No testimonials found"
              description={searchTerm || visibilityFilter !== 'all' || featuredFilter !== 'all' || projectTypeFilter !== 'all'
                ? "No testimonials match your current filters."
                : "No testimonials have been added yet."}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Testimonial</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Project Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTestimonials.map((testimonial) => (
                    <TableRow key={testimonial.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{testimonial.customerName}</div>
                          {testimonial.customerTitle && (
                            <div className="text-sm text-gray-500">{testimonial.customerTitle}</div>
                          )}
                          {testimonial.customerCompany && (
                            <div className="text-sm text-gray-500">{testimonial.customerCompany}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-900 line-clamp-3">
                            {testimonial.testimonialText}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {testimonial.rating ? (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{testimonial.rating}</span>
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No rating</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {testimonial.projectType ? (
                          <Badge variant="outline">{testimonial.projectType}</Badge>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={testimonial.isVisible ? "default" : "secondary"}>
                            {testimonial.isVisible ? "Visible" : "Hidden"}
                          </Badge>
                          {testimonial.isFeatured && (
                            <Badge variant="outline" className="text-yellow-600">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatDate(testimonial.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/content/testimonials/${testimonial.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Testimonial
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleToggleVisibility(testimonial)}
                            >
                              {testimonial.isVisible ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Hide Testimonial
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Show Testimonial
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleFeatured(testimonial)}
                            >
                              {testimonial.isFeatured ? (
                                <>
                                  <StarOff className="mr-2 h-4 w-4" />
                                  Remove Featured
                                </>
                              ) : (
                                <>
                                  <Star className="mr-2 h-4 w-4" />
                                  Mark Featured
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(testimonial.id, testimonial.customerName)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Testimonial
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
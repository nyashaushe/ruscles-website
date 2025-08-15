'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Grid, List } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { usePortfolio } from '@/hooks/use-portfolio'
import { PortfolioTable } from './components/portfolio-table'
import { PortfolioGrid } from './components/portfolio-grid'
import type { PortfolioFilters } from '@/lib/api/portfolio'

export default function PortfolioPage() {
  const [filters, setFilters] = useState<PortfolioFilters>({
    category: 'all',
    status: 'all',
    search: '',
    tags: []
  })
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const { portfolioItems, loading, error, refetch } = usePortfolio(filters)

  const handleFilterChange = (key: keyof PortfolioFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }))
  }

  if (loading) {
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
            <CardTitle className="text-destructive">Error Loading Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Management</h1>
          <p className="text-muted-foreground">
            Manage your project portfolio and showcase your work
          </p>
        </div>
        <Link href="/admin/content/portfolio/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Portfolio Item
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioItems.filter(item => item.isFeatured).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Visible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioItems.filter(item => item.isVisible).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(portfolioItems.map(item => item.serviceCategory)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search portfolio items..."
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="refrigeration">Refrigeration</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="visible">Visible</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>

              {/* Featured Filter */}
              <Select
                value={filters.featured === undefined ? 'all' : filters.featured.toString()}
                onValueChange={(value) => 
                  handleFilterChange('featured', value === 'all' ? undefined : value === 'true')
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="true">Featured</SelectItem>
                  <SelectItem value="false">Not Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tags Filter */}
          <div className="mt-4">
            <Input
              placeholder="Filter by tags (comma-separated)"
              value={filters.tags?.join(', ') || ''}
              onChange={(e) => {
                const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                handleFilterChange('tags', tags.length > 0 ? tags : [])
              }}
              className="max-w-sm"
            />
          </div>

          {/* Active Filters */}
          {(filters.category !== 'all' || filters.status !== 'all' || filters.featured !== undefined || filters.search || (filters.tags && filters.tags.length > 0)) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {filters.category !== 'all' && (
                <Badge variant="secondary" className="capitalize">
                  {filters.category}
                </Badge>
              )}
              {filters.status !== 'all' && (
                <Badge variant="secondary" className="capitalize">
                  {filters.status}
                </Badge>
              )}
              {filters.featured !== undefined && (
                <Badge variant="secondary">
                  {filters.featured ? 'Featured' : 'Not Featured'}
                </Badge>
              )}
              {filters.search && (
                <Badge variant="secondary">
                  Search: {filters.search}
                </Badge>
              )}
              {filters.tags && filters.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  Tag: {tag}
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ category: 'all', status: 'all', search: '', tags: [] })}
                className="ml-2"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      {portfolioItems.length === 0 ? (
        <EmptyState
          icon={Grid}
          title="No portfolio items found"
          description={
            Object.values(filters).some(v => v && v !== 'all' && (Array.isArray(v) ? v.length > 0 : true))
              ? "No portfolio items match your current filters. Try adjusting your search criteria."
              : "Get started by creating your first portfolio item to showcase your work."
          }
          action={
            <Link href="/admin/content/portfolio/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Portfolio Item
              </Button>
            </Link>
          }
        />
      ) : viewMode === 'grid' ? (
        <PortfolioGrid items={portfolioItems} />
      ) : (
        <PortfolioTable items={portfolioItems} />
      )}
    </div>
  )
}
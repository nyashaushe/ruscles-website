"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { 
  Edit, 
  Search, 
  FileText, 
  Clock,
  User,
  Globe
} from "lucide-react"
import { formatDateTime } from "@/lib/utils/date"
import { usePages } from "@/hooks/use-pages"
import Link from "next/link"

export default function PagesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { pages, isLoading, error } = usePages()

  const filteredPages = pages?.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load pages: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Static Pages</h1>
          <p className="text-gray-600 mt-1">
            Manage your website's static content including About Us, Services, and Contact pages
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Pages Grid */}
      {filteredPages.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No pages found"
          description={searchQuery ? "No pages match your search criteria." : "No static pages have been created yet."}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPages.map((page) => (
            <Card key={page.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">
                      {page.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Globe className="h-3 w-3" />
                      /{page.slug}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {page.slug === 'about' && 'About'}
                    {page.slug === 'services' && 'Services'}
                    {page.slug === 'contact' && 'Contact'}
                    {!['about', 'services', 'contact'].includes(page.slug) && 'Page'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Content Preview */}
                <div className="text-sm text-gray-600 line-clamp-3">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: page.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
                    }} 
                  />
                </div>

                {/* Metadata */}
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Updated {formatDateTime(page.lastUpdated)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>by {page.updatedBy}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/admin/content/pages/${page.slug}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
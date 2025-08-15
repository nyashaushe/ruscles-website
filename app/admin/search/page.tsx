"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Search, 
  Filter, 
  Bookmark, 
  TrendingUp, 
  Clock, 
  FileText, 
  MessageSquare, 
  Image, 
  Star,
  BarChart3,
  Settings,
  Download
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GlobalSearch } from "@/components/ui/global-search"
import { AdvancedFilters } from "@/components/ui/advanced-filters"
import { SavedSearches } from "@/components/ui/saved-searches"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { useGlobalSearch } from "@/hooks/use-global-search"
import { searchApi } from "@/lib/api/search"
import { formatDate } from "@/lib/utils/date"
import type { 
  GlobalSearchResult, 
  AdvancedFilters as AdvancedFiltersType,
  SavedSearch 
} from "@/lib/types/search"

export default function SearchPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("search")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersType>({})
  const [searchAnalytics, setSearchAnalytics] = useState<any>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  const { results, loading, error, totalResults, search, clearResults } = useGlobalSearch()

  const handleResultSelect = (result: GlobalSearchResult) => {
    router.push(result.url)
  }

  const handleSavedSearchSelect = (savedSearch: SavedSearch) => {
    // Execute the saved search
    search({
      query: savedSearch.query,
      filters: savedSearch.filters,
      limit: 20
    })
    setActiveTab("search")
  }

  const handleAdvancedSearch = () => {
    if (advancedFilters.search) {
      search({
        query: advancedFilters.search,
        filters: {
          types: advancedFilters.contentType as any,
          status: advancedFilters.contentStatus,
          tags: advancedFilters.tags,
          categories: advancedFilters.categories,
          dateRange: advancedFilters.dateRange,
          author: advancedFilters.author
        },
        limit: 20
      })
      setActiveTab("search")
    }
  }

  const loadSearchAnalytics = async () => {
    setLoadingAnalytics(true)
    try {
      const response = await searchApi.getSearchAnalytics({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        to: new Date()
      })
      setSearchAnalytics(response.data)
    } catch (error) {
      console.error('Failed to load search analytics:', error)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'form':
        return <MessageSquare className="h-4 w-4" />
      case 'blog_post':
        return <FileText className="h-4 w-4" />
      case 'portfolio_item':
        return <Image className="h-4 w-4" />
      case 'testimonial':
        return <Star className="h-4 w-4" />
      case 'page_content':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'form':
        return 'Form'
      case 'blog_post':
        return 'Blog Post'
      case 'portfolio_item':
        return 'Portfolio'
      case 'testimonial':
        return 'Testimonial'
      case 'page_content':
        return 'Page'
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Global Search</h1>
          <p className="text-gray-600 mt-1">Search across all your content and forms</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <Button
            variant="outline"
            onClick={loadSearchAnalytics}
            disabled={loadingAnalytics}
          >
            {loadingAnalytics ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <BarChart3 className="h-4 w-4 mr-2" />
            )}
            Analytics
          </Button>
        </div>
      </div>

      {/* Global Search Bar */}
      <Card>
        <CardContent className="p-6">
          <GlobalSearch
            placeholder="Search across all content types..."
            onResultSelect={handleResultSelect}
            showFilters={true}
          />
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <AdvancedFilters
          filters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
          onClearFilters={() => setAdvancedFilters({})}
          type="global"
        />
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Search Results</TabsTrigger>
          <TabsTrigger value="saved">Saved Searches</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Search Results Tab */}
        <TabsContent value="search" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-destructive">
                  <p>Search failed</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
              </CardContent>
            </Card>
          ) : results.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {totalResults} results found
                </p>
                <Button variant="outline" size="sm">
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
              <div className="grid gap-4">
                {results.map((result) => (
                  <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 
                              className="font-medium text-gray-900 hover:text-primary cursor-pointer"
                              onClick={() => handleResultSelect(result)}
                            >
                              {result.title}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(result.type)}
                            </Badge>
                            {result.status && (
                              <Badge variant="secondary" className="text-xs">
                                {result.status}
                              </Badge>
                            )}
                            {result.priority && (
                              <Badge 
                                variant={result.priority === 'urgent' || result.priority === 'high' ? 'destructive' : 'secondary'} 
                                className="text-xs"
                              >
                                {result.priority}
                              </Badge>
                            )}
                          </div>
                          
                          {result.excerpt && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {result.excerpt}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(result.updatedAt)}
                            </div>
                            {result.category && (
                              <div className="flex items-center gap-1">
                                <span>Category: {result.category}</span>
                              </div>
                            )}
                            {result.tags && result.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span>Tags: {result.tags.slice(0, 3).join(', ')}</span>
                                {result.tags.length > 3 && <span>+{result.tags.length - 3}</span>}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Score: {Math.round(result.relevanceScore * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={Search}
              title="No search results"
              description="Try searching for content, forms, or use the advanced filters to refine your search."
            />
          )}
        </TabsContent>

        {/* Saved Searches Tab */}
        <TabsContent value="saved">
          <SavedSearches onSearchSelect={handleSavedSearchSelect} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {loadingAnalytics ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              </CardContent>
            </Card>
          ) : searchAnalytics ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{searchAnalytics.totalSearches}</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Unique Queries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{searchAnalytics.uniqueQueries}</div>
                  <p className="text-xs text-muted-foreground">Different search terms</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{searchAnalytics.averageResultsPerSearch}</div>
                  <p className="text-xs text-muted-foreground">Per search</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Top Content Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {searchAnalytics.searchesByType[0]?.type || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">Most searched</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="No analytics data"
              description="Click 'Load Analytics' to view search statistics."
              action={
                <Button onClick={loadSearchAnalytics}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Load Analytics
                </Button>
              }
            />
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Search Settings</CardTitle>
              <CardDescription>
                Configure search behavior and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Search settings and preferences will be available in a future update.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
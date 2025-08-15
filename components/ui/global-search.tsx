"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { 
  Search, 
  X, 
  Filter, 
  Clock, 
  Star, 
  FileText, 
  MessageSquare, 
  Image, 
  User,
  Calendar,
  Tag,
  ChevronDown,
  Loader2,
  Bookmark,
  Settings
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useGlobalSearch, useSearchSuggestions, useSavedSearches } from "@/hooks/use-global-search"
import { formatDate } from "@/lib/utils/date"
import type { GlobalSearchFilters, GlobalSearchResult } from "@/lib/types/search"

interface GlobalSearchProps {
  className?: string
  placeholder?: string
  showFilters?: boolean
  onResultSelect?: (result: GlobalSearchResult) => void
}

export function GlobalSearch({ 
  className, 
  placeholder = "Search across all content...",
  showFilters = true,
  onResultSelect
}: GlobalSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<GlobalSearchFilters>({})
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const { results, loading, error, totalResults, search, clearResults } = useGlobalSearch()
  const { suggestions, getSuggestions, clearSuggestions } = useSearchSuggestions()
  const { savedSearches } = useSavedSearches()

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        search({ query, filters, limit: 10 })
        getSuggestions(query)
      } else {
        clearResults()
        clearSuggestions()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, filters, search, getSuggestions, clearResults, clearSuggestions])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleResultClick = (result: GlobalSearchResult) => {
    if (onResultSelect) {
      onResultSelect(result)
    } else {
      router.push(result.url)
    }
    setIsOpen(false)
    setQuery("")
  }

  const handleFilterChange = (key: keyof GlobalSearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearAllFilters = () => {
    setFilters({})
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

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof GlobalSearchFilters]
    return value !== undefined && value !== null && 
           (Array.isArray(value) ? value.length > 0 : true)
  })

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("")
                clearResults()
                setIsOpen(false)
              }}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {showFilters && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 w-6 p-0",
                    hasActiveFilters && "text-primary"
                  )}
                >
                  <Filter className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <SearchFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClearFilters={clearAllFilters}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query || savedSearches.length > 0) && (
        <Card 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-hidden"
        >
          <CardContent className="p-0">
            {/* Saved Searches */}
            {!query && savedSearches.length > 0 && (
              <div className="p-3 border-b">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Bookmark className="h-3 w-3" />
                  Saved Searches
                </div>
                <div className="space-y-1">
                  {savedSearches.slice(0, 3).map((savedSearch) => (
                    <Button
                      key={savedSearch.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => {
                        setQuery(savedSearch.query)
                        setFilters(savedSearch.filters)
                        setIsOpen(true)
                      }}
                    >
                      <div>
                        <div className="font-medium">{savedSearch.name}</div>
                        {savedSearch.description && (
                          <div className="text-xs text-muted-foreground">
                            {savedSearch.description}
                          </div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Suggestions */}
            {query && suggestions.length > 0 && results.length === 0 && !loading && (
              <div className="p-3 border-b">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Suggestions
                </div>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setQuery(suggestion)}
                    >
                      <Search className="h-3 w-3 mr-2" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {query && results.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                <div className="p-3 border-b">
                  <div className="text-sm text-muted-foreground">
                    {totalResults} results found
                  </div>
                </div>
                <div className="divide-y">
                  {results.map((result) => (
                    <Button
                      key={result.id}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-3 hover:bg-muted/50"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="flex-shrink-0 mt-0.5">
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium truncate">
                              {result.title}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(result.type)}
                            </Badge>
                            {result.status && (
                              <Badge variant="secondary" className="text-xs">
                                {result.status}
                              </Badge>
                            )}
                          </div>
                          {result.excerpt && (
                            <div className="text-sm text-muted-foreground line-clamp-2 mb-1">
                              {result.excerpt}
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(result.updatedAt)}
                            </div>
                            {result.tags && result.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {result.tags.slice(0, 2).join(', ')}
                                {result.tags.length > 2 && ` +${result.tags.length - 2}`}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {query && results.length === 0 && !loading && (
              <div className="p-6 text-center">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <div className="text-sm font-medium">No results found</div>
                <div className="text-xs text-muted-foreground">
                  Try adjusting your search terms or filters
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-6 text-center">
                <div className="text-sm font-medium text-destructive">
                  Search Error
                </div>
                <div className="text-xs text-muted-foreground">
                  {error}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface SearchFiltersProps {
  filters: GlobalSearchFilters
  onFiltersChange: (filters: GlobalSearchFilters) => void
  onClearFilters: () => void
}

function SearchFilters({ filters, onFiltersChange, onClearFilters }: SearchFiltersProps) {
  const updateFilter = (key: keyof GlobalSearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleArrayFilter = (key: 'types' | 'status' | 'priority' | 'categories' | 'tags', value: string) => {
    const currentArray = filters[key] || []
    const newArray = currentArray.includes(value as any)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value as any]
    
    updateFilter(key, newArray.length > 0 ? newArray : undefined)
  }

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof GlobalSearchFilters]
    return value !== undefined && value !== null && 
           (Array.isArray(value) ? value.length > 0 : true)
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Search Filters</h4>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Content Types */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Content Types</Label>
        <div className="space-y-2">
          {[
            { value: 'form', label: 'Forms' },
            { value: 'blog_post', label: 'Blog Posts' },
            { value: 'portfolio_item', label: 'Portfolio' },
            { value: 'testimonial', label: 'Testimonials' },
            { value: 'page_content', label: 'Pages' }
          ].map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type.value}`}
                checked={filters.types?.includes(type.value as any) || false}
                onCheckedChange={() => toggleArrayFilter('types', type.value)}
              />
              <Label htmlFor={`type-${type.value}`} className="text-sm">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Status */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Status</Label>
        <div className="space-y-2">
          {[
            'draft', 'published', 'scheduled', 'archived',
            'new', 'in_progress', 'completed'
          ].map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status}`}
                checked={filters.status?.includes(status) || false}
                onCheckedChange={() => toggleArrayFilter('status', status)}
              />
              <Label htmlFor={`status-${status}`} className="text-sm capitalize">
                {status.replace('_', ' ')}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Priority (for forms) */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Priority</Label>
        <div className="space-y-2">
          {['low', 'medium', 'high', 'urgent'].map((priority) => (
            <div key={priority} className="flex items-center space-x-2">
              <Checkbox
                id={`priority-${priority}`}
                checked={filters.priority?.includes(priority) || false}
                onCheckedChange={() => toggleArrayFilter('priority', priority)}
              />
              <Label htmlFor={`priority-${priority}`} className="text-sm capitalize">
                {priority}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
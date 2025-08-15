"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchInput } from "@/components/ui/search-input"
import { 
  CalendarIcon, 
  X, 
  Filter,
  Search,
  User,
  Tag,
  Clock,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { FormFilters, FormSubmission } from "@/lib/types"

interface FormsFiltersProps {
  filters: FormFilters
  onFiltersChange: (filters: FormFilters) => void
  onClearFilters: () => void
  className?: string
}

export function FormsFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  className 
}: FormsFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FormFilters>(filters)
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)

  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const updateFilter = (key: keyof FormFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const toggleArrayFilter = (key: 'status' | 'priority' | 'type', value: string) => {
    const currentArray = localFilters[key] || []
    const newArray = currentArray.includes(value as any)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value as any]
    
    updateFilter(key, newArray.length > 0 ? newArray : undefined)
  }

  const clearFilter = (key: keyof FormFilters) => {
    const newFilters = { ...localFilters }
    delete newFilters[key]
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const hasActiveFilters = Object.keys(localFilters).some(key => {
    const value = localFilters[key as keyof FormFilters]
    return value !== undefined && value !== null && 
           (Array.isArray(value) ? value.length > 0 : true)
  })

  const activeFilterCount = Object.keys(localFilters).filter(key => {
    const value = localFilters[key as keyof FormFilters]
    return value !== undefined && value !== null && 
           (Array.isArray(value) ? value.length > 0 : true)
  }).length

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Search className="h-3 w-3" />
          Search
        </Label>
        <SearchInput
          placeholder="Search by name, email, or company..."
          value={localFilters.search || ""}
          onChange={(value) => updateFilter('search', value || undefined)}
          onClear={() => clearFilter('search')}
        />
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <AlertCircle className="h-3 w-3" />
          Status
        </Label>
        <div className="flex flex-wrap gap-2">
          {(['new', 'in_progress', 'responded', 'completed', 'archived'] as const).map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status}`}
                checked={localFilters.status?.includes(status) || false}
                onCheckedChange={() => toggleArrayFilter('status', status)}
              />
              <Label 
                htmlFor={`status-${status}`}
                className="text-sm cursor-pointer capitalize"
              >
                {status.replace('_', ' ')}
              </Label>
            </div>
          ))}
        </div>
        {localFilters.status && localFilters.status.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {localFilters.status.map((status) => (
              <Badge key={status} variant="secondary" className="text-xs">
                {status.replace('_', ' ')}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleArrayFilter('status', status)}
                  className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Priority Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <AlertCircle className="h-3 w-3" />
          Priority
        </Label>
        <div className="flex flex-wrap gap-2">
          {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
            <div key={priority} className="flex items-center space-x-2">
              <Checkbox
                id={`priority-${priority}`}
                checked={localFilters.priority?.includes(priority) || false}
                onCheckedChange={() => toggleArrayFilter('priority', priority)}
              />
              <Label 
                htmlFor={`priority-${priority}`}
                className="text-sm cursor-pointer capitalize"
              >
                {priority}
              </Label>
            </div>
          ))}
        </div>
        {localFilters.priority && localFilters.priority.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {localFilters.priority.map((priority) => (
              <Badge key={priority} variant="secondary" className="text-xs">
                {priority}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleArrayFilter('priority', priority)}
                  className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Form Type Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Tag className="h-3 w-3" />
          Form Type
        </Label>
        <div className="flex flex-wrap gap-2">
          {(['contact', 'service_inquiry', 'quote_request'] as const).map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={localFilters.type?.includes(type) || false}
                onCheckedChange={() => toggleArrayFilter('type', type)}
              />
              <Label 
                htmlFor={`type-${type}`}
                className="text-sm cursor-pointer"
              >
                {type === 'service_inquiry' ? 'Service Inquiry' : 
                 type === 'quote_request' ? 'Quote Request' : 
                 'Contact Form'}
              </Label>
            </div>
          ))}
        </div>
        {localFilters.type && localFilters.type.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {localFilters.type.map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type === 'service_inquiry' ? 'Service Inquiry' : 
                 type === 'quote_request' ? 'Quote Request' : 
                 'Contact Form'}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleArrayFilter('type', type)}
                  className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Date Range Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-3 w-3" />
          Date Range
        </Label>
        <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !localFilters.dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {localFilters.dateRange ? (
                <>
                  {format(localFilters.dateRange.from, "LLL dd, y")} -{" "}
                  {format(localFilters.dateRange.to, "LLL dd, y")}
                </>
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-3">
              <div className="text-sm font-medium">Select Date Range</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-500">From</Label>
                  <Calendar
                    mode="single"
                    selected={localFilters.dateRange?.from}
                    onSelect={(date) => {
                      if (date) {
                        updateFilter('dateRange', {
                          from: date,
                          to: localFilters.dateRange?.to || date
                        })
                      }
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">To</Label>
                  <Calendar
                    mode="single"
                    selected={localFilters.dateRange?.to}
                    onSelect={(date) => {
                      if (date && localFilters.dateRange?.from) {
                        updateFilter('dateRange', {
                          from: localFilters.dateRange.from,
                          to: date
                        })
                      }
                    }}
                    disabled={(date) =>
                      date > new Date() || 
                      date < new Date("1900-01-01") ||
                      (localFilters.dateRange?.from && date < localFilters.dateRange.from)
                    }
                    initialFocus
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearFilter('dateRange')
                    setIsDateRangeOpen(false)
                  }}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsDateRangeOpen(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {localFilters.dateRange && (
          <Badge variant="secondary" className="text-xs">
            {format(localFilters.dateRange.from, "MMM dd")} - {format(localFilters.dateRange.to, "MMM dd")}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearFilter('dateRange')}
              className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
            >
              <X className="h-2 w-2" />
            </Button>
          </Badge>
        )}
      </div>

      {/* Assigned To Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <User className="h-3 w-3" />
          Assigned To
        </Label>
        <Select
          value={localFilters.assignedTo || ""}
          onValueChange={(value) => updateFilter('assignedTo', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All assignees</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            <SelectItem value="admin">Admin User</SelectItem>
            <SelectItem value="john_doe">John Doe</SelectItem>
            <SelectItem value="jane_smith">Jane Smith</SelectItem>
            <SelectItem value="mike_wilson">Mike Wilson</SelectItem>
          </SelectContent>
        </Select>
        {localFilters.assignedTo && (
          <Badge variant="secondary" className="text-xs">
            {localFilters.assignedTo === 'unassigned' ? 'Unassigned' : localFilters.assignedTo}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearFilter('assignedTo')}
              className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
            >
              <X className="h-2 w-2" />
            </Button>
          </Badge>
        )}
      </div>

      {/* Tags Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Tag className="h-3 w-3" />
          Tags
        </Label>
        <Input
          placeholder="Enter tags separated by commas"
          value={localFilters.tags?.join(', ') || ""}
          onChange={(e) => {
            const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean)
            updateFilter('tags', tags.length > 0 ? tags : undefined)
          }}
        />
        {localFilters.tags && localFilters.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {localFilters.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newTags = localFilters.tags?.filter(t => t !== tag)
                    updateFilter('tags', newTags?.length ? newTags : undefined)
                  }}
                  className="ml-1 h-3 w-3 p-0 hover:bg-transparent"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Quick Filters */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Quick Filters</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilter('priority', ['urgent', 'high'])}
            className="text-xs"
          >
            High Priority
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilter('status', ['new'])}
            className="text-xs"
          >
            New Forms
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilter('assignedTo', 'unassigned')}
            className="text-xs"
          >
            Unassigned
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateFilter('dateRange', {
              from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              to: new Date()
            })}
            className="text-xs"
          >
            Last 7 Days
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { 
  Filter, 
  X, 
  Calendar, 
  Tag, 
  User, 
  Star, 
  MapPin, 
  DollarSign,
  Save,
  Settings,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useFilterPresets } from "@/hooks/use-global-search"
import type { AdvancedFilters, FilterPreset } from "@/lib/types/search"

interface AdvancedFiltersProps {
  filters: AdvancedFilters
  onFiltersChange: (filters: AdvancedFilters) => void
  onClearFilters: () => void
  type?: 'forms' | 'blog' | 'portfolio' | 'testimonials' | 'global'
  className?: string
}

export function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  type = 'global',
  className 
}: AdvancedFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']))
  const [showSavePreset, setShowSavePreset] = useState(false)
  const [presetName, setPresetName] = useState("")
  const [presetDescription, setPresetDescription] = useState("")

  const { presets, createPreset, deletePreset } = useFilterPresets(type)

  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    onFiltersChange(newFilters)
  }

  const toggleArrayFilter = (key: keyof AdvancedFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || []
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    updateFilter(key, newArray.length > 0 ? newArray : undefined)
  }

  const clearFilter = (key: keyof AdvancedFilters) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onFiltersChange(newFilters)
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof AdvancedFilters]
    return value !== undefined && value !== null && 
           (Array.isArray(value) ? value.length > 0 : 
            typeof value === 'object' && value !== null ? Object.keys(value).length > 0 : true)
  })

  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof AdvancedFilters]
    return value !== undefined && value !== null && 
           (Array.isArray(value) ? value.length > 0 : 
            typeof value === 'object' && value !== null ? Object.keys(value).length > 0 : true)
  }).length

  const handleSavePreset = async () => {
    if (!presetName.trim()) return

    try {
      await createPreset({
        name: presetName,
        description: presetDescription || undefined,
        type,
        filters,
        isDefault: false,
        isShared: false
      })
      setPresetName("")
      setPresetDescription("")
      setShowSavePreset(false)
    } catch (error) {
      console.error('Failed to save preset:', error)
    }
  }

  const applyPreset = (preset: FilterPreset) => {
    onFiltersChange(preset.filters as AdvancedFilters)
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-base">Advanced Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                Clear all
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSavePreset(!showSavePreset)}
            >
              <Save className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Save Preset */}
        {showSavePreset && (
          <Card className="p-3 bg-muted/50">
            <div className="space-y-2">
              <Input
                placeholder="Preset name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
              <Input
                placeholder="Description (optional)"
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSavePreset} disabled={!presetName.trim()}>
                  Save Preset
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowSavePreset(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Filter Presets */}
        {presets.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Saved Presets</Label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <div key={preset.id} className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset)}
                    className="text-xs"
                  >
                    {preset.name}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePreset(preset.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Basic Filters */}
        <Collapsible 
          open={expandedSections.has('basic')} 
          onOpenChange={() => toggleSection('basic')}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="font-medium">Basic Filters</span>
              {expandedSections.has('basic') ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-3">
            {/* Search */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Search</Label>
              <Input
                placeholder="Search keywords..."
                value={filters.search || ""}
                onChange={(e) => updateFilter('search', e.target.value || undefined)}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tags</Label>
              <Input
                placeholder="Enter tags separated by commas"
                value={filters.tags?.join(', ') || ""}
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  updateFilter('tags', tags.length > 0 ? tags : undefined)
                }}
              />
              {filters.tags && filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {filters.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newTags = filters.tags?.filter(t => t !== tag)
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

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date Range</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-start text-left">
                      <Calendar className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from ? 
                        format(filters.dateRange.from, "MMM dd, yyyy") : 
                        "From date"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateRange?.from}
                      onSelect={(date) => {
                        if (date) {
                          updateFilter('dateRange', {
                            from: date,
                            to: filters.dateRange?.to || date
                          })
                        }
                      }}
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-start text-left">
                      <Calendar className="mr-2 h-4 w-4" />
                      {filters.dateRange?.to ? 
                        format(filters.dateRange.to, "MMM dd, yyyy") : 
                        "To date"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.dateRange?.to}
                      onSelect={(date) => {
                        if (date && filters.dateRange?.from) {
                          updateFilter('dateRange', {
                            from: filters.dateRange.from,
                            to: date
                          })
                        }
                      }}
                      disabled={(date) => 
                        date > new Date() || 
                        (filters.dateRange?.from && date < filters.dateRange.from)
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {filters.dateRange && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter('dateRange')}
                  className="text-xs"
                >
                  Clear date range
                </Button>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Forms Specific Filters */}
        {(type === 'forms' || type === 'global') && (
          <>
            <Separator />
            <Collapsible 
              open={expandedSections.has('forms')} 
              onOpenChange={() => toggleSection('forms')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <span className="font-medium">Form Filters</span>
                  {expandedSections.has('forms') ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-3">
                {/* Form Status */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Form Status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['new', 'in_progress', 'responded', 'completed', 'archived'].map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`form-status-${status}`}
                          checked={filters.formStatus?.includes(status) || false}
                          onCheckedChange={() => toggleArrayFilter('formStatus', status)}
                        />
                        <Label htmlFor={`form-status-${status}`} className="text-sm capitalize">
                          {status.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Priority */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Priority</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['low', 'medium', 'high', 'urgent'].map((priority) => (
                      <div key={priority} className="flex items-center space-x-2">
                        <Checkbox
                          id={`form-priority-${priority}`}
                          checked={filters.formPriority?.includes(priority) || false}
                          onCheckedChange={() => toggleArrayFilter('formPriority', priority)}
                        />
                        <Label htmlFor={`form-priority-${priority}`} className="text-sm capitalize">
                          {priority}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assigned To */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <Select
                    value={filters.assignedTo || ""}
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
                    </SelectContent>
                  </Select>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}

        {/* Portfolio Specific Filters */}
        {(type === 'portfolio' || type === 'global') && (
          <>
            <Separator />
            <Collapsible 
              open={expandedSections.has('portfolio')} 
              onOpenChange={() => toggleSection('portfolio')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <span className="font-medium">Portfolio Filters</span>
                  {expandedSections.has('portfolio') ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-3">
                {/* Service Category */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Service Category</Label>
                  <div className="space-y-2">
                    {['electrical', 'hvac', 'refrigeration'].map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`service-${category}`}
                          checked={filters.serviceCategory?.includes(category) || false}
                          onCheckedChange={() => toggleArrayFilter('serviceCategory', category)}
                        />
                        <Label htmlFor={`service-${category}`} className="text-sm capitalize">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Value Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Project Value Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Min ($)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={filters.projectValue?.min || ""}
                        onChange={(e) => {
                          const min = e.target.value ? parseInt(e.target.value) : undefined
                          updateFilter('projectValue', {
                            ...filters.projectValue,
                            min
                          })
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Max ($)</Label>
                      <Input
                        type="number"
                        placeholder="No limit"
                        value={filters.projectValue?.max || ""}
                        onChange={(e) => {
                          const max = e.target.value ? parseInt(e.target.value) : undefined
                          updateFilter('projectValue', {
                            ...filters.projectValue,
                            max
                          })
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Location</Label>
                  <Input
                    placeholder="Enter location"
                    value={filters.location || ""}
                    onChange={(e) => updateFilter('location', e.target.value || undefined)}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}

        {/* Testimonial Specific Filters */}
        {(type === 'testimonials' || type === 'global') && (
          <>
            <Separator />
            <Collapsible 
              open={expandedSections.has('testimonials')} 
              onOpenChange={() => toggleSection('testimonials')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <span className="font-medium">Testimonial Filters</span>
                  {expandedSections.has('testimonials') ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-3">
                {/* Rating Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Rating Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Min Rating</Label>
                      <Select
                        value={filters.rating?.min?.toString() || ""}
                        onValueChange={(value) => {
                          const min = value ? parseInt(value) : undefined
                          updateFilter('rating', {
                            ...filters.rating,
                            min
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any rating</SelectItem>
                          <SelectItem value="1">1 star</SelectItem>
                          <SelectItem value="2">2 stars</SelectItem>
                          <SelectItem value="3">3 stars</SelectItem>
                          <SelectItem value="4">4 stars</SelectItem>
                          <SelectItem value="5">5 stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Max Rating</Label>
                      <Select
                        value={filters.rating?.max?.toString() || ""}
                        onValueChange={(value) => {
                          const max = value ? parseInt(value) : undefined
                          updateFilter('rating', {
                            ...filters.rating,
                            max
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any rating</SelectItem>
                          <SelectItem value="1">1 star</SelectItem>
                          <SelectItem value="2">2 stars</SelectItem>
                          <SelectItem value="3">3 stars</SelectItem>
                          <SelectItem value="4">4 stars</SelectItem>
                          <SelectItem value="5">5 stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Project Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Project Type</Label>
                  <Input
                    placeholder="Enter project types separated by commas"
                    value={filters.projectType?.join(', ') || ""}
                    onChange={(e) => {
                      const types = e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                      updateFilter('projectType', types.length > 0 ? types : undefined)
                    }}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}

        {/* Common Filters */}
        <Separator />
        <Collapsible 
          open={expandedSections.has('common')} 
          onOpenChange={() => toggleSection('common')}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="font-medium">Common Filters</span>
              {expandedSections.has('common') ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-3">
            {/* Featured */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={filters.featured || false}
                onCheckedChange={(checked) => updateFilter('featured', checked || undefined)}
              />
              <Label htmlFor="featured" className="text-sm">
                Featured items only
              </Label>
            </div>

            {/* Visible */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="visible"
                checked={filters.visible || false}
                onCheckedChange={(checked) => updateFilter('visible', checked || undefined)}
              />
              <Label htmlFor="visible" className="text-sm">
                Visible items only
              </Label>
            </div>

            {/* Author */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Author</Label>
              <Select
                value={filters.author || ""}
                onValueChange={(value) => updateFilter('author', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select author" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All authors</SelectItem>
                  <SelectItem value="admin">Admin User</SelectItem>
                  <SelectItem value="john_doe">John Doe</SelectItem>
                  <SelectItem value="jane_smith">Jane Smith</SelectItem>
                  <SelectItem value="mike_wilson">Mike Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
/**
 * Mobile-optimized search and filter component for forms
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Search,
    Filter,
    X,
    Calendar,
    User,
    MessageSquare,
    AlertCircle
} from "lucide-react"
import type { FormFilters } from "@/lib/types"

interface MobileSearchFilterProps {
    filters: FormFilters
    onFiltersChange: (filters: FormFilters) => void
    onClearFilters: () => void
    totalResults: number
}

export function MobileSearchFilter({
    filters,
    onFiltersChange,
    onClearFilters,
    totalResults
}: MobileSearchFilterProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchValue, setSearchValue] = useState(filters.search || '')

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onFiltersChange({ ...filters, search: searchValue })
    }

    const handleFilterChange = (key: keyof FormFilters, value: any) => {
        onFiltersChange({ ...filters, [key]: value })
    }

    const activeFiltersCount = Object.keys(filters).filter(key => {
        const value = filters[key as keyof FormFilters]
        return value && (Array.isArray(value) ? value.length > 0 : true)
    }).length

    return (
        <div className="space-y-3">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search forms..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="pl-10 touch-manipulation"
                    />
                </div>
                <Button type="submit" size="sm" className="px-4 touch-manipulation">
                    Search
                </Button>
            </form>

            {/* Filter Button and Active Filters */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="touch-manipulation">
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                                {activeFiltersCount > 0 && (
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                        {activeFiltersCount}
                                    </Badge>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[80vh]">
                            <SheetHeader>
                                <SheetTitle>Filter Forms</SheetTitle>
                                <SheetDescription>
                                    Filter forms by status, priority, type, and more
                                </SheetDescription>
                            </SheetHeader>

                            <div className="mt-6 space-y-6">
                                {/* Status Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Status
                                    </label>
                                    <Select
                                        value={filters.status?.[0] || ""}
                                        onValueChange={(value) =>
                                            handleFilterChange('status', value ? [value] : [])
                                        }
                                    >
                                        <SelectTrigger className="touch-manipulation">
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All statuses</SelectItem>
                                            <SelectItem value="NEW">New</SelectItem>
                                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                            <SelectItem value="COMPLETED">Completed</SelectItem>
                                            <SelectItem value="RESPONDED">Responded</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Priority Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Priority
                                    </label>
                                    <Select
                                        value={filters.priority?.[0] || ""}
                                        onValueChange={(value) =>
                                            handleFilterChange('priority', value ? [value] : [])
                                        }
                                    >
                                        <SelectTrigger className="touch-manipulation">
                                            <SelectValue placeholder="All priorities" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All priorities</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Type Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Form Type
                                    </label>
                                    <Select
                                        value={filters.type?.[0] || ""}
                                        onValueChange={(value) =>
                                            handleFilterChange('type', value ? [value] : [])
                                        }
                                    >
                                        <SelectTrigger className="touch-manipulation">
                                            <SelectValue placeholder="All types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All types</SelectItem>
                                            <SelectItem value="contact">Contact</SelectItem>
                                            <SelectItem value="quote">Quote Request</SelectItem>
                                            <SelectItem value="support">Support</SelectItem>
                                            <SelectItem value="feedback">Feedback</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Assigned To Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Assigned To
                                    </label>
                                    <Select
                                        value={filters.assignedTo || ""}
                                        onValueChange={(value) =>
                                            handleFilterChange('assignedTo', value || undefined)
                                        }
                                    >
                                        <SelectTrigger className="touch-manipulation">
                                            <SelectValue placeholder="All assignments" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All assignments</SelectItem>
                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                            <SelectItem value="me">Assigned to me</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date Range Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Date Range
                                    </label>
                                    <Select
                                        value={filters.dateRange || ""}
                                        onValueChange={(value) =>
                                            handleFilterChange('dateRange', value || undefined)
                                        }
                                    >
                                        <SelectTrigger className="touch-manipulation">
                                            <SelectValue placeholder="All dates" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All dates</SelectItem>
                                            <SelectItem value="today">Today</SelectItem>
                                            <SelectItem value="yesterday">Yesterday</SelectItem>
                                            <SelectItem value="this-week">This week</SelectItem>
                                            <SelectItem value="last-week">Last week</SelectItem>
                                            <SelectItem value="this-month">This month</SelectItem>
                                            <SelectItem value="last-month">Last month</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-4">
                                    <Button
                                        onClick={onClearFilters}
                                        variant="outline"
                                        className="flex-1 touch-manipulation"
                                    >
                                        Clear All
                                    </Button>
                                    <Button
                                        onClick={() => setIsOpen(false)}
                                        className="flex-1 touch-manipulation"
                                    >
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {activeFiltersCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearFilters}
                            className="text-gray-500 hover:text-gray-700 touch-manipulation"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>

                <div className="text-sm text-gray-500">
                    {totalResults} results
                </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2">
                    {filters.search && (
                        <Badge variant="secondary" className="text-xs">
                            Search: {filters.search}
                            <button
                                onClick={() => onFiltersChange({ ...filters, search: undefined })}
                                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {filters.status?.map(status => (
                        <Badge key={status} variant="secondary" className="text-xs">
                            Status: {status}
                            <button
                                onClick={() => onFiltersChange({
                                    ...filters,
                                    status: filters.status?.filter(s => s !== status)
                                })}
                                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                    {filters.priority?.map(priority => (
                        <Badge key={priority} variant="secondary" className="text-xs">
                            Priority: {priority}
                            <button
                                onClick={() => onFiltersChange({
                                    ...filters,
                                    priority: filters.priority?.filter(p => p !== priority)
                                })}
                                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    )
}
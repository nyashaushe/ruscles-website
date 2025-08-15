"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Eye, 
  MessageSquare, 
  Archive, 
  User,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"
import { PriorityBadge } from "@/components/ui/priority-badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { BulkActions } from "./bulk-actions"
import { formatRelativeTime, formatFormType } from "@/lib/utils"
import type { FormSubmission } from "@/lib/types"

interface FormsTableProps {
  forms: FormSubmission[]
  loading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  onRefresh: () => void
  onBulkUpdate?: (updates: Partial<FormSubmission>, formIds: string[]) => Promise<void>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (field: string) => void
}

export function FormsTable({ 
  forms, 
  loading, 
  pagination, 
  onPageChange, 
  onRefresh,
  onBulkUpdate,
  sortBy,
  sortOrder,
  onSort
}: FormsTableProps) {
  const [selectedForms, setSelectedForms] = useState<string[]>([])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedForms(forms.map(form => form.id))
    } else {
      setSelectedForms([])
    }
  }

  const handleSelectForm = (formId: string, checked: boolean) => {
    if (checked) {
      setSelectedForms(prev => [...prev, formId])
    } else {
      setSelectedForms(prev => prev.filter(id => id !== formId))
    }
  }

  const isAllSelected = forms.length > 0 && selectedForms.length === forms.length
  const isPartiallySelected = selectedForms.length > 0 && selectedForms.length < forms.length

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-3 w-3 ml-1" />
    return sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />
  }

  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (forms.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No form submissions found"
        description="There are no form submissions matching your current filters. Try adjusting your search criteria or check back later."
        action={{
          label: "Refresh",
          onClick: onRefresh
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {onBulkUpdate && (
        <BulkActions
          selectedFormIds={selectedForms}
          onBulkUpdate={onBulkUpdate}
          onClearSelection={() => setSelectedForms([])}
        />
      )}

      {/* Desktop Table with Mobile Horizontal Scroll */}
      <div className="hidden md:block rounded-md border overflow-x-auto">
        <div className="min-w-[800px]"> {/* Minimum width for proper table layout */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all forms"
                  {...(isPartiallySelected && { "data-state": "indeterminate" })}
                />
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('customerName')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Customer
                  {onSort && getSortIcon('customerName')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('type')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Type
                  {onSort && getSortIcon('type')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('status')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Status
                  {onSort && getSortIcon('status')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('priority')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Priority
                  {onSort && getSortIcon('priority')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('submittedAt')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Submitted
                  {onSort && getSortIcon('submittedAt')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('assignedTo')}
                  className="h-auto p-0 font-medium hover:bg-transparent"
                >
                  Assigned
                  {onSort && getSortIcon('assignedTo')}
                </Button>
              </TableHead>
              <TableHead className="w-12">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form) => (
              <TableRow key={form.id} className="hover:bg-gray-50">
                <TableCell>
                  <Checkbox
                    checked={selectedForms.includes(form.id)}
                    onCheckedChange={(checked) => handleSelectForm(form.id, checked as boolean)}
                    aria-label={`Select form from ${form.customerInfo.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900">
                      {form.customerInfo.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {form.customerInfo.email}
                    </div>
                    {form.customerInfo.company && (
                      <div className="text-xs text-gray-400">
                        {form.customerInfo.company}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {formatFormType(form.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={form.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={form.priority} />
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900">
                    {formatRelativeTime(form.submittedAt)}
                  </div>
                </TableCell>
                <TableCell>
                  {form.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{form.assignedTo}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/forms/${form.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/forms/${form.id}/respond`}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Respond
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <User className="h-4 w-4 mr-2" />
                        Assign to Me
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Mobile Cards with Enhanced Touch Interactions */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
              aria-label="Select all forms"
              {...(isPartiallySelected && { "data-state": "indeterminate" })}
              className="h-5 w-5" // Larger touch target
            />
            <span className="text-sm text-gray-600 font-medium">
              {selectedForms.length > 0 ? `${selectedForms.length} selected` : 'Select all'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-9 w-9 p-0 touch-manipulation" // Larger touch target
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        {forms.map((form) => (
          <div 
            key={form.id} 
            className="bg-white border rounded-lg p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow touch-manipulation"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Checkbox
                  checked={selectedForms.includes(form.id)}
                  onCheckedChange={(checked) => handleSelectForm(form.id, checked as boolean)}
                  aria-label={`Select form from ${form.customerInfo.name}`}
                  className="mt-1 h-5 w-5 flex-shrink-0" // Larger touch target, prevent shrinking
                />
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="font-medium text-gray-900 truncate">
                    {form.customerInfo.name}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {form.customerInfo.email}
                  </div>
                  {form.customerInfo.company && (
                    <div className="text-xs text-gray-400 truncate">
                      {form.customerInfo.company}
                    </div>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-9 w-9 p-0 flex-shrink-0 touch-manipulation"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/forms/${form.id}`} className="flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/forms/${form.id}/respond`} className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Respond
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Assign to Me
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs px-2 py-1">
                {formatFormType(form.type)}
              </Badge>
              <StatusBadge status={form.status} />
              <PriorityBadge priority={form.priority} />
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{formatRelativeTime(form.submittedAt)}</span>
              </div>
              {form.assignedTo ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <User className="h-3 w-3" />
                  <span className="text-xs truncate max-w-20">{form.assignedTo}</span>
                </div>
              ) : (
                <span className="text-xs text-gray-400 flex-shrink-0">Unassigned</span>
              )}
            </div>
            
            {/* Quick Actions for Mobile */}
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                asChild 
                className="flex-1 h-9 touch-manipulation"
              >
                <Link href={`/admin/forms/${form.id}`}>
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Link>
              </Button>
              <Button 
                size="sm" 
                asChild 
                className="flex-1 h-9 touch-manipulation"
              >
                <Link href={`/admin/forms/${form.id}/respond`}>
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Respond
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
              {pagination.totalPages > 5 && (
                <>
                  <span className="text-gray-400">...</span>
                  <Button
                    variant={pagination.page === pagination.totalPages ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pagination.totalPages)}
                    className="w-8 h-8 p-0"
                  >
                    {pagination.totalPages}
                  </Button>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MoreHorizontal, Eye, EyeOff, Star, StarOff, Edit, Trash2, ArrowUpDown, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { usePortfolio } from '@/hooks/use-portfolio'
import { formatDate } from '@/lib/utils/date'
import { formatCurrency } from '@/lib/utils/formatting'
import type { PortfolioItem } from '@/lib/types/content'

interface PortfolioTableProps {
  items: PortfolioItem[]
}

type SortField = 'title' | 'serviceCategory' | 'completionDate' | 'displayOrder' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export function PortfolioTable({ items }: PortfolioTableProps) {
  const [deleteItem, setDeleteItem] = useState<PortfolioItem | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>('displayOrder')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  
  const { deletePortfolioItem, toggleFeatured, toggleVisibility, updateDisplayOrder } = usePortfolio()

  const handleDelete = async () => {
    if (deleteItem) {
      await deletePortfolioItem(deleteItem.id)
      setDeleteItem(null)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedItems = [...items].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    if (sortField === 'completionDate' || sortField === 'createdAt') {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? items.map(item => item.id) : [])
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => 
      checked 
        ? [...prev, itemId]
        : prev.filter(id => id !== itemId)
    )
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'electrical':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'hvac':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'refrigeration':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border overflow-x-auto">
        <div className="min-w-[1000px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedItems.length === items.length && items.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-12">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </TableHead>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('title')}
                  className="h-auto p-0 font-semibold"
                >
                  Title
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('serviceCategory')}
                  className="h-auto p-0 font-semibold"
                >
                  Category
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Client</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('completionDate')}
                  className="h-auto p-0 font-semibold"
                >
                  Completed
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('displayOrder')}
                  className="h-auto p-0 font-semibold"
                >
                  Order
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                </TableCell>
                <TableCell>
                  <div className="relative w-12 h-12 rounded overflow-hidden">
                    <Image
                      src={item.thumbnailImage || '/placeholder.jpg'}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {item.description}
                    </div>
                    {item.tags.length > 0 && (
                      <div className="flex gap-1">
                        {item.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getCategoryColor(item.serviceCategory)}>
                    {item.serviceCategory.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {item.clientName && (
                      <div className="text-sm">{item.clientName}</div>
                    )}
                    {item.location && (
                      <div className="text-xs text-muted-foreground">{item.location}</div>
                    )}
                    {item.projectValue && (
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(item.projectValue)}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDate(item.completionDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {item.isVisible ? (
                        <Badge variant="outline" className="text-green-600">
                          <Eye className="h-3 w-3 mr-1" />
                          Visible
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Hidden
                        </Badge>
                      )}
                    </div>
                    {item.isFeatured && (
                      <Badge variant="outline" className="text-amber-600">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-mono">
                    {item.displayOrder}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/admin/content/portfolio/${item.id}/edit`}>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        onClick={() => toggleVisibility(item.id, !item.isVisible)}
                      >
                        {item.isVisible ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Show
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleFeatured(item.id, !item.isFeatured)}
                      >
                        {item.isFeatured ? (
                          <>
                            <StarOff className="h-4 w-4 mr-2" />
                            Unfeature
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Feature
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteItem(item)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedItems.length === items.length && items.length > 0}
              onCheckedChange={handleSelectAll}
              className="h-5 w-5"
            />
            <span className="text-sm text-gray-600 font-medium">
              {selectedItems.length > 0 ? `${selectedItems.length} selected` : 'Select all'}
            </span>
          </div>
        </div>

        {sortedItems.map((item) => (
          <div key={item.id} className="bg-white border rounded-lg p-4 space-y-3 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                  className="mt-1 h-5 w-5 flex-shrink-0"
                />
                <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={item.thumbnailImage || '/placeholder.jpg'}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 truncate">
                    {item.title}
                  </div>
                  <div className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {item.description}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 flex-shrink-0 touch-manipulation">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <Link href={`/admin/content/portfolio/${item.id}/edit`}>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    onClick={() => toggleVisibility(item.id, !item.isVisible)}
                  >
                    {item.isVisible ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Show
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toggleFeatured(item.id, !item.isFeatured)}
                  >
                    {item.isFeatured ? (
                      <>
                        <StarOff className="h-4 w-4 mr-2" />
                        Unfeature
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4 mr-2" />
                        Feature
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteItem(item)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className={getCategoryColor(item.serviceCategory)}>
                {item.serviceCategory.toUpperCase()}
              </Badge>
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
              <div className="space-y-1">
                {item.clientName && (
                  <div className="font-medium text-gray-700">{item.clientName}</div>
                )}
                <div>{formatDate(item.completionDate)}</div>
                {item.location && (
                  <div className="text-xs">{item.location}</div>
                )}
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center gap-2">
                  {item.isVisible ? (
                    <Badge variant="outline" className="text-green-600 text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      Visible
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500 text-xs">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Hidden
                    </Badge>
                  )}
                </div>
                {item.isFeatured && (
                  <Badge variant="outline" className="text-amber-600 text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <div className="text-xs font-mono">
                  Order: {item.displayOrder}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                asChild 
                className="flex-1 h-9 touch-manipulation"
              >
                <Link href={`/admin/content/portfolio/${item.id}/edit`}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Link>
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => toggleVisibility(item.id, !item.isVisible)}
                className="flex-1 h-9 touch-manipulation"
              >
                {item.isVisible ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Show
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Portfolio Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteItem?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
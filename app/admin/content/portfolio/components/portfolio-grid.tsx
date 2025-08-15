'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MoreHorizontal, Eye, EyeOff, Star, StarOff, Edit, Trash2, Calendar, MapPin, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { usePortfolio } from '@/hooks/use-portfolio'
import { formatDate } from '@/lib/utils/date'
import { formatCurrency } from '@/lib/utils/formatting'
import type { PortfolioItem } from '@/lib/types/content'

interface PortfolioGridProps {
  items: PortfolioItem[]
}

export function PortfolioGrid({ items }: PortfolioGridProps) {
  const [deleteItem, setDeleteItem] = useState<PortfolioItem | null>(null)
  const { deletePortfolioItem, toggleFeatured, toggleVisibility } = usePortfolio()

  const handleDelete = async () => {
    if (deleteItem) {
      await deletePortfolioItem(deleteItem.id)
      setDeleteItem(null)
    }
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader className="p-0">
              <div className="relative aspect-video">
                <Image
                  src={item.thumbnailImage || '/placeholder.jpg'}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-2">
                  <Badge className={getCategoryColor(item.serviceCategory)}>
                    {item.serviceCategory.toUpperCase()}
                  </Badge>
                  {item.isFeatured && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
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
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg line-clamp-2">{item.title}</h3>
                  {!item.isVisible && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Hidden
                    </Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.tags.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  {item.clientName && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Client:</span>
                      {item.clientName}
                    </div>
                  )}
                  {item.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(item.completionDate)}
                  </div>
                  {item.projectValue && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(item.projectValue)}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <div className="flex items-center justify-between w-full">
                <div className="text-xs text-muted-foreground">
                  {item.images.length} image{item.images.length !== 1 ? 's' : ''}
                </div>
                <Link href={`/admin/content/portfolio/${item.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
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
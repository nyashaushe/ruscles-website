"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Star,
  Eye,
  EyeOff,
  GripVertical,
  Calendar,
} from "lucide-react"
import { Testimonial } from "@/lib/types/content"
import { formatDate } from "@/lib/utils/date"

interface SortableTestimonialRowProps {
  testimonial: Testimonial
  onToggleVisibility: (testimonial: Testimonial) => void
  onToggleFeatured: (testimonial: Testimonial) => void
  onDelete: (id: string, customerName: string) => void
}

function SortableTestimonialCard({
  testimonial,
  onToggleVisibility,
  onToggleFeatured,
  onDelete,
}: SortableTestimonialRowProps) {
  const router = useRouter()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: testimonial.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const renderStars = (rating?: number) => {
    if (!rating) return null
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">({rating})</span>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-4 space-y-3 touch-manipulation ${
        isDragging ? "shadow-lg" : "shadow-sm"
      }`}
    >
      {/* Header with drag handle and actions */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -m-1 touch-manipulation"
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={testimonial.customerPhoto} />
            <AvatarFallback className="text-sm">
              {getInitials(testimonial.customerName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">
              {testimonial.customerName}
            </div>
            {testimonial.customerTitle && (
              <div className="text-sm text-gray-500 truncate">
                {testimonial.customerTitle}
                {testimonial.customerCompany && ` at ${testimonial.customerCompany}`}
              </div>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 p-0 flex-shrink-0 touch-manipulation">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/admin/content/testimonials/${testimonial.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleVisibility(testimonial)}>
              {testimonial.isVisible ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Show
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleFeatured(testimonial)}>
              <Star className="mr-2 h-4 w-4" />
              {testimonial.isFeatured ? 'Unfeature' : 'Feature'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => onDelete(testimonial.id, testimonial.customerName)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Testimonial text */}
      <div className="pl-8">
        <p className="text-sm text-gray-900 line-clamp-3">
          "{testimonial.testimonialText}"
        </p>
      </div>

      {/* Rating and project type */}
      <div className="flex items-center justify-between pl-8">
        <div className="flex items-center gap-3">
          {renderStars(testimonial.rating)}
          {testimonial.projectType && (
            <Badge variant="outline" className="capitalize text-xs">
              {testimonial.projectType}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="h-3 w-3" />
          {formatDate(new Date(testimonial.createdAt))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pl-8 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={testimonial.isVisible}
              onCheckedChange={() => onToggleVisibility(testimonial)}
            />
            <span className="text-sm text-gray-600">
              {testimonial.isVisible ? 'Visible' : 'Hidden'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={testimonial.isFeatured}
              onCheckedChange={() => onToggleFeatured(testimonial)}
            />
            <span className="text-sm text-gray-600">Featured</span>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push(`/admin/content/testimonials/${testimonial.id}/edit`)}
          className="touch-manipulation"
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
      </div>
    </div>
  )
}

function SortableTestimonialRow({
  testimonial,
  onToggleVisibility,
  onToggleFeatured,
  onDelete,
}: SortableTestimonialRowProps) {
  const router = useRouter()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: testimonial.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const renderStars = (rating?: number) => {
    if (!rating) return null
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">({rating})</span>
      </div>
    )
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? "bg-gray-50" : ""}
    >
      <TableCell>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={testimonial.customerPhoto} />
            <AvatarFallback className="text-xs">
              {getInitials(testimonial.customerName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">
              {testimonial.customerName}
            </div>
            {testimonial.customerTitle && (
              <div className="text-sm text-gray-500">
                {testimonial.customerTitle}
                {testimonial.customerCompany && ` at ${testimonial.customerCompany}`}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 line-clamp-2">
            "{testimonial.testimonialText}"
          </p>
        </div>
      </TableCell>
      <TableCell>
        {renderStars(testimonial.rating)}
      </TableCell>
      <TableCell>
        {testimonial.projectType ? (
          <Badge variant="outline" className="capitalize">
            {testimonial.projectType}
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={testimonial.isVisible}
            onCheckedChange={() => onToggleVisibility(testimonial)}
          />
          {testimonial.isVisible ? (
            <Eye className="h-4 w-4 text-green-600" />
          ) : (
            <EyeOff className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={testimonial.isFeatured}
            onCheckedChange={() => onToggleFeatured(testimonial)}
          />
          {testimonial.isFeatured && (
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="h-3 w-3" />
          {formatDate(new Date(testimonial.createdAt))}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/admin/content/testimonials/${testimonial.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleVisibility(testimonial)}>
              {testimonial.isVisible ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Show
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleFeatured(testimonial)}>
              <Star className="mr-2 h-4 w-4" />
              {testimonial.isFeatured ? 'Unfeature' : 'Feature'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => onDelete(testimonial.id, testimonial.customerName)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

interface TestimonialsSortableTableProps {
  testimonials: Testimonial[]
  onReorder: (testimonials: Testimonial[]) => void
  onToggleVisibility: (testimonial: Testimonial) => void
  onToggleFeatured: (testimonial: Testimonial) => void
  onDelete: (id: string, customerName: string) => void
}

export function TestimonialsSortableTable({
  testimonials,
  onReorder,
  onToggleVisibility,
  onToggleFeatured,
  onDelete,
}: TestimonialsSortableTableProps) {
  const [items, setItems] = useState(testimonials)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts (better for touch)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Update items when testimonials prop changes
  useEffect(() => {
    setItems(testimonials)
  }, [testimonials])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over?.id)
      
      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)
      onReorder(newItems)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Testimonials ({testimonials.length})</CardTitle>
        <CardDescription>
          Drag and drop to reorder testimonials. Changes are saved automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Testimonial</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Project Type</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                  {items.map((testimonial) => (
                    <SortableTestimonialRow
                      key={testimonial.id}
                      testimonial={testimonial}
                      onToggleVisibility={onToggleVisibility}
                      onToggleFeatured={onToggleFeatured}
                      onDelete={onDelete}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
              {items.map((testimonial) => (
                <SortableTestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  onToggleVisibility={onToggleVisibility}
                  onToggleFeatured={onToggleFeatured}
                  onDelete={onDelete}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      </CardContent>
    </Card>
  )
}
"use client"

import { useState } from "react"
import { 
  Bookmark, 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  Star, 
  Globe, 
  Lock,
  Calendar,
  Tag,
  Filter,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useSavedSearches } from "@/hooks/use-global-search"
import { formatDate } from "@/lib/utils/date"
import type { SavedSearch, GlobalSearchFilters } from "@/lib/types/search"

interface SavedSearchesProps {
  onSearchSelect?: (search: SavedSearch) => void
  className?: string
}

export function SavedSearches({ onSearchSelect, className }: SavedSearchesProps) {
  const { savedSearches, loading, error, createSavedSearch, updateSavedSearch, deleteSavedSearch } = useSavedSearches()
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const handleSearchClick = (search: SavedSearch) => {
    if (onSearchSelect) {
      onSearchSelect(search)
    }
  }

  const handleEdit = (search: SavedSearch) => {
    setEditingSearch(search)
  }

  const handleDelete = async (search: SavedSearch) => {
    if (window.confirm(`Are you sure you want to delete "${search.name}"?`)) {
      try {
        await deleteSavedSearch(search.id)
      } catch (error) {
        console.error('Failed to delete saved search:', error)
      }
    }
  }

  const getFilterSummary = (filters: GlobalSearchFilters) => {
    const summary: string[] = []
    
    if (filters.types?.length) {
      summary.push(`${filters.types.length} type${filters.types.length > 1 ? 's' : ''}`)
    }
    if (filters.status?.length) {
      summary.push(`${filters.status.length} status${filters.status.length > 1 ? 'es' : ''}`)
    }
    if (filters.tags?.length) {
      summary.push(`${filters.tags.length} tag${filters.tags.length > 1 ? 's' : ''}`)
    }
    if (filters.dateRange) {
      summary.push('date range')
    }
    if (filters.author) {
      summary.push('author')
    }

    return summary.length > 0 ? summary.join(', ') : 'No filters'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Failed to load saved searches</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4" />
          <h3 className="font-medium">Saved Searches</h3>
          <Badge variant="secondary" className="text-xs">
            {savedSearches.length}
          </Badge>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-3 w-3 mr-1" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CreateSavedSearchDialog
              onSave={async (data) => {
                await createSavedSearch(data)
                setShowCreateDialog(false)
              }}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {savedSearches.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved searches"
          description="Save your frequently used searches for quick access"
          action={
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Saved Search
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {savedSearches.map((search) => (
            <Card key={search.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Button
                        variant="ghost"
                        className="p-0 h-auto font-medium text-left justify-start"
                        onClick={() => handleSearchClick(search)}
                      >
                        {search.name}
                      </Button>
                      {search.isGlobal && (
                        <Badge variant="outline" className="text-xs">
                          <Globe className="h-2 w-2 mr-1" />
                          Global
                        </Badge>
                      )}
                    </div>
                    
                    {search.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {search.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Search className="h-3 w-3" />
                        "{search.query}"
                      </div>
                      <div className="flex items-center gap-1">
                        <Filter className="h-3 w-3" />
                        {getFilterSummary(search.filters)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(search.updatedAt)}
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleSearchClick(search)}>
                        <Search className="mr-2 h-4 w-4" />
                        Run Search
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(search)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDelete(search)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingSearch && (
        <Dialog open={!!editingSearch} onOpenChange={() => setEditingSearch(null)}>
          <DialogContent>
            <EditSavedSearchDialog
              search={editingSearch}
              onSave={async (data) => {
                await updateSavedSearch(editingSearch.id, data)
                setEditingSearch(null)
              }}
              onCancel={() => setEditingSearch(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface CreateSavedSearchDialogProps {
  onSave: (data: Omit<SavedSearch, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>
  onCancel: () => void
}

function CreateSavedSearchDialog({ onSave, onCancel }: CreateSavedSearchDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [query, setQuery] = useState("")
  const [isGlobal, setIsGlobal] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !query.trim()) return

    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        query: query.trim(),
        filters: {}, // Start with empty filters, can be edited later
        isGlobal
      })
    } catch (error) {
      console.error('Failed to create saved search:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Saved Search</DialogTitle>
        <DialogDescription>
          Save a search query for quick access later
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            placeholder="Enter search name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="query">Search Query *</Label>
          <Input
            id="query"
            placeholder="Enter search query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isGlobal"
            checked={isGlobal}
            onCheckedChange={(checked) => setIsGlobal(checked as boolean)}
          />
          <Label htmlFor="isGlobal" className="text-sm">
            Global search (search across all content types)
          </Label>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={!name.trim() || !query.trim() || saving}
        >
          {saving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
          Save Search
        </Button>
      </DialogFooter>
    </>
  )
}

interface EditSavedSearchDialogProps {
  search: SavedSearch
  onSave: (data: Partial<SavedSearch>) => Promise<void>
  onCancel: () => void
}

function EditSavedSearchDialog({ search, onSave, onCancel }: EditSavedSearchDialogProps) {
  const [name, setName] = useState(search.name)
  const [description, setDescription] = useState(search.description || "")
  const [query, setQuery] = useState(search.query)
  const [isGlobal, setIsGlobal] = useState(search.isGlobal)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !query.trim()) return

    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        query: query.trim(),
        isGlobal
      })
    } catch (error) {
      console.error('Failed to update saved search:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Saved Search</DialogTitle>
        <DialogDescription>
          Update your saved search details
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            placeholder="Enter search name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="query">Search Query *</Label>
          <Input
            id="query"
            placeholder="Enter search query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isGlobal"
            checked={isGlobal}
            onCheckedChange={(checked) => setIsGlobal(checked as boolean)}
          />
          <Label htmlFor="isGlobal" className="text-sm">
            Global search (search across all content types)
          </Label>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={!name.trim() || !query.trim() || saving}
        >
          {saving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
          Save Changes
        </Button>
      </DialogFooter>
    </>
  )
}
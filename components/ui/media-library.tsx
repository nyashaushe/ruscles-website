"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "./image-upload"
import { 
  Search, 
  Grid3X3, 
  List, 
  Upload, 
  Trash2, 
  Download, 
  Copy,
  Eye,
  Edit,
  Filter,
  Calendar,
  FileImage,
  Folder
} from "lucide-react"
import { formatFileSize, formatDateTime } from "@/lib/utils"

interface MediaFile {
  id: string
  name: string
  url: string
  thumbnailUrl?: string
  size: number
  type: string
  uploadedAt: Date
  uploadedBy: string
  alt?: string
  caption?: string
  folder?: string
  tags: string[]
}

interface MediaLibraryProps {
  files: MediaFile[]
  onUpload: (file: File) => Promise<string>
  onDelete?: (fileIds: string[]) => Promise<void>
  onSelect?: (files: MediaFile[]) => void
  onUpdate?: (fileId: string, updates: Partial<MediaFile>) => Promise<void>
  selectionMode?: boolean
  maxSelection?: number
  acceptedTypes?: string[]
  className?: string
}

export function MediaLibrary({
  files,
  onUpload,
  onDelete,
  onSelect,
  onUpdate,
  selectionMode = false,
  maxSelection = 1,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = ""
}: MediaLibraryProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterType, setFilterType] = useState<string>("all")
  const [selectedFolder, setSelectedFolder] = useState<string>("all")
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort files
  const filteredFiles = files
    .filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesType = filterType === "all" || file.type.startsWith(filterType)
      const matchesFolder = selectedFolder === "all" || file.folder === selectedFolder
      
      return matchesSearch && matchesType && matchesFolder
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "date":
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          break
        case "size":
          comparison = a.size - b.size
          break
      }
      
      return sortOrder === "asc" ? comparison : -comparison
    })

  const folders = [...new Set(files.map(f => f.folder).filter(Boolean))]
  const fileTypes = [...new Set(files.map(f => f.type.split('/')[0]))]

  const handleFileSelect = useCallback((fileId: string) => {
    if (!selectionMode) return

    setSelectedFiles(prev => {
      const isSelected = prev.includes(fileId)
      
      if (isSelected) {
        return prev.filter(id => id !== fileId)
      } else {
        if (prev.length >= maxSelection) {
          return maxSelection === 1 ? [fileId] : prev
        }
        return [...prev, fileId]
      }
    })
  }, [selectionMode, maxSelection])

  const handleSelectAll = useCallback(() => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(filteredFiles.slice(0, maxSelection).map(f => f.id))
    }
  }, [selectedFiles.length, filteredFiles, maxSelection])

  const handleConfirmSelection = useCallback(() => {
    if (onSelect) {
      const selected = files.filter(f => selectedFiles.includes(f.id))
      onSelect(selected)
    }
  }, [files, selectedFiles, onSelect])

  const handleDeleteSelected = useCallback(async () => {
    if (onDelete && selectedFiles.length > 0) {
      await onDelete(selectedFiles)
      setSelectedFiles([])
    }
  }, [onDelete, selectedFiles])

  const handleUpdateFile = useCallback(async (updates: Partial<MediaFile>) => {
    if (editingFile && onUpdate) {
      await onUpdate(editingFile.id, updates)
      setEditingFile(null)
    }
  }, [editingFile, onUpdate])

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
  }, [])

  const renderFileCard = (file: MediaFile) => (
    <Card 
      key={file.id} 
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedFiles.includes(file.id) ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => handleFileSelect(file.id)}
    >
      <CardContent className="p-3">
        <div className="aspect-square relative mb-3 bg-gray-100 rounded overflow-hidden">
          {file.type.startsWith('image/') ? (
            <img
              src={file.thumbnailUrl || file.url}
              alt={file.alt || file.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileImage className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {selectionMode && (
            <div className="absolute top-2 left-2">
              <Checkbox
                checked={selectedFiles.includes(file.id)}
                onChange={() => handleFileSelect(file.id)}
              />
            </div>
          )}
          
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-1">
              <Button size="sm" variant="secondary" className="h-6 w-6 p-0">
                <Eye className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingFile(file)
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium truncate" title={file.name}>
            {file.name}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatFileSize(file.size)}</span>
            <span>{formatDateTime(file.uploadedAt).split(' ')[0]}</span>
          </div>
          {file.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {file.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {file.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{file.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderFileRow = (file: MediaFile) => (
    <div 
      key={file.id}
      className={`flex items-center gap-4 p-3 border rounded hover:bg-gray-50 cursor-pointer ${
        selectedFiles.includes(file.id) ? 'bg-blue-50 border-blue-200' : ''
      }`}
      onClick={() => handleFileSelect(file.id)}
    >
      {selectionMode && (
        <Checkbox
          checked={selectedFiles.includes(file.id)}
          onChange={() => handleFileSelect(file.id)}
        />
      )}
      
      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
        {file.type.startsWith('image/') ? (
          <img
            src={file.thumbnailUrl || file.url}
            alt={file.alt || file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileImage className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{file.name}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{formatFileSize(file.size)}</span>
          <span>{formatDateTime(file.uploadedAt)}</span>
          <span>by {file.uploadedBy}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            copyToClipboard(file.url)
          }}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            setEditingFile(file)
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Media Library</h2>
          <Badge variant="secondary">
            {filteredFiles.length} files
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <div className="flex items-center border rounded">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {fileTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Folder</label>
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Folders</SelectItem>
                    {folders.map(folder => (
                      <SelectItem key={folder} value={folder!}>
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4" />
                          {folder}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(value: "name" | "date" | "size") => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="size">Size</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  >
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selection Actions */}
      {selectionMode && selectedFiles.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
          <span className="text-sm text-blue-700">
            {selectedFiles.length} file{selectedFiles.length === 1 ? '' : 's'} selected
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleConfirmSelection}>
              Use Selected
            </Button>
            {onDelete && (
              <Button size="sm" variant="destructive" onClick={handleDeleteSelected}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setSelectedFiles([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <Tabs defaultValue="library">
        <TabsList>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <ImageUpload
            onUpload={onUpload}
            acceptedTypes={acceptedTypes}
            multiple={true}
            showPreview={true}
          />
        </TabsContent>
        
        <TabsContent value="library">
          {/* Files Grid/List */}
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileImage className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No files found</p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFiles.map(renderFileCard)}
            </div>
          ) : (
            <div className="space-y-2">
              {selectionMode && (
                <div className="flex items-center gap-2 p-2 border-b">
                  <Checkbox
                    checked={selectedFiles.length === filteredFiles.length}
                    onChange={handleSelectAll}
                  />
                  <span className="text-sm text-gray-600">Select All</span>
                </div>
              )}
              {filteredFiles.map(renderFileRow)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit File Dialog */}
      <Dialog open={!!editingFile} onOpenChange={() => setEditingFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit File</DialogTitle>
            <DialogDescription>
              Update file information and metadata
            </DialogDescription>
          </DialogHeader>
          {editingFile && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Alt Text</label>
                <Input
                  value={editingFile.alt || ""}
                  onChange={(e) => setEditingFile({...editingFile, alt: e.target.value})}
                  placeholder="Describe the image"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Caption</label>
                <Input
                  value={editingFile.caption || ""}
                  onChange={(e) => setEditingFile({...editingFile, caption: e.target.value})}
                  placeholder="Image caption"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <Input
                  value={editingFile.tags.join(', ')}
                  onChange={(e) => setEditingFile({
                    ...editingFile, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFile(null)}>
              Cancel
            </Button>
            <Button onClick={() => handleUpdateFile(editingFile!)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RichTextEditor } from "./rich-text-editor"
import { MarkdownEditor } from "./markdown-editor"
import { ContentPreview } from "./content-preview"
import { ContentStatusBadge } from "./content-status-badge"
import { VersionHistory } from "./version-history"
import { ScheduleDialog } from "./schedule-dialog"
import { ApprovalWorkflow } from "./approval-workflow"
import { useContentWorkflow } from "@/hooks/use-content-workflow"
import { useAutoSave, useAutoSaveStatus } from "@/hooks/use-auto-save"
import { 
  Save, 
  Eye, 
  Calendar, 
  Tag, 
  Image as ImageIcon,
  Settings,
  FileText,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  History
} from "lucide-react"
import type { ContentItem } from "@/lib/types/content"

interface ContentEditorLayoutProps {
  content: Partial<ContentItem>
  onChange: (updates: Partial<ContentItem>) => void
  onSave: (content: Partial<ContentItem>) => Promise<void>
  onPublish?: (content: Partial<ContentItem>) => Promise<void>
  onSchedule?: (content: Partial<ContentItem>, date: Date) => Promise<void>
  isLoading?: boolean
  editorType?: "rich" | "markdown"
  onImageUpload?: (file: File) => Promise<string>
  userRole?: string
  hasApprovalWorkflow?: boolean
  enableAutoSave?: boolean
  autoSaveDelay?: number
}

export function ContentEditorLayout({
  content,
  onChange,
  onSave,
  onPublish,
  onSchedule,
  isLoading = false,
  editorType = "rich",
  onImageUpload,
  userRole = 'admin',
  hasApprovalWorkflow = false,
  enableAutoSave = true,
  autoSaveDelay = 30000
}: ContentEditorLayoutProps) {
  const [activeTab, setActiveTab] = useState("content")
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])

  // Content workflow hook
  const {
    workflowState,
    versions,
    draft,
    versionsLoading,
    isPublishing,
    isScheduling,
    publish,
    schedule,
    unpublish,
    archive,
    restore,
    requestApproval,
    validateForPublishing,
    createVersionWithDescription,
    saveDraft
  } = useContentWorkflow({
    contentId: content.id || '',
    content: content as ContentItem,
    userRole,
    hasApprovalWorkflow
  })

  // Auto-save functionality
  const { isSaving, lastSaved, forceSave } = useAutoSave({
    data: content,
    onSave: async (data) => {
      if (enableAutoSave && content.id) {
        await saveDraft(data)
      }
    },
    delay: autoSaveDelay,
    enabled: enableAutoSave && !!content.id,
  })

  const { statusText, statusColor } = useAutoSaveStatus(lastSaved, isSaving)

  // Validate content when it changes
  useEffect(() => {
    if (content.id) {
      const validation = validateForPublishing()
      setValidationErrors(validation.errors)
      setValidationWarnings(validation.warnings)
    }
  }, [content, validateForPublishing])

  const handleContentChange = (field: keyof ContentItem, value: any) => {
    onChange({ ...content, [field]: value })
  }

  const handleAddTag = () => {
    if (newTag.trim() && !content.tags?.includes(newTag.trim())) {
      const updatedTags = [...(content.tags || []), newTag.trim()]
      handleContentChange('tags', updatedTags)
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = content.tags?.filter(tag => tag !== tagToRemove) || []
    handleContentChange('tags', updatedTags)
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !content.categories?.includes(newCategory.trim())) {
      const updatedCategories = [...(content.categories || []), newCategory.trim()]
      handleContentChange('categories', updatedCategories)
      setNewCategory("")
    }
  }

  const handleRemoveCategory = (categoryToRemove: string) => {
    const updatedCategories = content.categories?.filter(cat => cat !== categoryToRemove) || []
    handleContentChange('categories', updatedCategories)
  }

  const handleStatusChange = async (newStatus: ContentItem['status']) => {
    if (!content.id) return

    try {
      switch (newStatus) {
        case 'published':
          await publish()
          break
        case 'archived':
          await archive()
          break
        case 'draft':
          if (content.status === 'archived') {
            await restore()
          } else {
            await unpublish()
          }
          break
      }
    } catch (error) {
      console.error('Failed to change status:', error)
    }
  }

  const handleScheduleContent = async (scheduledFor: Date) => {
    if (!content.id) return
    await schedule(scheduledFor)
    setScheduleDialogOpen(false)
  }

  const handlePublishNow = async () => {
    if (!content.id) return
    await publish()
  }

  const handleRequestApproval = async () => {
    if (!content.id) return
    await requestApproval()
  }

  const handleSaveAndCreateVersion = async () => {
    if (!content.id) return
    
    await onSave(content)
    
    // Create version if content has changed significantly
    if (versions.length > 0) {
      const lastVersion = versions[0]
      await createVersionWithDescription(
        { title: lastVersion.title, content: lastVersion.content },
        { title: content.title, content: content.content }
      )
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Main Content Editor */}
      <div className="lg:col-span-3 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={content.title || ""}
                onChange={(e) => handleContentChange('title', e.target.value)}
                placeholder="Enter content title..."
                className="text-lg font-medium"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={content.slug || ""}
                onChange={(e) => handleContentChange('slug', e.target.value)}
                placeholder="url-friendly-slug"
              />
              <div className="text-xs text-gray-500">
                URL: example.com/{content.slug || 'your-slug'}
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={content.excerpt || ""}
                onChange={(e) => handleContentChange('excerpt', e.target.value)}
                placeholder="Brief description or summary..."
                rows={3}
              />
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <Label>Content</Label>
              {editorType === "rich" ? (
                <RichTextEditor
                  content={content.content || ""}
                  onChange={(value) => handleContentChange('content', value)}
                  placeholder="Start writing your content..."
                  onImageUpload={onImageUpload}
                />
              ) : (
                <MarkdownEditor
                  content={content.content || ""}
                  onChange={(value) => handleContentChange('content', value)}
                  placeholder="Start writing your content in Markdown..."
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={content.status || 'draft'} 
                onValueChange={(value: ContentItem['status']) => handleContentChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Author */}
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={content.author || ""}
                onChange={(e) => handleContentChange('author', e.target.value)}
                placeholder="Author name"
              />
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add category"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button onClick={handleAddCategory} disabled={!newCategory.trim()}>
                  Add
                </Button>
              </div>
              {content.categories && content.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {content.categories.map((category, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer">
                      {category}
                      <button
                        onClick={() => handleRemoveCategory(category)}
                        className="ml-2 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button onClick={handleAddTag} disabled={!newTag.trim()}>
                  Add
                </Button>
              </div>
              {content.tags && content.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {content.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="cursor-pointer">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            {/* SEO Title */}
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                value={content.seoTitle || ""}
                onChange={(e) => handleContentChange('seoTitle', e.target.value)}
                placeholder="SEO optimized title"
              />
              <div className="text-xs text-gray-500">
                {(content.seoTitle || content.title || "").length}/60 characters
              </div>
            </div>

            {/* SEO Description */}
            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                value={content.seoDescription || ""}
                onChange={(e) => handleContentChange('seoDescription', e.target.value)}
                placeholder="SEO meta description"
                rows={3}
              />
              <div className="text-xs text-gray-500">
                {(content.seoDescription || "").length}/160 characters
              </div>
            </div>

            {/* SEO Preview */}
            <div className="space-y-2">
              <Label>Search Engine Preview</Label>
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="text-blue-600 text-lg font-medium truncate">
                  {content.seoTitle || content.title || "Your Title Here"}
                </div>
                <div className="text-green-600 text-sm truncate">
                  example.com/{content.slug || 'your-slug'}
                </div>
                <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {content.seoDescription || content.excerpt || "Your meta description will appear here"}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            {/* Featured Image */}
            <div className="space-y-2">
              <Label htmlFor="featuredImage">Featured Image URL</Label>
              <Input
                id="featuredImage"
                value={content.featuredImage || ""}
                onChange={(e) => handleContentChange('featuredImage', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {content.featuredImage && (
                <div className="mt-2">
                  <img 
                    src={content.featuredImage} 
                    alt="Featured image preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* Image Upload */}
            {onImageUpload && (
              <div className="space-y-2">
                <Label>Upload Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      try {
                        const url = await onImageUpload(file)
                        handleContentChange('featuredImage', url)
                      } catch (error) {
                        console.error('Failed to upload image:', error)
                      }
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Status & Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Status & Actions
              {content.status && (
                <ContentStatusBadge
                  status={content.status}
                  scheduledFor={content.scheduledFor}
                  publishedAt={content.publishedAt}
                  showDropdown={!!content.id}
                  onStatusChange={handleStatusChange}
                  onSchedule={() => setScheduleDialogOpen(true)}
                  onPublish={handlePublishNow}
                  onUnpublish={() => handleStatusChange('draft')}
                  onArchive={() => handleStatusChange('archived')}
                  disabled={isPublishing || isScheduling}
                />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={handleSaveAndCreateVersion} 
              disabled={isLoading || isSaving}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading || isSaving ? 'Saving...' : 'Save Changes'}
            </Button>

            {/* Auto-save status */}
            {enableAutoSave && (
              <div className={`text-xs ${statusColor} flex items-center gap-1`}>
                <Clock className="h-3 w-3" />
                {statusText}
              </div>
            )}
            
            {workflowState?.canPublish && (
              <Button 
                onClick={handlePublishNow}
                disabled={isPublishing || validationErrors.length > 0}
                variant="outline"
                className="w-full"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isPublishing ? 'Publishing...' : 'Publish Now'}
              </Button>
            )}

            {workflowState?.canSchedule && (
              <Button 
                onClick={() => setScheduleDialogOpen(true)}
                disabled={isScheduling || validationErrors.length > 0}
                variant="outline"
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule for Later
              </Button>
            )}

            {workflowState?.requiresApproval && content.status === 'draft' && (
              <Button 
                onClick={handleRequestApproval}
                disabled={validationErrors.length > 0}
                variant="outline"
                className="w-full"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Request Approval
              </Button>
            )}

            {content as ContentItem && (
              <ContentPreview content={content as ContentItem}>
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </ContentPreview>
            )}

            {/* Version History */}
            {content.id && versions.length > 0 && (
              <VersionHistory
                versions={versions}
                onRestore={async (versionId) => {
                  // Handle version restore
                  console.log('Restore version:', versionId)
                }}
                onPreview={(version) => {
                  console.log('Preview version:', version)
                }}
                loading={versionsLoading}
              />
            )}
          </CardContent>
        </Card>

        {/* Validation Messages */}
        {(validationErrors.length > 0 || validationWarnings.length > 0) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Content Validation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {validationErrors.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-red-600">Errors:</div>
                  {validationErrors.map((error, index) => (
                    <div key={index} className="text-xs text-red-600 flex items-start gap-1">
                      <span className="text-red-500">•</span>
                      {error}
                    </div>
                  ))}
                </div>
              )}
              
              {validationWarnings.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-yellow-600">Warnings:</div>
                  {validationWarnings.map((warning, index) => (
                    <div key={index} className="text-xs text-yellow-600 flex items-start gap-1">
                      <span className="text-yellow-500">•</span>
                      {warning}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Content Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Content Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Word Count:</span>
              <span>{content.content ? content.content.split(/\s+/).length : 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Character Count:</span>
              <span>{content.content?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reading Time:</span>
              <span>{Math.ceil((content.content?.split(/\s+/).length || 0) / 200)} min</span>
            </div>
            {content.createdAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span>{new Date(content.createdAt).toLocaleDateString()}</span>
              </div>
            )}
            {content.updatedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Updated:</span>
                <span>{new Date(content.updatedAt).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schedule Dialog */}
      <ScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        onSchedule={handleScheduleContent}
        currentScheduledDate={content.scheduledFor}
        title="Schedule Content"
        description="Choose when you want this content to be published."
      />

      {/* Approval Workflow Dialog */}
      {workflowState?.approvalRequest && (
        <ApprovalWorkflow
          request={workflowState.approvalRequest}
          open={approvalDialogOpen}
          onOpenChange={setApprovalDialogOpen}
          onApprove={async (comment) => {
            // Handle approval
            console.log('Approve with comment:', comment)
          }}
          onReject={async (comment) => {
            // Handle rejection
            console.log('Reject with comment:', comment)
          }}
          onRequestChanges={async (comment) => {
            // Handle request changes
            console.log('Request changes with comment:', comment)
          }}
          currentUser={userRole}
        />
      )}
    </div>
  )
}
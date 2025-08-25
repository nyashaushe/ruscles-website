"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { ImageUpload } from "@/components/ui/image-upload"
import { ContentPreview } from "@/components/ui/content-preview"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { StatusBadge } from "@/components/ui/status-badge"
import {
  ArrowLeft,
  Save,
  Eye,
  Calendar as CalendarIcon,
  Globe,
  FileText,
  Image as ImageIcon,
  Tag,
  X,
  Clock,
  Archive,
  RotateCcw,
} from "lucide-react"
import { useBlog } from "@/hooks/use-blog"
import { formatDate } from "@/lib/utils/date"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface EditBlogPostPageProps {
  params: {
    id: string
  }
}

export default function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const router = useRouter()
  const { getBlogPost, updateBlogPost, loading } = useBlog()

  const [post, setPost] = useState<any>(null)
  const [postLoading, setPostLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED",
    tags: [] as string[],
    categories: [] as string[],
    featuredImage: "",
    seoTitle: "",
    seoDescription: "",
    readingTime: 0,
  })

  const [newTag, setNewTag] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [scheduleDate, setScheduleDate] = useState<Date>()
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load post data
  useEffect(() => {
    const loadPost = async () => {
      try {
        const postData = await getBlogPost(params.id)
        setPost(postData)
        setFormData({
          title: postData.title,
          content: postData.content,
          excerpt: postData.excerpt || "",
          status: postData.status,
          tags: postData.tags || [],
          categories: postData.categories || [],
          featuredImage: postData.featuredImage || "",
          seoTitle: postData.seoTitle || "",
          seoDescription: postData.seoDescription || "",
          readingTime: postData.blogPost?.readingTime || 0,
        })
      } catch (error) {
        console.error('Failed to load post:', error)
      } finally {
        setPostLoading(false)
      }
    }

    loadPost()
  }, [params.id, getBlogPost])

  // Auto-save functionality
  useEffect(() => {
    if (!post) return

    const autoSaveTimer = setTimeout(async () => {
      if (formData.title && formData.content) {
        setAutoSaving(true)
        try {
          await updateBlogPost(params.id, {
            ...formData,
            status: 'DRAFT', // Auto-save as draft
          })
          setLastSaved(new Date())
        } catch (error) {
          console.error('Auto-save failed:', error)
        } finally {
          setAutoSaving(false)
        }
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer)
  }, [formData, params.id, updateBlogPost, post])

  const handleSave = async (status?: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED") => {
    setSaving(true)
    try {
      const updateData = {
        ...formData,
        status: status || formData.status,
        scheduledFor: status === "SCHEDULED" && scheduleDate ? scheduleDate.toISOString() : undefined,
      }

      await updateBlogPost(params.id, updateData)
      setLastSaved(new Date())

      if (status === "PUBLISHED") {
        router.push("/admin/content/blog")
      }
    } catch (error) {
      console.error('Failed to save post:', error)
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = () => {
    handleSave("PUBLISHED")
  }

  const handleUnpublish = async () => {
    setSaving(true)
    try {
      await updateBlogPost(params.id, { ...formData, status: "DRAFT" })
      setFormData(prev => ({ ...prev, status: "DRAFT" }))
      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to unpublish post:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSchedule = () => {
    if (scheduleDate) {
      handleSave("SCHEDULED")
      setShowScheduleDialog(false)
    }
  }

  const handleSaveDraft = () => {
    handleSave("DRAFT")
  }

  const handleArchive = async () => {
    setSaving(true)
    try {
      await updateBlogPost(params.id, { ...formData, status: "ARCHIVED" })
      setFormData(prev => ({ ...prev, status: "ARCHIVED" }))
      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to archive post:', error)
    } finally {
      setSaving(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addCategory = () => {
    if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()]
      }))
      setNewCategory("")
    }
  }

  const removeCategory = (categoryToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(category => category !== categoryToRemove)
    }))
  }

  if (postLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Post Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">The blog post you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/admin/content/blog">
                Back to Blog Posts
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/content/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog Posts
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Blog Post</h1>
            <p className="text-gray-600 mt-1">Update your blog post content and settings</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {autoSaving && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <LoadingSpinner size="sm" />
              Auto-saving...
            </div>
          )}
          {lastSaved && (
            <div className="text-sm text-gray-500">
              Last saved: {formatDate(lastSaved)}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle>Post Title</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Enter your blog post title..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="text-lg"
              />
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                placeholder="Write your blog post content..."
              />
            </CardContent>
          </Card>

          {/* Excerpt */}
          <Card>
            <CardHeader>
              <CardTitle>Excerpt</CardTitle>
              <CardDescription>Brief summary of your post (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter a brief excerpt..."
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={formData.featuredImage}
                onChange={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))}
                placeholder="Upload featured image..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status and Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Status</Label>
                <div className="mt-2">
                  <StatusBadge status={formData.status} />
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handlePublish}
                  disabled={saving || !formData.title || !formData.content}
                  className="w-full"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Publish
                </Button>

                <Button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  variant="outline"
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>

                <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Clock className="mr-2 h-4 w-4" />
                      Schedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule Post</DialogTitle>
                      <DialogDescription>
                        Choose when to publish this post
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Calendar
                        mode="single"
                        selected={scheduleDate}
                        onSelect={setScheduleDate}
                        disabled={(date) => date < new Date()}
                        className="rounded-md border"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSchedule} disabled={!scheduleDate}>
                        Schedule
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {formData.status === "PUBLISHED" && (
                  <Button
                    onClick={handleUnpublish}
                    disabled={saving}
                    variant="outline"
                    className="w-full"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Unpublish
                  </Button>
                )}

                <Button
                  onClick={handleArchive}
                  disabled={saving}
                  variant="outline"
                  className="w-full text-red-600"
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  placeholder="SEO optimized title..."
                  value={formData.seoTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  placeholder="SEO description..."
                  value={formData.seoDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add category..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                />
                <Button onClick={addCategory} size="sm">
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="gap-1">
                    {category}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCategory(category)}
                      className="h-4 w-4 p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} size="sm">
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTag(tag)}
                      className="h-4 w-4 p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reading Time */}
          <Card>
            <CardHeader>
              <CardTitle>Reading Time</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                placeholder="Estimated reading time in minutes..."
                value={formData.readingTime}
                onChange={(e) => setFormData(prev => ({ ...prev, readingTime: parseInt(e.target.value) || 0 }))}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          <ContentPreview
            title={formData.title}
            content={formData.content}
            excerpt={formData.excerpt}
            featuredImage={formData.featuredImage}
            author={post.user?.name || 'Unknown'}
            publishedAt={post.publishedAt}
            readingTime={formData.readingTime}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
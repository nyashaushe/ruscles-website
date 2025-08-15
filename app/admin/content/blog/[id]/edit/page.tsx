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
import { useBlogPost, useBlogCategories, useBlogTags } from "@/hooks/use-blog"
import { BlogPostCreateData } from "@/lib/api/blog"
import { blogApi } from "@/lib/api/blog"
import { formatDate } from "@/lib/utils/date"
import { cn } from "@/lib/utils"

interface EditBlogPostPageProps {
  params: {
    id: string
  }
}

export default function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const router = useRouter()
  const { post, loading: postLoading, update, publish, unpublish, schedule, saveDraft } = useBlogPost(params.id)
  const { categories } = useBlogCategories()
  const { tags: availableTags } = useBlogTags()

  const [formData, setFormData] = useState<BlogPostCreateData>({
    title: "",
    content: "",
    excerpt: "",
    status: "draft",
    tags: [],
    categories: [],
    featuredImage: "",
    seoTitle: "",
    seoDescription: "",
  })

  const [newTag, setNewTag] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [scheduleDate, setScheduleDate] = useState<Date>()
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  // Load post data into form
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || "",
        status: post.status,
        tags: post.tags,
        categories: post.categories,
        featuredImage: post.featuredImage || "",
        seoTitle: post.seoTitle || "",
        seoDescription: post.seoDescription || "",
      })
      if (post.scheduledFor) {
        setScheduleDate(new Date(post.scheduledFor))
      }
    }
  }, [post])

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (post && formData.title.trim() && formData.content.trim()) {
        await handleAutoSave()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [post, formData])

  const handleAutoSave = async () => {
    if (post && formData.title.trim() && formData.content.trim()) {
      setAutoSaving(true)
      try {
        await saveDraft(post.id, formData)
        setLastSaved(new Date())
      } catch (error) {
        console.error("Auto-save failed:", error)
      } finally {
        setAutoSaving(false)
      }
    }
  }

  const handleInputChange = (field: keyof BlogPostCreateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()]
      }))
      setNewCategory("")
    }
  }

  const handleRemoveCategory = (categoryToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(category => category !== categoryToRemove)
    }))
  }

  const handleImageUpload = async (file: File) => {
    try {
      const response = await blogApi.uploadImage(file)
      if (response.success) {
        handleInputChange("featuredImage", response.data.url)
      }
    } catch (error) {
      console.error("Image upload failed:", error)
    }
  }

  const handleUpdate = async () => {
    if (!post) return
    setLoading(true)
    const result = await update(post.id, formData)
    setLoading(false)
    if (result) {
      router.push("/admin/content/blog")
    }
  }

  const handlePublish = async () => {
    if (!post) return
    setLoading(true)
    await update(post.id, formData)
    const result = await publish(post.id)
    setLoading(false)
    if (result) {
      router.push("/admin/content/blog")
    }
  }

  const handleUnpublish = async () => {
    if (!post) return
    setLoading(true)
    const result = await unpublish(post.id)
    setLoading(false)
    if (result) {
      router.push("/admin/content/blog")
    }
  }

  const handleSchedule = async () => {
    if (!post || !scheduleDate) return
    setLoading(true)
    await update(post.id, formData)
    const result = await schedule(post.id, scheduleDate)
    setLoading(false)
    setShowScheduleDialog(false)
    if (result) {
      router.push("/admin/content/blog")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "success"
      case "draft":
        return "warning"
      case "scheduled":
        return "info"
      case "archived":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const isFormValid = formData.title.trim() && formData.content.trim()

  if (postLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/content/blog")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog Posts
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">Blog post not found</h2>
              <p className="text-gray-600 mt-1">The blog post you're looking for doesn't exist.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showPreview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setShowPreview(false)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Editor
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleUpdate}
              disabled={loading || !isFormValid}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            {post.status !== "published" && (
              <Button
                onClick={handlePublish}
                disabled={loading || !isFormValid}
              >
                <Globe className="h-4 w-4 mr-2" />
                Publish
              </Button>
            )}
          </div>
        </div>
        <ContentPreview
          title={formData.title}
          content={formData.content}
          excerpt={formData.excerpt}
          featuredImage={formData.featuredImage}
          tags={formData.tags}
          categories={formData.categories}
          author={post.author}
          publishedAt={post.publishedAt ? new Date(post.publishedAt) : new Date()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/content/blog")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog Posts
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Edit Blog Post</h1>
              <StatusBadge status={post.status} variant={getStatusColor(post.status)} />
            </div>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-gray-500">
                Created: {formatDate(new Date(post.createdAt))}
              </p>
              <p className="text-sm text-gray-500">
                Updated: {formatDate(new Date(post.updatedAt))}
              </p>
              {post.publishedAt && (
                <p className="text-sm text-gray-500">
                  Published: {formatDate(new Date(post.publishedAt))}
                </p>
              )}
              {lastSaved && (
                <p className="text-sm text-gray-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                  {autoSaving && <LoadingSpinner size="sm" className="ml-2" />}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            disabled={!isFormValid}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            onClick={handleUpdate}
            disabled={loading || !isFormValid}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          
          {post.status === "published" ? (
            <Button
              variant="outline"
              onClick={handleUnpublish}
              disabled={loading}
            >
              <Archive className="h-4 w-4 mr-2" />
              Unpublish
            </Button>
          ) : (
            <>
              <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={loading || !isFormValid}>
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Publication</DialogTitle>
                    <DialogDescription>
                      Choose when you want this blog post to be published.
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
                    <Button
                      variant="outline"
                      onClick={() => setShowScheduleDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSchedule}
                      disabled={!scheduleDate || loading}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button
                onClick={handlePublish}
                disabled={loading || !isFormValid}
              >
                <Globe className="h-4 w-4 mr-2" />
                Publish Now
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter blog post title..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange("excerpt", e.target.value)}
                  placeholder="Brief description of the blog post..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Content *</Label>
                <div className="mt-1">
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => handleInputChange("content", content)}
                    placeholder="Write your blog post content..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize your blog post for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => handleInputChange("seoTitle", e.target.value)}
                  placeholder="SEO optimized title (leave empty to use post title)"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.seoTitle.length}/60 characters
                </p>
              </div>

              <div>
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => handleInputChange("seoDescription", e.target.value)}
                  placeholder="SEO meta description..."
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.seoDescription.length}/160 characters
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post Info */}
          <Card>
            <CardHeader>
              <CardTitle>Post Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <StatusBadge status={post.status} variant={getStatusColor(post.status)} />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Author:</span>
                <span className="text-sm font-medium">{post.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Views:</span>
                <span className="text-sm font-medium">{post.viewCount?.toLocaleString() || 0}</span>
              </div>
              {post.scheduledFor && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Scheduled:</span>
                  <span className="text-sm font-medium">
                    {formatDate(new Date(post.scheduledFor))}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Featured Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                onUpload={handleImageUpload}
                currentImage={formData.featuredImage}
                onRemove={() => handleInputChange("featuredImage", "")}
              />
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value="" onValueChange={handleAddCategory}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => !formData.categories.includes(cat)).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category"
                  onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCategory}
                  disabled={!newCategory.trim()}
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="flex items-center gap-1">
                    {category}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveCategory(category)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value="" onValueChange={(value) => {
                  if (!formData.tags.includes(value)) {
                    setFormData(prev => ({
                      ...prev,
                      tags: [...prev.tags, value]
                    }))
                  }
                }}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags.filter(tag => !formData.tags.includes(tag)).map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="New tag"
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
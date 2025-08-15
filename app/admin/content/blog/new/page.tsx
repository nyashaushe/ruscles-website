"use client"

import { useState } from "react"
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
import { Separator } from "@/components/ui/separator"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { ImageUpload } from "@/components/ui/image-upload"
import { ContentPreview } from "@/components/ui/content-preview"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  ArrowLeft,
  Save,
  Eye,
  Calendar,
  Globe,
  FileText,
  Image as ImageIcon,
  Tag,
  X,
} from "lucide-react"
import { useBlogPost, useBlogCategories, useBlogTags } from "@/hooks/use-blog"
import { BlogPostCreateData } from "@/lib/api/blog"
import { blogApi } from "@/lib/api/blog"

export default function NewBlogPostPage() {
  const router = useRouter()
  const { create, loading } = useBlogPost()
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

  // Auto-save draft every 30 seconds
  useState(() => {
    const interval = setInterval(async () => {
      if (formData.title.trim() && formData.content.trim()) {
        await handleAutoSave()
      }
    }, 30000)

    return () => clearInterval(interval)
  })

  const handleAutoSave = async () => {
    if (formData.title.trim() && formData.content.trim()) {
      setAutoSaving(true)
      try {
        // For new posts, we'll create a draft first
        const draftData = { ...formData, status: "draft" as const }
        await create(draftData)
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

  const generateSlug = async () => {
    if (formData.title.trim()) {
      try {
        const response = await blogApi.generateSlug(formData.title)
        if (response.success) {
          // Slug will be generated on the backend when creating the post
          console.log("Generated slug:", response.data.slug)
        }
      } catch (error) {
        console.error("Slug generation failed:", error)
      }
    }
  }

  const handleSave = async (status: "draft" | "published" | "scheduled", scheduledFor?: Date) => {
    const dataToSave = {
      ...formData,
      status,
      scheduledFor
    }

    const result = await create(dataToSave)
    if (result) {
      router.push("/admin/content/blog")
    }
  }

  const handleSchedule = () => {
    // This would open a date picker modal
    const scheduledDate = new Date()
    scheduledDate.setDate(scheduledDate.getDate() + 1) // Tomorrow
    handleSave("scheduled", scheduledDate)
  }

  const isFormValid = formData.title.trim() && formData.content.trim()

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
              onClick={() => handleSave("draft")}
              disabled={loading || !isFormValid}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={() => handleSave("published")}
              disabled={loading || !isFormValid}
            >
              <Globe className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
        <ContentPreview
          title={formData.title}
          content={formData.content}
          excerpt={formData.excerpt}
          featuredImage={formData.featuredImage}
          tags={formData.tags}
          categories={formData.categories}
          author="Admin"
          publishedAt={new Date()}
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
            <h1 className="text-2xl font-bold text-gray-900">Create New Blog Post</h1>
            {lastSaved && (
              <p className="text-sm text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}
                {autoSaving && <LoadingSpinner size="sm" className="ml-2" />}
              </p>
            )}
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
            onClick={() => handleSave("draft")}
            disabled={loading || !isFormValid}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            variant="outline"
            onClick={handleSchedule}
            disabled={loading || !isFormValid}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button
            onClick={() => handleSave("published")}
            disabled={loading || !isFormValid}
          >
            <Globe className="h-4 w-4 mr-2" />
            Publish
          </Button>
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
                  onBlur={generateSlug}
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
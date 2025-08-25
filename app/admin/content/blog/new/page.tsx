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
import { useBlog } from "@/hooks/use-blog"
import Link from "next/link"

export default function NewBlogPostPage() {
  const router = useRouter()
  const { createBlogPost, loading } = useBlog()

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

  const handleInputChange = (field: string, value: any) => {
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

  const handleSave = async (status?: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED") => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Please fill in the title and content")
      return
    }

    try {
      const postData = {
        ...formData,
        status: status || formData.status,
      }

      const newPost = await createBlogPost(postData)
      setLastSaved(new Date())

      if (status === "PUBLISHED") {
        router.push("/admin/content/blog")
      } else {
        router.push(`/admin/content/blog/${newPost.id}/edit`)
      }
    } catch (error) {
      console.error("Failed to save post:", error)
    }
  }

  const handlePublish = () => {
    handleSave("PUBLISHED")
  }

  const handleSaveDraft = () => {
    handleSave("DRAFT")
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">New Blog Post</h1>
            <p className="text-gray-600 mt-1">Create a new blog post</p>
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
              Last saved: {lastSaved.toLocaleTimeString()}
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
                onChange={(e) => handleInputChange("title", e.target.value)}
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
                onChange={(value) => handleInputChange("content", value)}
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
                onChange={(e) => handleInputChange("excerpt", e.target.value)}
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
                onChange={(url) => handleInputChange("featuredImage", url)}
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
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => handleInputChange("status", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handlePublish}
                  disabled={loading || !formData.title || !formData.content}
                  className="w-full"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Publish
                </Button>

                <Button
                  onClick={handleSaveDraft}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>

                <Button
                  onClick={() => setShowPreview(true)}
                  disabled={!formData.title || !formData.content}
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
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
                  onChange={(e) => handleInputChange("seoTitle", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  placeholder="SEO description..."
                  value={formData.seoDescription}
                  onChange={(e) => handleInputChange("seoDescription", e.target.value)}
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
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button onClick={handleAddCategory} size="sm">
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
                      onClick={() => handleRemoveCategory(category)}
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
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button onClick={handleAddTag} size="sm">
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
                      onClick={() => handleRemoveTag(tag)}
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
                onChange={(e) => handleInputChange("readingTime", parseInt(e.target.value) || 0)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <ContentPreview
        title={formData.title}
        content={formData.content}
        excerpt={formData.excerpt}
        featuredImage={formData.featuredImage}
        author="You"
        publishedAt={undefined}
        readingTime={formData.readingTime}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  )
}
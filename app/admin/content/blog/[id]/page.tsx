"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { StatusBadge } from "@/components/ui/status-badge"
import { ContentPreview } from "@/components/ui/content-preview"
import {
  ArrowLeft,
  Edit,
  Globe,
  Calendar,
  User,
  Eye,
  Tag,
  Archive,
  Clock,
  Share2,
} from "lucide-react"
import { useBlogPost } from "@/hooks/use-blog"
import { formatDate } from "@/lib/utils/date"

interface BlogPostPreviewPageProps {
  params: {
    id: string
  }
}

export default function BlogPostPreviewPage({ params }: BlogPostPreviewPageProps) {
  const router = useRouter()
  const { post, loading, publish, unpublish, schedule } = useBlogPost(params.id)

  const handlePublish = async () => {
    if (!post) return
    const result = await publish(post.id)
    if (result) {
      // Refresh the page to show updated status
      window.location.reload()
    }
  }

  const handleUnpublish = async () => {
    if (!post) return
    const result = await unpublish(post.id)
    if (result) {
      // Refresh the page to show updated status
      window.location.reload()
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

  if (loading) {
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
              <h1 className="text-2xl font-bold text-gray-900">Blog Post Preview</h1>
              <StatusBadge status={post.status} variant={getStatusColor(post.status)} />
            </div>
            <p className="text-gray-600 mt-1">Preview how this blog post will appear on your website</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/content/blog/${post.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          {post.status === "published" ? (
            <Button
              variant="outline"
              onClick={handleUnpublish}
            >
              <Archive className="h-4 w-4 mr-2" />
              Unpublish
            </Button>
          ) : (
            <Button onClick={handlePublish}>
              <Globe className="h-4 w-4 mr-2" />
              Publish
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Preview */}
        <div className="lg:col-span-3">
          <ContentPreview
            title={post.title}
            content={post.content}
            excerpt={post.excerpt}
            featuredImage={post.featuredImage}
            tags={post.tags}
            categories={post.categories}
            author={post.author}
            publishedAt={post.publishedAt ? new Date(post.publishedAt) : new Date()}
          />
        </div>

        {/* Sidebar with Post Details */}
        <div className="space-y-6">
          {/* Post Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Post Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Views</span>
                </div>
                <span className="font-semibold">{post.viewCount?.toLocaleString() || 0}</span>
              </div>
              
              {post.readingTime && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Reading Time</span>
                  </div>
                  <span className="font-semibold">{post.readingTime} min</span>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <StatusBadge status={post.status} variant={getStatusColor(post.status)} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Author</span>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-medium">{post.author}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium">
                    {formatDate(new Date(post.createdAt))}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Updated</span>
                  <span className="text-sm font-medium">
                    {formatDate(new Date(post.updatedAt))}
                  </span>
                </div>

                {post.publishedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Published</span>
                    <span className="text-sm font-medium">
                      {formatDate(new Date(post.publishedAt))}
                    </span>
                  </div>
                )}

                {post.scheduledFor && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Scheduled</span>
                    <span className="text-sm font-medium">
                      {formatDate(new Date(post.scheduledFor))}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Categories and Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories & Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
                {post.categories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {post.categories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No categories assigned</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                {post.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No tags assigned</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Information */}
          {(post.seoTitle || post.seoDescription) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SEO Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {post.seoTitle && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">SEO Title</h4>
                    <p className="text-sm text-gray-600">{post.seoTitle}</p>
                  </div>
                )}
                
                {post.seoDescription && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">SEO Description</h4>
                    <p className="text-sm text-gray-600">{post.seoDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/admin/content/blog/${post.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Post
              </Button>
              
              {post.status === "published" && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // This would open the public blog post in a new tab
                    window.open(`/blog/${post.slug}`, '_blank')
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  View Public Post
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
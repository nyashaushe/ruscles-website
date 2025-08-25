"use client"

import { useState, useEffect } from "react"
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
import { useBlog } from "@/hooks/use-blog"
import { formatDate } from "@/lib/utils/date"
import Link from "next/link"
import { Label } from "@/components/ui/label"

interface BlogPostPreviewPageProps {
  params: {
    id: string
  }
}

export default function BlogPostPreviewPage({ params }: BlogPostPreviewPageProps) {
  const router = useRouter()
  const { getBlogPost, updateBlogPost } = useBlog()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPost = async () => {
      try {
        const postData = await getBlogPost(params.id)
        setPost(postData)
      } catch (error) {
        console.error('Failed to load post:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPost()
  }, [params.id, getBlogPost])

  const handlePublish = async () => {
    if (!post) return
    try {
      await updateBlogPost(post.id, { ...post, status: 'PUBLISHED' })
      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      console.error('Failed to publish post:', error)
    }
  }

  const handleUnpublish = async () => {
    if (!post) return
    try {
      await updateBlogPost(post.id, { ...post, status: 'DRAFT' })
      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      console.error('Failed to unpublish post:', error)
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
          <Button asChild variant="ghost">
            <Link href="/admin/content/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog Posts
            </Link>
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
          <Button asChild variant="ghost">
            <Link href="/admin/content/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog Posts
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Blog Post Preview</h1>
            <p className="text-gray-600 mt-1">Preview and manage your blog post</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/content/blog/${post.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Post
            </Link>
          </Button>

          {post.status === "DRAFT" && (
            <Button onClick={handlePublish}>
              <Globe className="h-4 w-4 mr-2" />
              Publish
            </Button>
          )}

          {post.status === "PUBLISHED" && (
            <Button onClick={handleUnpublish} variant="outline">
              <Archive className="h-4 w-4 mr-2" />
              Unpublish
            </Button>
          )}
        </div>
      </div>

      {/* Post Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {post.excerpt}
                  </CardDescription>
                </div>
                <StatusBadge status={post.status} />
              </div>
            </CardHeader>
            <CardContent>
              <ContentPreview
                title={post.title}
                content={post.content}
                excerpt={post.excerpt}
                featuredImage={post.featuredImage}
                author={post.user?.name || 'Unknown'}
                publishedAt={post.publishedAt}
                readingTime={post.blogPost?.readingTime}
              />
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
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Author: {post.user?.name || 'Unknown'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Created: {formatDate(post.createdAt)}
                </span>
              </div>

              {post.publishedAt && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Published: {formatDate(post.publishedAt)}
                  </span>
                </div>
              )}

              {post.scheduledFor && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Scheduled: {formatDate(post.scheduledFor)}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Views: {post.blogPost?.viewCount || 0}
                </span>
              </div>

              {post.blogPost?.readingTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Reading time: {post.blogPost.readingTime} min
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {post.categories.map((category: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO Info */}
          {(post.seoTitle || post.seoDescription) && (
            <Card>
              <CardHeader>
                <CardTitle>SEO Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {post.seoTitle && (
                  <div>
                    <Label className="text-sm font-medium">SEO Title</Label>
                    <p className="text-sm text-gray-600 mt-1">{post.seoTitle}</p>
                  </div>
                )}

                {post.seoDescription && (
                  <div>
                    <Label className="text-sm font-medium">SEO Description</Label>
                    <p className="text-sm text-gray-600 mt-1">{post.seoDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
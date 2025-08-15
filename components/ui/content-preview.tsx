"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Eye, 
  Monitor, 
  Smartphone, 
  Tablet,
  ExternalLink,
  Calendar,
  User,
  Tag
} from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import type { ContentItem } from "@/lib/types"

interface ContentPreviewProps {
  content: ContentItem
  children?: React.ReactNode
}

export function ContentPreview({ content, children }: ContentPreviewProps) {
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")

  const getDeviceWidth = () => {
    switch (previewDevice) {
      case "mobile": return "375px"
      case "tablet": return "768px"
      default: return "100%"
    }
  }

  const renderContent = () => {
    // Simple HTML rendering for preview
    return (
      <div className="prose prose-sm max-w-none">
        <h1>{content.title}</h1>
        {content.excerpt && (
          <p className="text-lg text-gray-600 italic">{content.excerpt}</p>
        )}
        <div dangerouslySetInnerHTML={{ __html: content.content }} />
      </div>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Content Preview</DialogTitle>
              <DialogDescription>
                Preview how your content will appear to visitors
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={previewDevice === "desktop" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewDevice("desktop")}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={previewDevice === "tablet" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewDevice("tablet")}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={previewDevice === "mobile" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewDevice("mobile")}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex gap-6 h-full">
          {/* Content Preview */}
          <div className="flex-1 overflow-hidden">
            <div 
              className="mx-auto bg-white border rounded-lg shadow-sm overflow-auto"
              style={{ 
                width: getDeviceWidth(),
                height: "600px",
                transition: "width 0.3s ease"
              }}
            >
              <div className="p-6">
                {renderContent()}
              </div>
            </div>
          </div>

          {/* Content Metadata */}
          <div className="w-80 space-y-4 overflow-y-auto">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Content Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <Badge 
                    variant={content.status === 'published' ? 'default' : 'secondary'}
                  >
                    {content.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <Badge variant="outline">
                    {content.type.replace('_', ' ')}
                  </Badge>
                </div>

                {content.author && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Author:</span>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{content.author}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDateTime(content.createdAt)}</span>
                  </div>
                </div>

                {content.publishedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Published:</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDateTime(content.publishedAt)}</span>
                    </div>
                  </div>
                )}

                {content.scheduledFor && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Scheduled:</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDateTime(content.scheduledFor)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SEO Information */}
            {(content.seoTitle || content.seoDescription) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">SEO Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border rounded-lg bg-gray-50">
                    <div className="text-blue-600 text-sm font-medium truncate">
                      {content.seoTitle || content.title}
                    </div>
                    <div className="text-green-600 text-xs truncate">
                      example.com/{content.slug}
                    </div>
                    <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {content.seoDescription || content.excerpt || 'No description available'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags and Categories */}
            {(content.tags?.length > 0 || content.categories?.length > 0) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags & Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {content.categories && content.categories.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Categories:</div>
                      <div className="flex flex-wrap gap-1">
                        {content.categories.map((category, index) => (
                          <Badge key={index} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {content.tags && content.tags.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Tags:</div>
                      <div className="flex flex-wrap gap-1">
                        {content.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Featured Image */}
            {content.featuredImage && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Featured Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={content.featuredImage} 
                    alt={content.title}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {content.status === 'published' && (
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Live
                  </Button>
                )}
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Share Preview
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
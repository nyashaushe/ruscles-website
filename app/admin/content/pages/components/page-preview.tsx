"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  ExternalLink
} from "lucide-react"
import type { PageContent } from "@/lib/types/content"

interface PagePreviewProps {
  page: PageContent
  children?: React.ReactNode
}

export function PagePreview({ page, children }: PagePreviewProps) {
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")

  const getDeviceWidth = () => {
    switch (previewDevice) {
      case "mobile": return "375px"
      case "tablet": return "768px"
      default: return "100%"
    }
  }

  const renderPageContent = () => {
    return (
      <div className="prose prose-sm max-w-none">
        <h1>{page.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
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
              <DialogTitle>Page Preview: {page.title}</DialogTitle>
              <DialogDescription>
                Preview how your page will appear to visitors
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
          {/* Page Preview */}
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
                {renderPageContent()}
              </div>
            </div>
          </div>

          {/* Page Metadata */}
          <div className="w-80 space-y-4 overflow-y-auto">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Page Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">URL:</span>
                  <span className="font-mono">/{page.slug}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Updated:</span>
                  <span>{new Date(page.lastUpdated).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Updated By:</span>
                  <span>{page.updatedBy}</span>
                </div>
              </CardContent>
            </Card>

            {/* SEO Information */}
            {(page.metaTitle || page.metaDescription) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">SEO Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border rounded-lg bg-gray-50">
                    <div className="text-blue-600 text-sm font-medium truncate">
                      {page.metaTitle || page.title}
                    </div>
                    <div className="text-green-600 text-xs truncate">
                      example.com/{page.slug}
                    </div>
                    <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {page.metaDescription || 'No description available'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Live Page
                </Button>
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
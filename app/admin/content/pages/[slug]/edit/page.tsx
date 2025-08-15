"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { PagePreview } from "../../components/page-preview"
import { 
  Save, 
  ArrowLeft, 
  Eye,
  Globe,
  Search,
  FileText,
  Settings
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usePages } from "@/hooks/use-pages"
import { BusinessInfoEditor } from "../../components/business-info-editor"
import { ServiceDescriptionsEditor } from "../../components/service-descriptions-editor"
import type { PageContent } from "@/lib/types/content"

interface PageEditPageProps {
  params: {
    slug: string
  }
}

export default function PageEditPage({ params }: PageEditPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { getPage, updatePage, isLoading } = usePages()
  
  const [page, setPage] = useState<PageContent | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"content" | "business" | "services">("content")

  useEffect(() => {
    const loadPage = async () => {
      try {
        const pageData = await getPage(params.slug)
        if (pageData) {
          setPage(pageData)
          setTitle(pageData.title)
          setContent(pageData.content)
          setMetaTitle(pageData.metaTitle || "")
          setMetaDescription(pageData.metaDescription || "")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load page content",
          variant: "destructive",
        })
      }
    }

    loadPage()
  }, [params.slug, getPage, toast])

  const handleSave = async () => {
    if (!page) return

    setIsSaving(true)
    try {
      await updatePage(page.id, {
        title,
        content,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
      })

      toast({
        title: "Success",
        description: "Page content updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update page content",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    // This would integrate with your image upload service
    // For now, return a placeholder
    return "/placeholder.jpg"
  }

  const getPageTypeInfo = (slug: string) => {
    switch (slug) {
      case 'about':
        return {
          title: 'About Us Page',
          description: 'Manage your company story, mission, and team information',
          icon: FileText
        }
      case 'services':
        return {
          title: 'Services Page',
          description: 'Update service descriptions and offerings',
          icon: Settings
        }
      case 'contact':
        return {
          title: 'Contact Page',
          description: 'Manage contact information and business details',
          icon: Globe
        }
      default:
        return {
          title: 'Page Content',
          description: 'Edit page content and settings',
          icon: FileText
        }
    }
  }

  if (isLoading || !page) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const pageInfo = getPageTypeInfo(params.slug)
  const Icon = pageInfo.icon

  // Create a preview page object
  const previewPage = {
    ...page,
    title,
    content,
    metaTitle: metaTitle || undefined,
    metaDescription: metaDescription || undefined,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Icon className="h-6 w-6 text-gray-600" />
            <div>
              <h1 className="text-2xl font-bold">{pageInfo.title}</h1>
              <p className="text-gray-600 text-sm">{pageInfo.description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PagePreview page={previewPage}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </PagePreview>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            size="sm"
          >
            {isSaving ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tab Navigation for Contact and Services pages */}
      {(params.slug === 'contact' || params.slug === 'services') && (
        <div className="border-b">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("content")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "content"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Page Content
            </button>
            {params.slug === 'contact' && (
              <button
                onClick={() => setActiveTab("business")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "business"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Business Information
              </button>
            )}
            {params.slug === 'services' && (
              <button
                onClick={() => setActiveTab("services")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "services"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Service Descriptions
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === "content" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Content</CardTitle>
                <CardDescription>
                  Edit the main content that will appear on the {params.slug} page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Page Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter page title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Start writing your page content..."
                    minHeight={400}
                    onImageUpload={handleImageUpload}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SEO Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  SEO Settings
                </CardTitle>
                <CardDescription>
                  Optimize your page for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="SEO title (optional)"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500">
                    {metaTitle.length}/60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="SEO description (optional)"
                    maxLength={160}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    {metaDescription.length}/160 characters
                  </p>
                </div>

                {/* SEO Preview */}
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="text-blue-600 text-sm font-medium truncate">
                    {metaTitle || title}
                  </div>
                  <div className="text-green-600 text-xs truncate">
                    example.com/{params.slug}
                  </div>
                  <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {metaDescription || 'No description available'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Page Info */}
            <Card>
              <CardHeader>
                <CardTitle>Page Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">URL:</span>
                  <span className="font-mono">/{params.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span>{new Date(page.lastUpdated).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Updated By:</span>
                  <span>{page.updatedBy}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Business Information Tab (Contact page only) */}
      {activeTab === "business" && params.slug === 'contact' && (
        <BusinessInfoEditor />
      )}

      {/* Service Descriptions Tab (Services page only) */}
      {activeTab === "services" && params.slug === 'services' && (
        <ServiceDescriptionsEditor />
      )}
    </div>
  )
}
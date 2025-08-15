'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { MediaManager } from '@/components/ui/media-manager'
import { usePortfolio } from '@/hooks/use-portfolio'
import { useToast } from '@/hooks/use-toast'
import type { CreatePortfolioItemData } from '@/lib/types/content'

export default function NewPortfolioPage() {
  const router = useRouter()
  const { createPortfolioItem } = usePortfolio()
  const { toast } = useToast()
  
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<CreatePortfolioItemData>({
    title: '',
    description: '',
    serviceCategory: 'electrical',
    images: [],
    thumbnailImage: '',
    completionDate: new Date(),
    clientName: '',
    projectValue: undefined,
    location: '',
    tags: [],
    isVisible: true,
    isFeatured: false,
  })
  const [tagInput, setTagInput] = useState('')

  const handleInputChange = (field: keyof CreatePortfolioItemData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images,
      thumbnailImage: images[0] || ''
    }))
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a project title',
        variant: 'destructive',
      })
      return
    }

    if (!formData.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a project description',
        variant: 'destructive',
      })
      return
    }

    if (formData.images.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please upload at least one project image',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const newItem = await createPortfolioItem(formData)
      if (newItem) {
        toast({
          title: 'Success',
          description: 'Portfolio item created successfully',
        })
        router.push('/admin/content/portfolio')
      }
    } catch (error) {
      console.error('Error creating portfolio item:', error)
    } finally {
      setSaving(false)
    }
  }

  const sidebarContent = (
    <div className="space-y-6">
      {/* Publish Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Publish Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="visible">Visible on Website</Label>
            <Switch
              id="visible"
              checked={formData.isVisible}
              onCheckedChange={(checked) => handleInputChange('isVisible', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="featured">Featured Project</Label>
            <Switch
              id="featured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="serviceCategory">Service Category</Label>
            <Select
              value={formData.serviceCategory}
              onValueChange={(value) => handleInputChange('serviceCategory', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="hvac">HVAC</SelectItem>
                <SelectItem value="refrigeration">Refrigeration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="completionDate">Completion Date</Label>
            <Input
              id="completionDate"
              type="date"
              value={formData.completionDate.toISOString().split('T')[0]}
              onChange={(e) => handleInputChange('completionDate', new Date(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={formData.clientName || ''}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              placeholder="Enter client name"
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter project location"
            />
          </div>

          <div>
            <Label htmlFor="projectValue">Project Value</Label>
            <Input
              id="projectValue"
              type="number"
              value={formData.projectValue || ''}
              onChange={(e) => handleInputChange('projectValue', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="Enter project value"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tag"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            />
            <Button type="button" onClick={handleAddTag} size="sm">
              Add
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-2">
        <Button onClick={handleSave} disabled={saving} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Creating...' : 'Create Portfolio Item'}
        </Button>
        <Link href="/admin/content/portfolio">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolio
          </Button>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create Portfolio Item</h1>
            <p className="text-muted-foreground">Add a new project to your portfolio</p>
          </div>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter project title"
                className="text-lg"
              />
            </div>

            <div>
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the project, work performed, challenges overcome, etc."
                rows={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Project Images */}
        <Card>
          <CardHeader>
            <CardTitle>Project Images *</CardTitle>
          </CardHeader>
          <CardContent>
            <MediaManager
              images={formData.images}
              onImagesChange={handleImagesChange}
              maxImages={10}
              allowReorder={true}
            />
            {formData.images.length > 0 && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  The first image will be used as the thumbnail. Drag and drop to reorder images.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {sidebarContent}
      </div>
    </div>
  )
}
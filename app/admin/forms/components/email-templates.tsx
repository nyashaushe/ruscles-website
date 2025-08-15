"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  Eye
} from "lucide-react"

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  category: 'acknowledgment' | 'quote' | 'follow_up' | 'completion' | 'custom'
  variables: string[]
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

interface EmailTemplatesProps {
  templates: EmailTemplate[]
  onCreateTemplate: (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onUpdateTemplate: (id: string, updates: Partial<EmailTemplate>) => Promise<void>
  onDeleteTemplate: (id: string) => Promise<void>
  onSelectTemplate: (template: EmailTemplate) => void
}

const DEFAULT_TEMPLATES: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: "Service Inquiry Acknowledgment",
    subject: "Thank you for your inquiry - Ruscles Investments",
    body: `Dear {{customerName}},

Thank you for contacting Ruscles Investments regarding {{serviceType}}. We have received your inquiry and appreciate your interest in our services.

Our team will review your request and get back to you within 24 hours with more information and next steps.

If you have any urgent questions, please don't hesitate to call us at (555) 123-4567.

Best regards,
The Ruscles Investments Team`,
    category: 'acknowledgment',
    variables: ['customerName', 'serviceType'],
    isDefault: true
  },
  {
    name: "Quote Request Response",
    subject: "Quote Request - Ruscles Investments",
    body: `Dear {{customerName}},

Thank you for your quote request for {{serviceType}}. We have reviewed your requirements and will prepare a detailed quote for you.

Based on the information provided, we will need to schedule a site visit to provide you with an accurate estimate. Our team will contact you within 2 business days to arrange a convenient time.

The quote will include:
- Detailed scope of work
- Materials and labor costs
- Project timeline
- Warranty information

Best regards,
The Ruscles Investments Team`,
    category: 'quote',
    variables: ['customerName', 'serviceType'],
    isDefault: true
  },
  {
    name: "Follow-up Email",
    subject: "Following up on your inquiry - Ruscles Investments",
    body: `Dear {{customerName}},

I hope this message finds you well. I wanted to follow up on your recent inquiry regarding {{serviceType}}.

We are committed to providing you with the best service possible and would like to ensure all your questions have been answered.

Please let us know if you need any additional information or if you would like to schedule a consultation.

Best regards,
The Ruscles Investments Team`,
    category: 'follow_up',
    variables: ['customerName', 'serviceType'],
    isDefault: true
  }
]

export function EmailTemplates({ 
  templates, 
  onCreateTemplate, 
  onUpdateTemplate, 
  onDeleteTemplate,
  onSelectTemplate 
}: EmailTemplatesProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'custom' as EmailTemplate['category'],
    variables: [] as string[]
  })

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body: '',
      category: 'custom',
      variables: []
    })
  }

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{(\w+)\}\}/g)
    if (!matches) return []
    return [...new Set(matches.map(match => match.replace(/[{}]/g, '')))]
  }

  const handleCreateTemplate = async () => {
    if (!formData.name.trim() || !formData.subject.trim() || !formData.body.trim()) return

    setIsLoading(true)
    try {
      const variables = [
        ...extractVariables(formData.subject),
        ...extractVariables(formData.body)
      ]

      await onCreateTemplate({
        ...formData,
        variables,
        isDefault: false
      })

      resetForm()
      setIsCreateDialogOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTemplate = async () => {
    if (!editingTemplate || !formData.name.trim() || !formData.subject.trim() || !formData.body.trim()) return

    setIsLoading(true)
    try {
      const variables = [
        ...extractVariables(formData.subject),
        ...extractVariables(formData.body)
      ]

      await onUpdateTemplate(editingTemplate.id, {
        ...formData,
        variables
      })

      resetForm()
      setEditingTemplate(null)
      setIsEditDialogOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: template.category,
      variables: template.variables
    })
    setIsEditDialogOpen(true)
  }

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setPreviewTemplate(template)
    setIsPreviewDialogOpen(true)
  }

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    await onCreateTemplate({
      name: `${template.name} (Copy)`,
      subject: template.subject,
      body: template.body,
      category: template.category,
      variables: template.variables,
      isDefault: false
    })
  }

  const getCategoryColor = (category: EmailTemplate['category']) => {
    switch (category) {
      case 'acknowledgment': return 'bg-blue-100 text-blue-800'
      case 'quote': return 'bg-green-100 text-green-800'
      case 'follow_up': return 'bg-yellow-100 text-yellow-800'
      case 'completion': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const allTemplates = [...templates, ...DEFAULT_TEMPLATES.map((t, i) => ({
    ...t,
    id: `default-${i}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }))]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Email Templates
            </CardTitle>
            <CardDescription>
              Manage reusable email templates for customer responses
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Email Template</DialogTitle>
                <DialogDescription>
                  Create a reusable email template for customer responses
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input
                      placeholder="e.g., Service Inquiry Response"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value: EmailTemplate['category']) => 
                        setFormData(prev => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acknowledgment">Acknowledgment</SelectItem>
                        <SelectItem value="quote">Quote Request</SelectItem>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                        <SelectItem value="completion">Project Completion</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Subject Line</Label>
                  <Input
                    placeholder="Email subject line"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Email Body</Label>
                  <Textarea
                    placeholder="Email content... Use {{variableName}} for dynamic content"
                    value={formData.body}
                    onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                    rows={8}
                  />
                  <div className="text-xs text-gray-500">
                    Use variables like {{customerName}}, {{serviceType}}, {{companyName}} for dynamic content
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTemplate} 
                  disabled={isLoading || !formData.name.trim() || !formData.subject.trim() || !formData.body.trim()}
                >
                  {isLoading ? 'Creating...' : 'Create Template'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allTemplates.map((template) => (
            <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    {template.isDefault && (
                      <Badge variant="secondary" className="text-xs">Default</Badge>
                    )}
                  </div>
                  <Badge className={getCategoryColor(template.category)} variant="outline">
                    {template.category.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div>
                  <Label className="text-xs text-gray-500">Subject:</Label>
                  <p className="text-sm text-gray-700 truncate">{template.subject}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Preview:</Label>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {template.body.substring(0, 100)}...
                  </p>
                </div>
                {template.variables.length > 0 && (
                  <div>
                    <Label className="text-xs text-gray-500">Variables:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.variables.map((variable, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectTemplate(template)}
                >
                  Use Template
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handlePreviewTemplate(template)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDuplicateTemplate(template)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {!template.isDefault && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Email Template</DialogTitle>
              <DialogDescription>
                Update the email template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value: EmailTemplate['category']) => 
                      setFormData(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acknowledgment">Acknowledgment</SelectItem>
                      <SelectItem value="quote">Quote Request</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="completion">Project Completion</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Email Body</Label>
                <Textarea
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  rows={8}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTemplate} disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Template'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Template Preview</DialogTitle>
              <DialogDescription>
                Preview of "{previewTemplate?.name}"
              </DialogDescription>
            </DialogHeader>
            {previewTemplate && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject:</Label>
                  <div className="p-3 bg-gray-50 rounded border">
                    {previewTemplate.subject}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Body:</Label>
                  <div className="p-3 bg-gray-50 rounded border whitespace-pre-wrap">
                    {previewTemplate.body}
                  </div>
                </div>
                {previewTemplate.variables.length > 0 && (
                  <div className="space-y-2">
                    <Label>Available Variables:</Label>
                    <div className="flex flex-wrap gap-2">
                      {previewTemplate.variables.map((variable, index) => (
                        <Badge key={index} variant="outline">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsPreviewDialogOpen(false)}>
                Close
              </Button>
              {previewTemplate && (
                <Button onClick={() => onSelectTemplate(previewTemplate)}>
                  Use This Template
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
  Send, 
  Clock, 
  FileText, 
  Mail, 
  Phone, 
  User,
  Calendar,
  Eye
} from "lucide-react"
import type { FormSubmission } from "@/lib/types"

interface ResponseData {
  to: string
  subject: string
  message: string
  template: string
  priority: 'low' | 'normal' | 'high'
  sendCopy: boolean
  scheduleFor: Date | null
}

interface ResponseComposerProps {
  responseData: ResponseData
  onDataChange: (data: ResponseData) => void
  form: FormSubmission
}

const EMAIL_TEMPLATES = {
  acknowledgment: {
    subject: "Thank you for your inquiry - Ruscles Investments",
    body: `Dear {{customerName}},

Thank you for contacting Ruscles Investments. We have received your inquiry and appreciate your interest in our services.

Our team will review your request and get back to you within 24 hours with more information and next steps.

If you have any urgent questions, please don't hesitate to call us at (555) 123-4567.

Best regards,
The Ruscles Investments Team`
  },
  quote_request: {
    subject: "Quote Request - Ruscles Investments",
    body: `Dear {{customerName}},

Thank you for your quote request. We have reviewed your requirements and will prepare a detailed quote for you.

Based on the information provided, we will need to schedule a consultation to provide you with an accurate estimate. Our team will contact you within 2 business days to arrange a convenient time.

The quote will include:
- Detailed scope of work
- Investment analysis
- Expected returns
- Timeline and milestones

Best regards,
The Ruscles Investments Team`
  },
  follow_up: {
    subject: "Following up on your inquiry - Ruscles Investments",
    body: `Dear {{customerName}},

I hope this message finds you well. I wanted to follow up on your recent inquiry.

We are committed to providing you with the best service possible and would like to ensure all your questions have been answered.

Please let us know if you need any additional information or if you would like to schedule a consultation.

Best regards,
The Ruscles Investments Team`
  }
}

export function ResponseComposer({ 
  responseData,
  onDataChange,
  form
}: ResponseComposerProps) {
  const [isPreview, setIsPreview] = useState(false)

  const updateData = (updates: Partial<ResponseData>) => {
    onDataChange({ ...responseData, ...updates })
  }

  const handleTemplateChange = (templateKey: keyof typeof EMAIL_TEMPLATES) => {
    const template = EMAIL_TEMPLATES[templateKey]
    
    // Replace template variables
    const processedSubject = template.subject
      .replace('{{customerName}}', form.customerInfo.name)
      .replace('{{serviceType}}', form.formData?.serviceType || 'your service request')
    
    const processedBody = template.body
      .replace(/{{customerName}}/g, form.customerInfo.name)
      .replace(/{{serviceType}}/g, form.formData?.serviceType || 'your service request')
    
    updateData({
      template: templateKey,
      subject: processedSubject,
      message: processedBody
    })
  }

  return (
    <div className="space-y-6">
      {/* Email Response Composer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Compose Response
          </CardTitle>
          <CardDescription>
            Send a professional response to the customer inquiry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recipient */}
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              value={responseData.to}
              onChange={(e) => updateData({ to: e.target.value })}
              placeholder="Recipient email address"
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={responseData.subject}
              onChange={(e) => updateData({ subject: e.target.value })}
              placeholder="Email subject line"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Message</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
                className="text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                {isPreview ? 'Edit' : 'Preview'}
              </Button>
            </div>
            {isPreview ? (
              <div className="min-h-[200px] p-4 bg-gray-50 rounded border">
                <div className="whitespace-pre-wrap text-sm">
                  {responseData.message || 'No message content'}
                </div>
              </div>
            ) : (
              <Textarea
                id="message"
                value={responseData.message}
                onChange={(e) => updateData({ message: e.target.value })}
                placeholder="Type your response message here..."
                className="min-h-[200px] resize-none"
              />
            )}
          </div>

          {/* Priority and Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                value={responseData.priority} 
                onValueChange={(value: ResponseData['priority']) => updateData({ priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="normal">Normal Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Options</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendCopy"
                  checked={responseData.sendCopy}
                  onCheckedChange={(checked) => updateData({ sendCopy: checked as boolean })}
                />
                <Label htmlFor="sendCopy" className="text-sm">
                  Send copy to my email
                </Label>
              </div>
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-3">
            <Label>Quick Templates</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTemplateChange('acknowledgment')}
                className="justify-start"
              >
                <FileText className="h-3 w-3 mr-2" />
                Acknowledgment
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTemplateChange('quote_request')}
                className="justify-start"
              >
                <FileText className="h-3 w-3 mr-2" />
                Quote Request
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTemplateChange('follow_up')}
                className="justify-start"
              >
                <FileText className="h-3 w-3 mr-2" />
                Follow Up
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Character Count and Send Preview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{responseData.message.length} characters</span>
            <span>
              Estimated reading time: {Math.max(1, Math.ceil(responseData.message.split(' ').length / 200))} min
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
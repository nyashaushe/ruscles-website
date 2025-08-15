"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Send, 
  Clock, 
  FileText, 
  Mail, 
  Phone, 
  User,
  Calendar
} from "lucide-react"
import type { FormSubmission, FormResponse } from "@/lib/types"

interface ResponseComposerProps {
  recipientEmail: string
  formContext: FormSubmission
  onSend: (response: Omit<FormResponse, 'id' | 'formId' | 'respondedAt'>) => Promise<void>
  onCancel: () => void
}

const EMAIL_TEMPLATES = {
  acknowledgment: {
    subject: "Thank you for your inquiry - Ruscles Investments",
    body: `Dear {{customerName}},

Thank you for contacting Ruscles Investments regarding {{serviceType}}. We have received your inquiry and appreciate your interest in our services.

Our team will review your request and get back to you within 24 hours with more information and next steps.

If you have any urgent questions, please don't hesitate to call us at [phone number].

Best regards,
The Ruscles Investments Team`
  },
  quote_request: {
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
The Ruscles Investments Team`
  },
  follow_up: {
    subject: "Following up on your inquiry - Ruscles Investments",
    body: `Dear {{customerName}},

I hope this message finds you well. I wanted to follow up on your recent inquiry regarding {{serviceType}}.

We are committed to providing you with the best service possible and would like to ensure all your questions have been answered.

Please let us know if you need any additional information or if you would like to schedule a consultation.

Best regards,
The Ruscles Investments Team`
  },
  custom: {
    subject: "",
    body: ""
  }
}

export function ResponseComposer({ 
  recipientEmail, 
  formContext, 
  onSend, 
  onCancel 
}: ResponseComposerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof EMAIL_TEMPLATES>('acknowledgment')
  const [method, setMethod] = useState<FormResponse['method']>('email')
  const [subject, setSubject] = useState(EMAIL_TEMPLATES.acknowledgment.subject)
  const [content, setContent] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleTemplateChange = (templateKey: keyof typeof EMAIL_TEMPLATES) => {
    setSelectedTemplate(templateKey)
    const template = EMAIL_TEMPLATES[templateKey]
    
    // Replace template variables
    const processedSubject = template.subject
      .replace('{{customerName}}', formContext.customerInfo.name)
      .replace('{{serviceType}}', formContext.formData.serviceType || 'your service request')
    
    const processedBody = template.body
      .replace(/{{customerName}}/g, formContext.customerInfo.name)
      .replace(/{{serviceType}}/g, formContext.formData.serviceType || 'your service request')
    
    setSubject(processedSubject)
    setContent(processedBody)
  }

  const handleSend = async () => {
    if (!content.trim()) return

    setIsLoading(true)
    try {
      await onSend({
        respondedBy: 'Current Admin', // This would come from auth context
        method,
        content: method === 'email' ? `Subject: ${subject}\n\n${content}` : content,
        attachments: [] // File attachments would be handled separately
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Form Context Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Response Context</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Customer:</span>
            <span className="font-medium">{formContext.customerInfo.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{formContext.customerInfo.email}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Form Type:</span>
            <Badge variant="outline">{formContext.type.replace('_', ' ')}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Priority:</span>
            <Badge variant={formContext.priority === 'high' ? 'destructive' : 'secondary'}>
              {formContext.priority}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Response Method */}
      <div className="space-y-3">
        <Label>Response Method</Label>
        <Select value={method} onValueChange={(value: FormResponse['method']) => setMethod(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Response
              </div>
            </SelectItem>
            <SelectItem value="phone">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Call
              </div>
            </SelectItem>
            <SelectItem value="in_person">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                In-Person Meeting
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {method === 'email' && (
        <>
          {/* Email Template Selection */}
          <div className="space-y-3">
            <Label>Email Template</Label>
            <Select 
              value={selectedTemplate} 
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="acknowledgment">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Acknowledgment
                  </div>
                </SelectItem>
                <SelectItem value="quote_request">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Quote Request Response
                  </div>
                </SelectItem>
                <SelectItem value="follow_up">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Follow-up
                  </div>
                </SelectItem>
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Custom Message
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject line"
            />
          </div>
        </>
      )}

      {/* Response Content */}
      <div className="space-y-2">
        <Label htmlFor="content">
          {method === 'email' ? 'Email Content' : 
           method === 'phone' ? 'Call Notes' : 'Meeting Notes'}
        </Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            method === 'email' ? 'Compose your email response...' :
            method === 'phone' ? 'Record details of the phone call...' :
            'Record details of the meeting...'
          }
          rows={8}
          className="resize-none"
        />
        <div className="text-xs text-gray-500">
          {content.length} characters
        </div>
      </div>

      {/* Schedule for Later (Optional) */}
      {method === 'email' && (
        <div className="space-y-2">
          <Label htmlFor="scheduled">Schedule for Later (Optional)</Label>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <Input
              id="scheduled"
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="flex-1"
            />
          </div>
          {scheduledFor && (
            <div className="text-xs text-blue-600">
              This response will be sent on {new Date(scheduledFor).toLocaleString()}
            </div>
          )}
        </div>
      )}

      <Separator />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          {method === 'email' && scheduledFor && (
            <Button
              onClick={handleSend}
              disabled={!content.trim() || isLoading}
              variant="outline"
            >
              <Clock className="h-4 w-4 mr-2" />
              {isLoading ? 'Scheduling...' : 'Schedule'}
            </Button>
          )}
          <Button
            onClick={handleSend}
            disabled={!content.trim() || isLoading}
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : 
             method === 'email' ? 'Send Email' :
             method === 'phone' ? 'Record Call' : 'Record Meeting'}
          </Button>
        </div>
      </div>
    </div>
  )
}
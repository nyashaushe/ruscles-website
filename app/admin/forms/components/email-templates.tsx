"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  MessageSquare,
  Clock,
  CheckCircle
} from "lucide-react"

interface EmailTemplatesProps {
  onTemplateSelect: (template: string, content: string) => void
  formType: string
}

const EMAIL_TEMPLATES = {
  acknowledgment: {
    name: "Acknowledgment",
    description: "Standard thank you and acknowledgment",
    subject: "Thank you for your inquiry - Ruscles Investments",
    body: `Dear {{customerName}},

Thank you for contacting Ruscles Investments. We have received your inquiry and appreciate your interest in our services.

Our team will review your request and get back to you within 24 hours with more information and next steps.

If you have any urgent questions, please don't hesitate to call us at (555) 123-4567.

Best regards,
The Ruscles Investments Team`
  },
  quote_request: {
    name: "Quote Request",
    description: "Response to quote requests",
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
    name: "Follow-up",
    description: "Follow-up on previous inquiries",
    subject: "Following up on your inquiry - Ruscles Investments",
    body: `Dear {{customerName}},

I hope this message finds you well. I wanted to follow up on your recent inquiry.

We are committed to providing you with the best service possible and would like to ensure all your questions have been answered.

Please let us know if you need any additional information or if you would like to schedule a consultation.

Best regards,
The Ruscles Investments Team`
  },
  completion: {
    name: "Service Completion",
    description: "Project completion notification",
    subject: "Service Completion - Ruscles Investments",
    body: `Dear {{customerName}},

We are pleased to inform you that your investment project has been successfully completed.

Thank you for choosing Ruscles Investments. We value your business and look forward to serving you again in the future.

If you have any questions about your completed project, please don't hesitate to contact us.

Best regards,
The Ruscles Investments Team`
  }
}

export function EmailTemplates({ 
  onTemplateSelect,
  formType
}: EmailTemplatesProps) {
  const handleTemplateClick = (templateKey: keyof typeof EMAIL_TEMPLATES) => {
    const template = EMAIL_TEMPLATES[templateKey]
    onTemplateSelect(templateKey, template.body)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Email Templates
        </CardTitle>
        <CardDescription>
          Quick templates for common responses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
          <div key={key} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-sm">{template.name}</h4>
                <p className="text-xs text-gray-600">{template.description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTemplateClick(key as keyof typeof EMAIL_TEMPLATES)}
                className="text-xs"
              >
                Use Template
              </Button>
            </div>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
              <strong>Subject:</strong> {template.subject}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
import { notificationsApi } from '@/lib/api/notifications'
import { Notification } from '@/lib/types/notifications'

export interface EmailNotificationData {
  to: string[]
  subject: string
  message: string
  priority: Notification['priority']
  formId?: string
  metadata?: Record<string, any>
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
}

// Email templates for different notification types
export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  new_form_submission: {
    id: 'new_form_submission',
    name: 'New Form Submission',
    subject: 'New {{formType}} submission from {{customerName}}',
    body: `
      <h2>New Form Submission Received</h2>
      <p>A new {{formType}} has been submitted on your website.</p>
      
      <h3>Customer Information:</h3>
      <ul>
        <li><strong>Name:</strong> {{customerName}}</li>
        <li><strong>Email:</strong> {{customerEmail}}</li>
        <li><strong>Phone:</strong> {{customerPhone}}</li>
        <li><strong>Service Type:</strong> {{serviceType}}</li>
      </ul>
      
      <h3>Message:</h3>
      <p>{{customerMessage}}</p>
      
      <p><a href="{{adminUrl}}/forms/{{formId}}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Admin Panel</a></p>
      
      <p><small>Submitted on {{submissionDate}} at {{submissionTime}}</small></p>
    `,
    variables: ['formType', 'customerName', 'customerEmail', 'customerPhone', 'serviceType', 'customerMessage', 'adminUrl', 'formId', 'submissionDate', 'submissionTime']
  },

  urgent_inquiry: {
    id: 'urgent_inquiry',
    name: 'Urgent Inquiry Alert',
    subject: '🚨 URGENT: {{serviceType}} emergency from {{customerName}}',
    body: `
      <div style="background-color: #fef2f2; border: 2px solid #ef4444; padding: 20px; border-radius: 8px;">
        <h2 style="color: #dc2626; margin-top: 0;">🚨 URGENT INQUIRY ALERT</h2>
        <p style="color: #dc2626; font-weight: bold;">This inquiry has been marked as urgent and requires immediate attention.</p>
      </div>
      
      <h3>Customer Information:</h3>
      <ul>
        <li><strong>Name:</strong> {{customerName}}</li>
        <li><strong>Email:</strong> {{customerEmail}}</li>
        <li><strong>Phone:</strong> {{customerPhone}}</li>
        <li><strong>Service Type:</strong> {{serviceType}}</li>
        <li><strong>Priority:</strong> <span style="color: #dc2626; font-weight: bold;">URGENT</span></li>
      </ul>
      
      <h3>Emergency Details:</h3>
      <p>{{customerMessage}}</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Recommended Action:</strong> Contact the customer immediately at {{customerPhone}} or {{customerEmail}}</p>
      </div>
      
      <p><a href="{{adminUrl}}/forms/{{formId}}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">RESPOND NOW</a></p>
      
      <p><small>Submitted on {{submissionDate}} at {{submissionTime}}</small></p>
    `,
    variables: ['customerName', 'customerEmail', 'customerPhone', 'serviceType', 'customerMessage', 'adminUrl', 'formId', 'submissionDate', 'submissionTime']
  },

  follow_up_reminder: {
    id: 'follow_up_reminder',
    name: 'Follow-up Reminder',
    subject: 'Follow-up reminder: {{customerName}} - {{serviceType}}',
    body: `
      <h2>Follow-up Reminder</h2>
      <p>This is a reminder to follow up with a customer inquiry.</p>
      
      <h3>Customer Information:</h3>
      <ul>
        <li><strong>Name:</strong> {{customerName}}</li>
        <li><strong>Email:</strong> {{customerEmail}}</li>
        <li><strong>Phone:</strong> {{customerPhone}}</li>
        <li><strong>Service Type:</strong> {{serviceType}}</li>
        <li><strong>Original Submission:</strong> {{originalDate}}</li>
      </ul>
      
      <h3>Original Message:</h3>
      <p>{{customerMessage}}</p>
      
      <h3>Follow-up Notes:</h3>
      <p>{{followUpNotes}}</p>
      
      <p><a href="{{adminUrl}}/forms/{{formId}}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Details & Respond</a></p>
      
      <p><small>Reminder set for {{reminderDate}}</small></p>
    `,
    variables: ['customerName', 'customerEmail', 'customerPhone', 'serviceType', 'originalDate', 'customerMessage', 'followUpNotes', 'adminUrl', 'formId', 'reminderDate']
  },

  content_published: {
    id: 'content_published',
    name: 'Content Published',
    subject: 'Content published: {{contentTitle}}',
    body: `
      <h2>Content Successfully Published</h2>
      <p>Your content has been published and is now live on the website.</p>
      
      <h3>Content Details:</h3>
      <ul>
        <li><strong>Title:</strong> {{contentTitle}}</li>
        <li><strong>Type:</strong> {{contentType}}</li>
        <li><strong>Published:</strong> {{publishDate}}</li>
        <li><strong>Author:</strong> {{authorName}}</li>
      </ul>
      
      <p><a href="{{contentUrl}}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Published Content</a></p>
      
      <p><a href="{{adminUrl}}/content/{{contentType}}/{{contentId}}/edit" style="background-color: #6b7280; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-left: 10px;">Edit Content</a></p>
    `,
    variables: ['contentTitle', 'contentType', 'publishDate', 'authorName', 'contentUrl', 'adminUrl', 'contentId']
  },

  spam_detected: {
    id: 'spam_detected',
    name: 'Spam Detected',
    subject: 'Spam submission blocked: {{spamScore}}% confidence',
    body: `
      <h2>Spam Submission Detected & Blocked</h2>
      <p>A form submission has been automatically flagged as spam and blocked from processing.</p>
      
      <h3>Spam Detection Details:</h3>
      <ul>
        <li><strong>Spam Score:</strong> {{spamScore}}%</li>
        <li><strong>Confidence Level:</strong> {{confidenceLevel}}</li>
        <li><strong>Detection Time:</strong> {{detectionTime}}</li>
      </ul>
      
      <h3>Submission Details:</h3>
      <ul>
        <li><strong>Form Type:</strong> {{formType}}</li>
        <li><strong>Submitted Name:</strong> {{submittedName}}</li>
        <li><strong>Submitted Email:</strong> {{submittedEmail}}</li>
        <li><strong>IP Address:</strong> {{ipAddress}}</li>
      </ul>
      
      <h3>Spam Indicators:</h3>
      <ul>
        {{#each spamReasons}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
      
      <p><a href="{{adminUrl}}/settings/notifications?tab=spam" style="background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Spam Detection</a></p>
      
      <p><small>If this appears to be a false positive, you can review and approve it in the admin panel.</small></p>
    `,
    variables: ['spamScore', 'confidenceLevel', 'detectionTime', 'formType', 'submittedName', 'submittedEmail', 'ipAddress', 'spamReasons', 'adminUrl']
  }
}

class EmailNotificationService {
  // Send email notification using template
  async sendTemplatedEmail(
    templateId: string,
    recipients: string[],
    variables: Record<string, any>,
    priority: Notification['priority'] = 'medium'
  ): Promise<void> {
    const template = EMAIL_TEMPLATES[templateId]
    if (!template) {
      throw new Error(`Email template '${templateId}' not found`)
    }

    // Replace template variables
    const subject = this.replaceVariables(template.subject, variables)
    const message = this.replaceVariables(template.body, variables)

    await this.sendEmail({
      to: recipients,
      subject,
      message,
      priority,
      metadata: {
        templateId,
        variables
      }
    })
  }

  // Send custom email notification
  async sendEmail(data: EmailNotificationData): Promise<void> {
    try {
      await notificationsApi.sendEmailNotification(data)
    } catch (error) {
      console.error('Failed to send email notification:', error)
      throw error
    }
  }

  // Send notification for new form submission
  async sendFormSubmissionNotification(formData: {
    formId: string
    formType: string
    customerName: string
    customerEmail: string
    customerPhone?: string
    serviceType?: string
    message: string
    isUrgent?: boolean
    submissionDate: Date
  }): Promise<void> {
    const templateId = formData.isUrgent ? 'urgent_inquiry' : 'new_form_submission'
    const priority = formData.isUrgent ? 'urgent' : 'high'

    const variables = {
      formType: formData.formType,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone || 'Not provided',
      serviceType: formData.serviceType || 'General inquiry',
      customerMessage: formData.message,
      adminUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      formId: formData.formId,
      submissionDate: formData.submissionDate.toLocaleDateString(),
      submissionTime: formData.submissionDate.toLocaleTimeString()
    }

    // Get admin email addresses (this would typically come from settings)
    const adminEmails = process.env.ADMIN_EMAIL_ADDRESSES?.split(',') || ['admin@ruscleinvestments.com']

    await this.sendTemplatedEmail(templateId, adminEmails, variables, priority)
  }

  // Send follow-up reminder
  async sendFollowUpReminder(reminderData: {
    formId: string
    customerName: string
    customerEmail: string
    customerPhone?: string
    serviceType: string
    originalMessage: string
    originalDate: Date
    followUpNotes?: string
    reminderDate: Date
  }): Promise<void> {
    const variables = {
      customerName: reminderData.customerName,
      customerEmail: reminderData.customerEmail,
      customerPhone: reminderData.customerPhone || 'Not provided',
      serviceType: reminderData.serviceType,
      originalDate: reminderData.originalDate.toLocaleDateString(),
      customerMessage: reminderData.originalMessage,
      followUpNotes: reminderData.followUpNotes || 'No additional notes',
      adminUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      formId: reminderData.formId,
      reminderDate: reminderData.reminderDate.toLocaleDateString()
    }

    const adminEmails = process.env.ADMIN_EMAIL_ADDRESSES?.split(',') || ['admin@ruscleinvestments.com']
    await this.sendTemplatedEmail('follow_up_reminder', adminEmails, variables, 'medium')
  }

  // Send content published notification
  async sendContentPublishedNotification(contentData: {
    contentId: string
    contentTitle: string
    contentType: string
    contentUrl: string
    authorName: string
    publishDate: Date
  }): Promise<void> {
    const variables = {
      contentTitle: contentData.contentTitle,
      contentType: contentData.contentType,
      publishDate: contentData.publishDate.toLocaleDateString(),
      authorName: contentData.authorName,
      contentUrl: contentData.contentUrl,
      adminUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      contentId: contentData.contentId
    }

    const adminEmails = process.env.ADMIN_EMAIL_ADDRESSES?.split(',') || ['admin@ruscleinvestments.com']
    await this.sendTemplatedEmail('content_published', adminEmails, variables, 'low')
  }

  // Send spam detection notification
  async sendSpamDetectionNotification(spamData: {
    formType: string
    submittedName: string
    submittedEmail: string
    ipAddress?: string
    spamScore: number
    spamReasons: string[]
    detectionTime: Date
  }): Promise<void> {
    const variables = {
      spamScore: spamData.spamScore.toString(),
      confidenceLevel: spamData.spamScore >= 80 ? 'High' : spamData.spamScore >= 60 ? 'Medium' : 'Low',
      detectionTime: spamData.detectionTime.toLocaleString(),
      formType: spamData.formType,
      submittedName: spamData.submittedName,
      submittedEmail: spamData.submittedEmail,
      ipAddress: spamData.ipAddress || 'Unknown',
      spamReasons: spamData.spamReasons,
      adminUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }

    const adminEmails = process.env.ADMIN_EMAIL_ADDRESSES?.split(',') || ['admin@ruscleinvestments.com']
    await this.sendTemplatedEmail('spam_detected', adminEmails, variables, 'medium')
  }

  // Replace template variables with actual values
  private replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template

    // Handle simple variable replacement
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, String(value))
    })

    // Handle array iteration (basic Handlebars-like syntax)
    const arrayRegex = /{{#each (\w+)}}(.*?){{\/each}}/gs
    result = result.replace(arrayRegex, (match, arrayName, itemTemplate) => {
      const array = variables[arrayName]
      if (Array.isArray(array)) {
        return array.map(item => itemTemplate.replace(/{{this}}/g, String(item))).join('')
      }
      return ''
    })

    return result
  }

  // Get available templates
  getAvailableTemplates(): EmailTemplate[] {
    return Object.values(EMAIL_TEMPLATES)
  }

  // Get template by ID
  getTemplate(templateId: string): EmailTemplate | undefined {
    return EMAIL_TEMPLATES[templateId]
  }
}

export const emailNotificationService = new EmailNotificationService()

// Utility functions for common notification scenarios
export async function notifyNewFormSubmission(formData: any): Promise<void> {
  await emailNotificationService.sendFormSubmissionNotification(formData)
}

export async function notifyUrgentInquiry(formData: any): Promise<void> {
  await emailNotificationService.sendFormSubmissionNotification({
    ...formData,
    isUrgent: true
  })
}

export async function notifyContentPublished(contentData: any): Promise<void> {
  await emailNotificationService.sendContentPublishedNotification(contentData)
}

export async function notifySpamDetected(spamData: any): Promise<void> {
  await emailNotificationService.sendSpamDetectionNotification(spamData)
}
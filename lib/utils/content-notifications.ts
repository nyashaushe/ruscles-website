import { notificationsApi } from '@/lib/api/notifications'
import { emailNotificationService } from './email-notifications'
import { ContentItem } from '@/lib/types/content'

export interface ContentNotificationData {
  contentId: string
  contentTitle: string
  contentType: 'blog_post' | 'testimonial' | 'portfolio_item' | 'page_content'
  action: 'published' | 'scheduled' | 'updated' | 'archived'
  authorName: string
  publishDate?: Date
  scheduledDate?: Date
}

class ContentNotificationService {
  // Notify when content is published
  async notifyContentPublished(data: ContentNotificationData): Promise<void> {
    try {
      // Create in-app notification
      await notificationsApi.createNotification({
        type: 'content_published',
        title: `${this.getContentTypeLabel(data.contentType)} published`,
        message: `"${data.contentTitle}" has been published by ${data.authorName}`,
        priority: 'low',
        actionUrl: this.getContentUrl(data.contentType, data.contentId),
        metadata: {
          contentId: data.contentId,
          contentType: data.contentType,
          authorName: data.authorName,
          publishDate: data.publishDate?.toISOString()
        }
      })

      // Send email notification
      if (data.publishDate) {
        await emailNotificationService.sendContentPublishedNotification({
          contentId: data.contentId,
          contentTitle: data.contentTitle,
          contentType: this.getContentTypeLabel(data.contentType),
          contentUrl: this.getPublicContentUrl(data.contentType, data.contentId),
          authorName: data.authorName,
          publishDate: data.publishDate
        })
      }
    } catch (error) {
      console.error('Failed to send content published notification:', error)
    }
  }

  // Notify when content is scheduled for publication
  async notifyContentScheduled(data: ContentNotificationData): Promise<void> {
    if (!data.scheduledDate) return

    try {
      await notificationsApi.createNotification({
        type: 'reminder',
        title: `${this.getContentTypeLabel(data.contentType)} scheduled`,
        message: `"${data.contentTitle}" is scheduled to publish on ${data.scheduledDate.toLocaleDateString()}`,
        priority: 'low',
        actionUrl: this.getContentUrl(data.contentType, data.contentId),
        metadata: {
          contentId: data.contentId,
          contentType: data.contentType,
          authorName: data.authorName,
          scheduledDate: data.scheduledDate.toISOString()
        }
      })
    } catch (error) {
      console.error('Failed to send content scheduled notification:', error)
    }
  }

  // Notify when scheduled content is about to be published
  async notifyContentPublishingReminder(data: ContentNotificationData): Promise<void> {
    if (!data.scheduledDate) return

    try {
      await notificationsApi.createNotification({
        type: 'reminder',
        title: 'Content publishing reminder',
        message: `"${data.contentTitle}" is scheduled to publish today`,
        priority: 'medium',
        actionUrl: this.getContentUrl(data.contentType, data.contentId),
        metadata: {
          contentId: data.contentId,
          contentType: data.contentType,
          scheduledDate: data.scheduledDate.toISOString()
        }
      })
    } catch (error) {
      console.error('Failed to send content publishing reminder:', error)
    }
  }

  // Notify when content needs review or approval
  async notifyContentNeedsReview(data: ContentNotificationData & { reviewReason: string }): Promise<void> {
    try {
      await notificationsApi.createNotification({
        type: 'system',
        title: 'Content needs review',
        message: `"${data.contentTitle}" requires review: ${data.reviewReason}`,
        priority: 'medium',
        actionUrl: this.getContentUrl(data.contentType, data.contentId),
        metadata: {
          contentId: data.contentId,
          contentType: data.contentType,
          authorName: data.authorName,
          reviewReason: data.reviewReason
        }
      })
    } catch (error) {
      console.error('Failed to send content review notification:', error)
    }
  }

  // Notify when content draft is auto-saved
  async notifyContentAutoSaved(contentId: string, contentTitle: string, contentType: string): Promise<void> {
    // This is typically a silent operation, but we could log it for debugging
    console.log(`Auto-saved draft: ${contentTitle} (${contentType})`)
  }

  // Get human-readable content type label
  private getContentTypeLabel(contentType: string): string {
    switch (contentType) {
      case 'blog_post':
        return 'Blog post'
      case 'testimonial':
        return 'Testimonial'
      case 'portfolio_item':
        return 'Portfolio item'
      case 'page_content':
        return 'Page content'
      default:
        return 'Content'
    }
  }

  // Get admin URL for content
  private getContentUrl(contentType: string, contentId: string): string {
    const baseUrl = '/admin/content'
    
    switch (contentType) {
      case 'blog_post':
        return `${baseUrl}/blog/${contentId}`
      case 'testimonial':
        return `${baseUrl}/testimonials/${contentId}`
      case 'portfolio_item':
        return `${baseUrl}/portfolio/${contentId}`
      case 'page_content':
        return `${baseUrl}/pages/${contentId}`
      default:
        return baseUrl
    }
  }

  // Get public URL for content
  private getPublicContentUrl(contentType: string, contentId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    switch (contentType) {
      case 'blog_post':
        return `${baseUrl}/blog/${contentId}`
      case 'testimonial':
        return `${baseUrl}/#testimonials`
      case 'portfolio_item':
        return `${baseUrl}/portfolio/${contentId}`
      case 'page_content':
        return baseUrl // Depends on the specific page
      default:
        return baseUrl
    }
  }
}

export const contentNotificationService = new ContentNotificationService()

// Utility functions for common content notification scenarios
export async function notifyBlogPostPublished(
  postId: string,
  title: string,
  authorName: string,
  publishDate: Date
): Promise<void> {
  await contentNotificationService.notifyContentPublished({
    contentId: postId,
    contentTitle: title,
    contentType: 'blog_post',
    action: 'published',
    authorName,
    publishDate
  })
}

export async function notifyTestimonialAdded(
  testimonialId: string,
  customerName: string,
  authorName: string
): Promise<void> {
  await contentNotificationService.notifyContentPublished({
    contentId: testimonialId,
    contentTitle: `Testimonial from ${customerName}`,
    contentType: 'testimonial',
    action: 'published',
    authorName,
    publishDate: new Date()
  })
}

export async function notifyPortfolioItemAdded(
  itemId: string,
  title: string,
  authorName: string
): Promise<void> {
  await contentNotificationService.notifyContentPublished({
    contentId: itemId,
    contentTitle: title,
    contentType: 'portfolio_item',
    action: 'published',
    authorName,
    publishDate: new Date()
  })
}

export async function notifyContentScheduled(
  contentId: string,
  title: string,
  contentType: 'blog_post' | 'testimonial' | 'portfolio_item' | 'page_content',
  scheduledDate: Date,
  authorName: string
): Promise<void> {
  await contentNotificationService.notifyContentScheduled({
    contentId,
    contentTitle: title,
    contentType,
    action: 'scheduled',
    authorName,
    scheduledDate
  })
}
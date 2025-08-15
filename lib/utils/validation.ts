import { z } from 'zod'

// Form submission validation schemas
export const formSubmissionSchema = z.object({
  type: z.enum(['contact', 'service_inquiry', 'quote_request']),
  customerInfo: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    company: z.string().optional(),
  }),
  formData: z.record(z.any()),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  tags: z.array(z.string()).default([]),
  notes: z.string().default(''),
})

export const responseSchema = z.object({
  content: z.string().min(1, 'Response content is required'),
  method: z.enum(['email', 'phone', 'in_person']),
  attachments: z.array(z.instanceof(File)).optional(),
  scheduleFollowUp: z.date().optional(),
})

// Content validation schemas
export const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']).default('draft'),
  scheduledFor: z.date().optional(),
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  featuredImage: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

export const testimonialSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerTitle: z.string().optional(),
  customerCompany: z.string().optional(),
  customerPhoto: z.string().optional(),
  testimonialText: z.string().min(1, 'Testimonial text is required'),
  rating: z.number().min(1).max(5).optional(),
  projectType: z.string().optional(),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().default(0),
})

export const portfolioItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  serviceCategory: z.enum(['electrical', 'hvac', 'refrigeration']),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  thumbnailImage: z.string().min(1, 'Thumbnail image is required'),
  completionDate: z.date(),
  clientName: z.string().optional(),
  projectValue: z.number().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().default(0),
})

// Utility validation functions
export function validateEmail(email: string): boolean {
  return z.string().email().safeParse(email).success
}

export function validateUrl(url: string): boolean {
  return z.string().url().safeParse(url).success
}

export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
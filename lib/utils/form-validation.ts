import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address')
export const phoneSchema = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
export const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters')
export const requiredStringSchema = z.string().min(1, 'This field is required')
export const urlSchema = z.string().url('Please enter a valid URL')

// Form-specific validation schemas
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  company: z.string().max(100, 'Company name must be less than 100 characters').optional(),
  subject: requiredStringSchema.max(200, 'Subject must be less than 200 characters'),
  message: requiredStringSchema.min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
  serviceType: z.enum(['electrical', 'hvac', 'refrigeration', 'general']).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
})

export const serviceInquirySchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: requiredStringSchema.max(300, 'Address must be less than 300 characters'),
  serviceType: z.enum(['electrical', 'hvac', 'refrigeration']),
  description: requiredStringSchema.min(20, 'Description must be at least 20 characters').max(1000, 'Description must be less than 1000 characters'),
  preferredDate: z.string().optional(),
  budget: z.string().optional()
})

export const quoteRequestSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: z.string().max(100, 'Company name must be less than 100 characters').optional(),
  projectType: z.enum(['electrical', 'hvac', 'refrigeration']),
  projectDescription: requiredStringSchema.min(50, 'Project description must be at least 50 characters').max(2000, 'Project description must be less than 2000 characters'),
  timeline: z.enum(['immediate', '1-2_weeks', '1-3_months', '3-6_months', 'flexible']),
  budget: z.enum(['under_5k', '5k-15k', '15k-50k', '50k-100k', 'over_100k']),
  location: requiredStringSchema.max(300, 'Location must be less than 300 characters')
})

export const blogPostSchema = z.object({
  title: requiredStringSchema.min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').min(3, 'Slug must be at least 3 characters'),
  excerpt: z.string().max(300, 'Excerpt must be less than 300 characters').optional(),
  content: requiredStringSchema.min(100, 'Content must be at least 100 characters'),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']).default('draft'),
  publishedAt: z.string().datetime().optional(),
  scheduledFor: z.string().datetime().optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).max(10, 'Maximum 10 tags allowed'),
  categories: z.array(z.string().max(50, 'Category must be less than 50 characters')).max(5, 'Maximum 5 categories allowed'),
  seoTitle: z.string().max(60, 'SEO title must be less than 60 characters').optional(),
  seoDescription: z.string().max(160, 'SEO description must be less than 160 characters').optional(),
  featuredImage: z.string().url('Featured image must be a valid URL').optional()
})

export const testimonialSchema = z.object({
  customerName: nameSchema,
  customerTitle: z.string().max(100, 'Customer title must be less than 100 characters').optional(),
  customerCompany: z.string().max(100, 'Company name must be less than 100 characters').optional(),
  testimonialText: requiredStringSchema.min(20, 'Testimonial must be at least 20 characters').max(1000, 'Testimonial must be less than 1000 characters'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
  projectType: z.enum(['electrical', 'hvac', 'refrigeration']).optional(),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  customerPhoto: z.string().url('Customer photo must be a valid URL').optional()
})

export const portfolioItemSchema = z.object({
  title: requiredStringSchema.min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  description: requiredStringSchema.min(50, 'Description must be at least 50 characters').max(2000, 'Description must be less than 2000 characters'),
  serviceCategory: z.enum(['electrical', 'hvac', 'refrigeration']),
  images: z.array(z.string().url('Image must be a valid URL')).min(1, 'At least one image is required').max(20, 'Maximum 20 images allowed'),
  completionDate: z.string().datetime(),
  clientName: z.string().max(100, 'Client name must be less than 100 characters').optional(),
  location: z.string().max(200, 'Location must be less than 200 characters').optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).max(10, 'Maximum 10 tags allowed'),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false)
})

export const formResponseSchema = z.object({
  content: requiredStringSchema.min(10, 'Response must be at least 10 characters').max(5000, 'Response must be less than 5000 characters'),
  method: z.enum(['email', 'phone', 'in_person']).default('email'),
  followUpDate: z.string().datetime().optional(),
  isInternal: z.boolean().default(false)
})

// Validation error types
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: ValidationError[]
}

// Validation utilities
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data)
    return {
      success: true,
      data: validatedData
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
      
      return {
        success: false,
        errors
      }
    }
    
    return {
      success: false,
      errors: [{
        field: 'unknown',
        message: 'Validation failed',
        code: 'unknown_error'
      }]
    }
  }
}

export function getFieldError(errors: ValidationError[] | undefined, fieldName: string): string | undefined {
  return errors?.find(error => error.field === fieldName)?.message
}

export function hasFieldError(errors: ValidationError[] | undefined, fieldName: string): boolean {
  return errors?.some(error => error.field === fieldName) ?? false
}

// Real-time validation hook
export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const validateField = (fieldName: string, value: any): string | undefined => {
    try {
      // Create a partial schema for single field validation
      const fieldSchema = schema.shape[fieldName as keyof typeof schema.shape]
      if (fieldSchema) {
        fieldSchema.parse(value)
      }
      return undefined
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message
      }
      return 'Validation error'
    }
  }

  const validateForm = (data: unknown): ValidationResult<T> => {
    return validateForm(schema, data)
  }

  return {
    validateField,
    validateForm
  }
}

// File validation
export const imageFileSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine(file => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type), 'File must be an image (JPEG, PNG, WebP, or GIF)')
})

export const documentFileSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 50 * 1024 * 1024, 'File size must be less than 50MB')
    .refine(file => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type), 'File must be a document (PDF, DOC, or DOCX)')
})

export function validateFile(file: File, type: 'image' | 'document'): ValidationResult<{ file: File }> {
  const schema = type === 'image' ? imageFileSchema : documentFileSchema
  return validateForm(schema, { file })
}
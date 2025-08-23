export { prisma, default as db } from './client'
export * from './utils'

// Re-export Prisma types for convenience
export type {
    User,
    FormSubmission,
    FormResponse,
    ContentItem,
    BlogPost,
    Testimonial,
    PortfolioItem,
    PageContent,
    Notification,
    BusinessInfo,
    Settings
} from '@prisma/client'

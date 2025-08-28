// Re-export from the db directory for backward compatibility
export { prisma, default as db } from './db/client'
export * from './db/utils'

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
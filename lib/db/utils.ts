import { prisma } from './client'

export async function checkDatabaseConnection() {
    try {
        await prisma.$queryRaw`SELECT 1`
        return { success: true, message: 'Database connection successful' }
    } catch (error) {
        return {
            success: false,
            message: 'Database connection failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

export async function seedDatabase() {
    try {
        // Create default admin user
        const adminUser = await prisma.user.upsert({
            where: { email: 'admin@ruscles.com' },
            update: {},
            create: {
                email: 'admin@ruscles.com',
                name: 'Admin User',
                role: 'ADMIN',
                isActive: true,
            },
        })

        // Create default business info
        const businessInfo = await prisma.businessInfo.upsert({
            where: { id: 'default' },
            update: {},
            create: {
                id: 'default',
                companyName: 'Ruscles',
                tagline: 'Your Trusted Service Partner',
                description: 'Professional electrical, HVAC, and refrigeration services',
                email: 'info@ruscles.com',
                phone: '+1 (555) 123-4567',
                website: 'https://ruscles.com',
                updatedBy: adminUser.id,
            },
        })

        // Create default settings
        const defaultSettings = [
            { key: 'site_title', value: 'Ruscles - Professional Services', description: 'Website title' },
            { key: 'contact_email', value: 'info@ruscles.com', description: 'Primary contact email' },
            { key: 'business_hours', value: 'Monday-Friday: 8AM-6PM', description: 'Business hours' },
        ]

        for (const setting of defaultSettings) {
            await prisma.settings.upsert({
                where: { key: setting.key },
                update: { value: setting.value },
                create: {
                    ...setting,
                    isPublic: true,
                    updatedBy: adminUser.id,
                },
            })
        }

        return { success: true, message: 'Database seeded successfully' }
    } catch (error) {
        return {
            success: false,
            message: 'Database seeding failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

export async function resetDatabase() {
    try {
        await prisma.$transaction([
            prisma.formResponse.deleteMany(),
            prisma.formSubmission.deleteMany(),
            prisma.notification.deleteMany(),
            prisma.blogPost.deleteMany(),
            prisma.contentItem.deleteMany(),
            prisma.testimonial.deleteMany(),
            prisma.portfolioItem.deleteMany(),
            prisma.pageContent.deleteMany(),
            prisma.businessInfo.deleteMany(),
            prisma.settings.deleteMany(),
            prisma.user.deleteMany(),
        ])
        return { success: true, message: 'Database reset successfully' }
    } catch (error) {
        return {
            success: false,
            message: 'Database reset failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

export async function getDatabaseStats() {
    try {
        const [
            userCount,
            formCount,
            contentCount,
            testimonialCount,
            portfolioCount,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.formSubmission.count(),
            prisma.contentItem.count(),
            prisma.testimonial.count(),
            prisma.portfolioItem.count(),
        ])

        return {
            success: true,
            stats: {
                users: userCount,
                forms: formCount,
                content: contentCount,
                testimonials: testimonialCount,
                portfolio: portfolioCount,
            },
        }
    } catch (error) {
        return {
            success: false,
            message: 'Failed to get database stats',
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

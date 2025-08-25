import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/business-info - Get business information
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get the latest business info
        const businessInfo = await prisma.businessInfo.findFirst({
            orderBy: { updatedAt: 'desc' },
        })

        if (!businessInfo) {
            return NextResponse.json({ businessInfo: null })
        }

        // Parse JSON fields
        const businessInfoWithParsedFields = {
            ...businessInfo,
            socialMedia: businessInfo.socialMedia ? JSON.parse(businessInfo.socialMedia) : {},
            businessHours: businessInfo.businessHours ? JSON.parse(businessInfo.businessHours) : {},
            services: businessInfo.services ? JSON.parse(businessInfo.services) : {},
        }

        return NextResponse.json({ businessInfo: businessInfoWithParsedFields })
    } catch (error) {
        console.error('Error fetching business info:', error)
        return NextResponse.json(
            { error: 'Failed to fetch business info' },
            { status: 500 }
        )
    }
}

// POST /api/business-info - Create or update business information
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Validate required fields
        if (!body.companyName) {
            return NextResponse.json(
                { error: 'Missing required field: companyName' },
                { status: 400 }
            )
        }

        // Check if business info already exists
        const existingBusinessInfo = await prisma.businessInfo.findFirst({
            orderBy: { updatedAt: 'desc' },
        })

        let businessInfo
        if (existingBusinessInfo) {
            // Update existing business info
            businessInfo = await prisma.businessInfo.update({
                where: { id: existingBusinessInfo.id },
                data: {
                    companyName: body.companyName,
                    tagline: body.tagline,
                    description: body.description,
                    address: body.address,
                    phone: body.phone,
                    email: body.email,
                    website: body.website,
                    logo: body.logo,
                    socialMedia: JSON.stringify(body.socialMedia || {}),
                    businessHours: JSON.stringify(body.businessHours || {}),
                    services: JSON.stringify(body.services || {}),
                    updatedBy: session.user.id,
                }
            })
        } else {
            // Create new business info
            businessInfo = await prisma.businessInfo.create({
                data: {
                    companyName: body.companyName,
                    tagline: body.tagline,
                    description: body.description,
                    address: body.address,
                    phone: body.phone,
                    email: body.email,
                    website: body.website,
                    logo: body.logo,
                    socialMedia: JSON.stringify(body.socialMedia || {}),
                    businessHours: JSON.stringify(body.businessHours || {}),
                    services: JSON.stringify(body.services || {}),
                    updatedBy: session.user.id,
                }
            })
        }

        // Parse JSON fields for response
        const businessInfoWithParsedFields = {
            ...businessInfo,
            socialMedia: businessInfo.socialMedia ? JSON.parse(businessInfo.socialMedia) : {},
            businessHours: businessInfo.businessHours ? JSON.parse(businessInfo.businessHours) : {},
            services: businessInfo.services ? JSON.parse(businessInfo.services) : {},
        }

        return NextResponse.json(businessInfoWithParsedFields, { status: existingBusinessInfo ? 200 : 201 })
    } catch (error) {
        console.error('Error creating/updating business info:', error)
        return NextResponse.json(
            { error: 'Failed to create/update business info' },
            { status: 500 }
        )
    }
}

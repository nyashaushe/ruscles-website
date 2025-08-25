import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/content/testimonials - List all testimonials with filtering
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')
        const isVisible = searchParams.get('isVisible')
        const isFeatured = searchParams.get('isFeatured')
        const projectType = searchParams.get('projectType')
        const sortBy = searchParams.get('sortBy') || 'displayOrder'
        const sortOrder = searchParams.get('sortOrder') || 'asc'
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}

        if (search) {
            where.OR = [
                { customerName: { contains: search, mode: 'insensitive' } },
                { customerCompany: { contains: search, mode: 'insensitive' } },
                { testimonialText: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (isVisible !== null) {
            where.isVisible = isVisible === 'true'
        }

        if (isFeatured !== null) {
            where.isFeatured = isFeatured === 'true'
        }

        if (projectType) {
            where.projectType = projectType
        }

        // Build order by clause
        const orderBy: any = {}
        orderBy[sortBy] = sortOrder

        // Get testimonials
        const testimonials = await prisma.testimonial.findMany({
            where,
            orderBy,
            skip,
            take: limit,
        })

        // Get total count for pagination
        const total = await prisma.testimonial.count({ where })

        return NextResponse.json({
            testimonials,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            }
        })
    } catch (error) {
        console.error('Error fetching testimonials:', error)
        return NextResponse.json(
            { error: 'Failed to fetch testimonials' },
            { status: 500 }
        )
    }
}

// POST /api/content/testimonials - Create a new testimonial
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Validate required fields
        if (!body.customerName || !body.testimonialText) {
            return NextResponse.json(
                { error: 'Missing required fields: customerName, testimonialText' },
                { status: 400 }
            )
        }

        // Get the highest display order
        const maxOrder = await prisma.testimonial.aggregate({
            _max: { displayOrder: true }
        })
        const nextOrder = (maxOrder._max.displayOrder || 0) + 1

        // Create testimonial
        const testimonial = await prisma.testimonial.create({
            data: {
                customerName: body.customerName,
                customerTitle: body.customerTitle,
                customerCompany: body.customerCompany,
                customerPhoto: body.customerPhoto,
                testimonialText: body.testimonialText,
                rating: body.rating,
                projectType: body.projectType,
                isVisible: body.isVisible ?? true,
                isFeatured: body.isFeatured ?? false,
                displayOrder: nextOrder,
            }
        })

        return NextResponse.json(testimonial, { status: 201 })
    } catch (error) {
        console.error('Error creating testimonial:', error)
        return NextResponse.json(
            { error: 'Failed to create testimonial' },
            { status: 500 }
        )
    }
}

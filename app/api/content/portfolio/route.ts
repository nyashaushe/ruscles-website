import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/content/portfolio - List all portfolio items with filtering
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')
        const category = searchParams.get('category')
        const isVisible = searchParams.get('isVisible')
        const isFeatured = searchParams.get('isFeatured')
        const sortBy = searchParams.get('sortBy') || 'displayOrder'
        const sortOrder = searchParams.get('sortOrder') || 'asc'
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { clientName: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (category && category !== 'all') {
            where.serviceCategory = category
        }

        if (isVisible !== null) {
            where.isVisible = isVisible === 'true'
        }

        if (isFeatured !== null) {
            where.isFeatured = isFeatured === 'true'
        }

        // Build order by clause
        const orderBy: any = {}
        orderBy[sortBy] = sortOrder

        // Get portfolio items
        const portfolioItems = await prisma.portfolioItem.findMany({
            where,
            orderBy,
            skip,
            take: limit,
        })

        // Parse JSON fields
        const portfolioItemsWithParsedFields = portfolioItems.map(item => ({
            ...item,
            images: item.images ? JSON.parse(item.images) : [],
            tags: item.tags ? JSON.parse(item.tags) : [],
        }))

        // Get total count for pagination
        const total = await prisma.portfolioItem.count({ where })

        return NextResponse.json({
            portfolioItems: portfolioItemsWithParsedFields,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            }
        })
    } catch (error) {
        console.error('Error fetching portfolio items:', error)
        return NextResponse.json(
            { error: 'Failed to fetch portfolio items' },
            { status: 500 }
        )
    }
}

// POST /api/content/portfolio - Create a new portfolio item
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Validate required fields
        if (!body.title || !body.description || !body.serviceCategory || !body.thumbnailImage) {
            return NextResponse.json(
                { error: 'Missing required fields: title, description, serviceCategory, thumbnailImage' },
                { status: 400 }
            )
        }

        // Get the highest display order
        const maxOrder = await prisma.portfolioItem.aggregate({
            _max: { displayOrder: true }
        })
        const nextOrder = (maxOrder._max.displayOrder || 0) + 1

        // Create portfolio item
        const portfolioItem = await prisma.portfolioItem.create({
            data: {
                title: body.title,
                description: body.description,
                serviceCategory: body.serviceCategory,
                images: JSON.stringify(body.images || []),
                thumbnailImage: body.thumbnailImage,
                completionDate: body.completionDate ? new Date(body.completionDate) : new Date(),
                clientName: body.clientName,
                projectValue: body.projectValue,
                location: body.location,
                tags: JSON.stringify(body.tags || []),
                isVisible: body.isVisible ?? true,
                isFeatured: body.isFeatured ?? false,
                displayOrder: nextOrder,
            }
        })

        // Parse JSON fields for response
        const portfolioItemWithParsedFields = {
            ...portfolioItem,
            images: portfolioItem.images ? JSON.parse(portfolioItem.images) : [],
            tags: portfolioItem.tags ? JSON.parse(portfolioItem.tags) : [],
        }

        return NextResponse.json(portfolioItemWithParsedFields, { status: 201 })
    } catch (error) {
        console.error('Error creating portfolio item:', error)
        return NextResponse.json(
            { error: 'Failed to create portfolio item' },
            { status: 500 }
        )
    }
}

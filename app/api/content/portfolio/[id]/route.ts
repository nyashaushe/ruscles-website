import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/content/portfolio/[id] - Get a specific portfolio item
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const portfolioItem = await prisma.portfolioItem.findUnique({
            where: { id: params.id }
        })

        if (!portfolioItem) {
            return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 })
        }

        // Parse JSON fields
        const portfolioItemWithParsedFields = {
            ...portfolioItem,
            images: portfolioItem.images ? JSON.parse(portfolioItem.images) : [],
            tags: portfolioItem.tags ? JSON.parse(portfolioItem.tags) : [],
        }

        return NextResponse.json(portfolioItemWithParsedFields)
    } catch (error) {
        console.error('Error fetching portfolio item:', error)
        return NextResponse.json(
            { error: 'Failed to fetch portfolio item' },
            { status: 500 }
        )
    }
}

// PUT /api/content/portfolio/[id] - Update a portfolio item
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Check if portfolio item exists
        const existingItem = await prisma.portfolioItem.findUnique({
            where: { id: params.id }
        })

        if (!existingItem) {
            return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 })
        }

        // Update portfolio item
        const portfolioItem = await prisma.portfolioItem.update({
            where: { id: params.id },
            data: {
                title: body.title,
                description: body.description,
                serviceCategory: body.serviceCategory,
                images: JSON.stringify(body.images || []),
                thumbnailImage: body.thumbnailImage,
                completionDate: body.completionDate ? new Date(body.completionDate) : existingItem.completionDate,
                clientName: body.clientName,
                projectValue: body.projectValue,
                location: body.location,
                tags: JSON.stringify(body.tags || []),
                isVisible: body.isVisible,
                isFeatured: body.isFeatured,
                displayOrder: body.displayOrder,
            }
        })

        // Parse JSON fields for response
        const portfolioItemWithParsedFields = {
            ...portfolioItem,
            images: portfolioItem.images ? JSON.parse(portfolioItem.images) : [],
            tags: portfolioItem.tags ? JSON.parse(portfolioItem.tags) : [],
        }

        return NextResponse.json(portfolioItemWithParsedFields)
    } catch (error) {
        console.error('Error updating portfolio item:', error)
        return NextResponse.json(
            { error: 'Failed to update portfolio item' },
            { status: 500 }
        )
    }
}

// DELETE /api/content/portfolio/[id] - Delete a portfolio item
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if portfolio item exists
        const existingItem = await prisma.portfolioItem.findUnique({
            where: { id: params.id }
        })

        if (!existingItem) {
            return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 })
        }

        // Delete portfolio item
        await prisma.portfolioItem.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Portfolio item deleted successfully' })
    } catch (error) {
        console.error('Error deleting portfolio item:', error)
        return NextResponse.json(
            { error: 'Failed to delete portfolio item' },
            { status: 500 }
        )
    }
}

// PATCH /api/content/portfolio/[id] - Partial update for visibility/featured
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Check if portfolio item exists
        const existingItem = await prisma.portfolioItem.findUnique({
            where: { id: params.id }
        })

        if (!existingItem) {
            return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 })
        }

        // Update portfolio item with partial data
        const portfolioItem = await prisma.portfolioItem.update({
            where: { id: params.id },
            data: body
        })

        // Parse JSON fields for response
        const portfolioItemWithParsedFields = {
            ...portfolioItem,
            images: portfolioItem.images ? JSON.parse(portfolioItem.images) : [],
            tags: portfolioItem.tags ? JSON.parse(portfolioItem.tags) : [],
        }

        return NextResponse.json(portfolioItemWithParsedFields)
    } catch (error) {
        console.error('Error updating portfolio item:', error)
        return NextResponse.json(
            { error: 'Failed to update portfolio item' },
            { status: 500 }
        )
    }
}

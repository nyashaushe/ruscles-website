import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/content/testimonials/[id] - Get a specific testimonial
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const testimonial = await prisma.testimonial.findUnique({
            where: { id: params.id }
        })

        if (!testimonial) {
            return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
        }

        return NextResponse.json(testimonial)
    } catch (error) {
        console.error('Error fetching testimonial:', error)
        return NextResponse.json(
            { error: 'Failed to fetch testimonial' },
            { status: 500 }
        )
    }
}

// PUT /api/content/testimonials/[id] - Update a testimonial
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

        // Check if testimonial exists
        const existingTestimonial = await prisma.testimonial.findUnique({
            where: { id: params.id }
        })

        if (!existingTestimonial) {
            return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
        }

        // Update testimonial
        const testimonial = await prisma.testimonial.update({
            where: { id: params.id },
            data: {
                customerName: body.customerName,
                customerTitle: body.customerTitle,
                customerCompany: body.customerCompany,
                customerPhoto: body.customerPhoto,
                testimonialText: body.testimonialText,
                rating: body.rating,
                projectType: body.projectType,
                isVisible: body.isVisible,
                isFeatured: body.isFeatured,
                displayOrder: body.displayOrder,
            }
        })

        return NextResponse.json(testimonial)
    } catch (error) {
        console.error('Error updating testimonial:', error)
        return NextResponse.json(
            { error: 'Failed to update testimonial' },
            { status: 500 }
        )
    }
}

// DELETE /api/content/testimonials/[id] - Delete a testimonial
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if testimonial exists
        const existingTestimonial = await prisma.testimonial.findUnique({
            where: { id: params.id }
        })

        if (!existingTestimonial) {
            return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
        }

        // Delete testimonial
        await prisma.testimonial.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Testimonial deleted successfully' })
    } catch (error) {
        console.error('Error deleting testimonial:', error)
        return NextResponse.json(
            { error: 'Failed to delete testimonial' },
            { status: 500 }
        )
    }
}

// PATCH /api/content/testimonials/[id] - Partial update for visibility/featured
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

        // Check if testimonial exists
        const existingTestimonial = await prisma.testimonial.findUnique({
            where: { id: params.id }
        })

        if (!existingTestimonial) {
            return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
        }

        // Update testimonial with partial data
        const testimonial = await prisma.testimonial.update({
            where: { id: params.id },
            data: body
        })

        return NextResponse.json(testimonial)
    } catch (error) {
        console.error('Error updating testimonial:', error)
        return NextResponse.json(
            { error: 'Failed to update testimonial' },
            { status: 500 }
        )
    }
}

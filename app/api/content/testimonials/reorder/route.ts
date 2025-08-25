import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { testimonials } = body

        if (!Array.isArray(testimonials)) {
            return NextResponse.json(
                { error: 'Invalid testimonials data' },
                { status: 400 }
            )
        }

        // Update display order for each testimonial
        const updatePromises = testimonials.map((item: { id: string; displayOrder: number }) =>
            prisma.testimonial.update({
                where: { id: item.id },
                data: { displayOrder: item.displayOrder }
            })
        )

        await Promise.all(updatePromises)

        return NextResponse.json({ message: 'Testimonials reordered successfully' })
    } catch (error) {
        console.error('Error reordering testimonials:', error)
        return NextResponse.json(
            { error: 'Failed to reorder testimonials' },
            { status: 500 }
        )
    }
}

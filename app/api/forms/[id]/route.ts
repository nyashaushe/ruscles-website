export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.formSubmission.delete({
            where: { id: params.id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting form submission:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete form submission' },
            { status: 500 }
        );
    }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const submission = await prisma.formSubmission.findUnique({
            where: { id: params.id },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                responses: {
                    orderBy: { respondedAt: 'desc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        })

        if (!submission) {
            return NextResponse.json(
                { success: false, error: 'Form submission not found' },
                { status: 404 }
            )
        }

        // Transform the data
        const transformedSubmission = {
            id: submission.id,
            type: submission.type,
            submittedAt: submission.submittedAt.toISOString(),
            status: submission.status,
            priority: submission.priority,
            customerInfo: typeof submission.customerInfo === 'string' ? JSON.parse(submission.customerInfo) : submission.customerInfo,
            formData: typeof submission.formData === 'string' ? JSON.parse(submission.formData) : submission.formData,
            notes: submission.notes,
            lastUpdated: submission.lastUpdated.toISOString(),
            createdAt: submission.createdAt.toISOString(),
            assignedTo: submission.assignedTo?.id,
            assignedToUser: submission.assignedTo,
            tags: submission.tags,
            responses: submission.responses.map(response => ({
                id: response.id,
                formId: response.formId,
                respondedBy: response.respondedBy,
                respondedAt: response.respondedAt.toISOString(),
                method: response.method,
                content: response.content,
                attachments: response.attachments,
                createdAt: response.createdAt.toISOString(),
                user: response.user
            }))
        }

        return NextResponse.json({
            success: true,
            data: transformedSubmission
        })

    } catch (error) {
        console.error('Error fetching form submission:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch form submission' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { status, priority, assignedTo, notes, tags } = body

        const updateData: any = {}
        if (status) updateData.status = status
        if (priority) updateData.priority = priority
        if (assignedTo) updateData.assignedToId = assignedTo
        if (notes !== undefined) updateData.notes = notes
        if (tags) updateData.tags = tags

        const submission = await prisma.formSubmission.update({
            where: { id: params.id },
            data: updateData,
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                responses: {
                    orderBy: { respondedAt: 'desc' },
                    take: 1
                }
            }
        })

        // Transform the data
        const transformedSubmission = {
            id: submission.id,
            type: submission.type,
            submittedAt: submission.submittedAt.toISOString(),
            status: submission.status,
            priority: submission.priority,
            customerInfo: typeof submission.customerInfo === 'string' ? JSON.parse(submission.customerInfo) : submission.customerInfo,
            formData: typeof submission.formData === 'string' ? JSON.parse(submission.formData) : submission.formData,
            notes: submission.notes,
            lastUpdated: submission.lastUpdated.toISOString(),
            createdAt: submission.createdAt.toISOString(),
            assignedTo: submission.assignedTo?.id,
            assignedToUser: submission.assignedTo,
            tags: submission.tags,
            responses: submission.responses.map(response => ({
                id: response.id,
                formId: response.formId,
                respondedBy: response.respondedBy,
                respondedAt: response.respondedAt.toISOString(),
                method: response.method,
                content: response.content,
                attachments: response.attachments,
                createdAt: response.createdAt.toISOString()
            }))
        }

        return NextResponse.json({
            success: true,
            data: transformedSubmission
        })

    } catch (error) {
        console.error('Error updating form submission:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update form submission' },
            { status: 500 }
        )
    }
}

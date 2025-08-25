import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ResponseMethod } from '@prisma/client'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const formData = await request.formData()
        const content = formData.get('content') as string
        const method = formData.get('method') as ResponseMethod
        const scheduleFollowUp = formData.get('scheduleFollowUp') as string
        const attachments = formData.getAll('attachment_0') as File[]

        if (!content || !method) {
            return NextResponse.json(
                { success: false, error: 'Content and method are required' },
                { status: 400 }
            )
        }

        // For now, we'll use a default user ID (you can implement authentication later)
        const defaultUserId = 'cmeop3uel0000yfm0nbnggp0i' // This should come from auth

        // Create the response
        const response = await prisma.formResponse.create({
            data: {
                formId: params.id,
                respondedBy: defaultUserId,
                method,
                content,
                attachments: [], // You can implement file upload later
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        // Update the form status to responded
        await prisma.formSubmission.update({
            where: { id: params.id },
            data: { status: 'RESPONDED' }
        })

        // Transform the response
        const transformedResponse = {
            id: response.id,
            formId: response.formId,
            respondedBy: response.respondedBy,
            respondedAt: response.respondedAt.toISOString(),
            method: response.method,
            content: response.content,
            attachments: response.attachments,
            createdAt: response.createdAt.toISOString(),
            user: response.user
        }

        return NextResponse.json({
            success: true,
            data: transformedResponse
        })

    } catch (error) {
        console.error('Error sending response:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to send response' },
            { status: 500 }
        )
    }
}

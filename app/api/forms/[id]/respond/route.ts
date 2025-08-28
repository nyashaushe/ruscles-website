import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ResponseMethod } from '@prisma/client'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const content = formData.get('content') as string
        const method = (formData.get('method') as ResponseMethod) || 'EMAIL'
        const scheduleFollowUp = formData.get('scheduleFollowUp') as string

        if (!content) {
            return NextResponse.json(
                { success: false, error: 'Content is required' },
                { status: 400 }
            )
        }

        // Check if form exists
        const form = await prisma.formSubmission.findUnique({
            where: { id: params.id }
        })

        if (!form) {
            return NextResponse.json(
                { success: false, error: 'Form not found' },
                { status: 404 }
            )
        }

        // Create the response
        const response = await prisma.formResponse.create({
            data: {
                formId: params.id,
                respondedBy: session.user.email || 'admin',
                method,
                content,
                attachments: '[]', // File upload can be implemented later
            }
        })

        // Update the form status to responded
        await prisma.formSubmission.update({
            where: { id: params.id },
            data: {
                status: 'RESPONDED',
                lastUpdated: new Date()
            }
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
            createdAt: response.createdAt.toISOString()
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

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
        console.log('Respond API called for form ID:', params.id)

        const session = await getServerSession(authOptions)
        console.log('Session:', session ? 'Found' : 'Not found')

        if (!session?.user) {
            console.log('No session or user found')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const content = formData.get('content') as string
        const method = (formData.get('method') as ResponseMethod) || 'EMAIL'
        const scheduleFollowUp = formData.get('scheduleFollowUp') as string

        console.log('Form data received:', { content: content ? 'Present' : 'Missing', method })

        if (!content) {
            console.log('Content is missing')
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
        console.error('Error details:', error instanceof Error ? error.message : String(error))
        return NextResponse.json(
            { success: false, error: `Failed to send response: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        )
    }
}

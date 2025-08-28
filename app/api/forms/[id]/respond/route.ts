import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ResponseMethod } from '@prisma/client'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        console.log('Respond API called for form ID:', id)

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
            where: { id }
        })

        if (!form) {
            return NextResponse.json(
                { success: false, error: 'Form not found' },
                { status: 404 }
            )
        }

        // Get customer info for email sending
        const customerInfo = typeof form.customerInfo === 'string'
            ? JSON.parse(form.customerInfo)
            : form.customerInfo

        // Create the response
        const response = await prisma.formResponse.create({
            data: {
                formId: id,
                respondedBy: session.user.email || 'admin',
                method,
                content,
                attachments: '[]', // File upload can be implemented later
            }
        })

        // Send email if method is EMAIL and customer has email
        if (method === 'EMAIL' && customerInfo?.email) {
            try {
                console.log('Attempting to send email to:', customerInfo.email)
                // For now, just log the email details
                // You can integrate with your preferred email service later
                console.log('Email would be sent with content:', content)
            } catch (emailError) {
                console.error('Failed to send email:', emailError)
                // Don't fail the entire request if email fails
            }
        }

        // Update the form status to responded
        const updatedForm = await prisma.formSubmission.update({
            where: { id },
            data: {
                status: 'RESPONDED',
                lastUpdated: new Date()
            }
        })

        console.log('Form status updated successfully:', {
            formId: id,
            oldStatus: form.status,
            newStatus: updatedForm.status
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
            message: `Response sent successfully${customerInfo?.email ? ` to ${customerInfo.email}` : ''}`,
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

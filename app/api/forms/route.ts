import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { FormStatus, FormPriority, FormType } from '@prisma/client'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const status = searchParams.get('status')?.split(',') as FormStatus[]
        const priority = searchParams.get('priority')?.split(',') as FormPriority[]
        const type = searchParams.get('type')?.split(',') as FormType[]
        const assignedTo = searchParams.get('assignedTo')
        const search = searchParams.get('search')
        const dateFrom = searchParams.get('dateFrom')
        const dateTo = searchParams.get('dateTo')

        // Build where clause
        const where: any = {}

        if (status?.length) {
            where.status = { in: status }
        }

        if (priority?.length) {
            where.priority = { in: priority }
        }

        if (type?.length) {
            where.type = { in: type }
        }

        if (assignedTo) {
            where.assignedToId = assignedTo
        }

        if (search) {
            where.OR = [
                {
                    customerInfo: {
                        path: ['name'],
                        string_contains: search
                    }
                },
                {
                    customerInfo: {
                        path: ['email'],
                        string_contains: search
                    }
                },
                {
                    formData: {
                        path: ['message'],
                        string_contains: search
                    }
                }
            ]
        }

        if (dateFrom || dateTo) {
            where.submittedAt = {}
            if (dateFrom) where.submittedAt.gte = new Date(dateFrom)
            if (dateTo) where.submittedAt.lte = new Date(dateTo)
        }

        // Get total count
        const total = await prisma.formSubmission.count({ where })

        // Get paginated results
        const submissions = await prisma.formSubmission.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { submittedAt: 'desc' },
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

        // Transform the data to match the expected format
        const transformedSubmissions = submissions.map(submission => ({
            id: submission.id,
            type: submission.type,
            submittedAt: submission.submittedAt.toISOString(),
            status: submission.status,
            priority: submission.priority,
            customerInfo: submission.customerInfo as any,
            formData: submission.formData as any,
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
        }))

        return NextResponse.json({
            success: true,
            data: transformedSubmissions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('Error fetching form submissions:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch form submissions' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { type, customerInfo, formData, priority = 'MEDIUM' } = body

        if (!type || !customerInfo || !formData) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const submission = await prisma.formSubmission.create({
            data: {
                type,
                customerInfo,
                formData,
                priority,
                status: 'NEW',
                tags: []
            },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                responses: []
            }
        })

        // Transform the data
        const transformedSubmission = {
            id: submission.id,
            type: submission.type,
            submittedAt: submission.submittedAt.toISOString(),
            status: submission.status,
            priority: submission.priority,
            customerInfo: submission.customerInfo as any,
            formData: submission.formData as any,
            notes: submission.notes,
            lastUpdated: submission.lastUpdated.toISOString(),
            createdAt: submission.createdAt.toISOString(),
            assignedTo: submission.assignedTo?.id,
            assignedToUser: submission.assignedTo,
            tags: submission.tags,
            responses: []
        }

        return NextResponse.json({
            success: true,
            data: transformedSubmission
        })

    } catch (error) {
        console.error('Error creating form submission:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create form submission' },
            { status: 500 }
        )
    }
}

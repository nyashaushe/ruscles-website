import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/projects - List all projects with filtering
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')
        const status = searchParams.get('status')
        const type = searchParams.get('type')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { customerName: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (status && status !== 'all') {
            where.status = status
        }

        if (type && type !== 'all') {
            where.projectType = type
        }

        // Get projects with manager info
        const projects = await prisma.project.findMany({
            where,
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        })

        // Parse JSON fields
        const projectsWithParsedFields = projects.map(project => ({
            ...project,
            attachments: project.attachments ? JSON.parse(project.attachments) : [],
            tags: project.tags ? JSON.parse(project.tags) : [],
        }))

        // Get total count for pagination
        const total = await prisma.project.count({ where })

        return NextResponse.json({
            projects: projectsWithParsedFields,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            }
        })
    } catch (error) {
        console.error('Error fetching projects:', error)
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        )
    }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Validate required fields
        if (!body.title || !body.customerName || !body.projectType) {
            return NextResponse.json(
                { error: 'Missing required fields: title, customerName, projectType' },
                { status: 400 }
            )
        }

        // Create project
        const project = await prisma.project.create({
            data: {
                title: body.title,
                description: body.description,
                customerName: body.customerName,
                customerEmail: body.customerEmail,
                customerPhone: body.customerPhone,
                projectType: body.projectType,
                status: body.status || 'PLANNING',
                priority: body.priority || 'MEDIUM',
                location: body.location,
                startDate: body.startDate ? new Date(body.startDate) : null,
                endDate: body.endDate ? new Date(body.endDate) : null,
                estimatedHours: body.estimatedHours,
                budget: body.budget,
                progress: body.progress || 0,
                notes: body.notes,
                attachments: JSON.stringify(body.attachments || []),
                tags: JSON.stringify(body.tags || []),
                managerId: session.user.id,
            },
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        })

        // Parse JSON fields for response
        const projectWithParsedFields = {
            ...project,
            attachments: project.attachments ? JSON.parse(project.attachments) : [],
            tags: project.tags ? JSON.parse(project.tags) : [],
        }

        return NextResponse.json(projectWithParsedFields, { status: 201 })
    } catch (error) {
        console.error('Error creating project:', error)
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        )
    }
}

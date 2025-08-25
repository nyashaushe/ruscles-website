import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/projects/[id] - Get a specific project
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const project = await prisma.project.findUnique({
            where: { id: params.id },
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

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        // Parse JSON fields
        const projectWithParsedFields = {
            ...project,
            attachments: project.attachments ? JSON.parse(project.attachments) : [],
            tags: project.tags ? JSON.parse(project.tags) : [],
        }

        return NextResponse.json(projectWithParsedFields)
    } catch (error) {
        console.error('Error fetching project:', error)
        return NextResponse.json(
            { error: 'Failed to fetch project' },
            { status: 500 }
        )
    }
}

// PUT /api/projects/[id] - Update a project
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

        // Check if project exists
        const existingProject = await prisma.project.findUnique({
            where: { id: params.id }
        })

        if (!existingProject) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        // Update project
        const project = await prisma.project.update({
            where: { id: params.id },
            data: {
                title: body.title,
                description: body.description,
                customerName: body.customerName,
                customerEmail: body.customerEmail,
                customerPhone: body.customerPhone,
                projectType: body.projectType,
                status: body.status,
                priority: body.priority,
                location: body.location,
                startDate: body.startDate ? new Date(body.startDate) : null,
                endDate: body.endDate ? new Date(body.endDate) : null,
                estimatedHours: body.estimatedHours,
                actualHours: body.actualHours,
                budget: body.budget,
                actualCost: body.actualCost,
                progress: body.progress,
                notes: body.notes,
                attachments: JSON.stringify(body.attachments || []),
                tags: JSON.stringify(body.tags || []),
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

        return NextResponse.json(projectWithParsedFields)
    } catch (error) {
        console.error('Error updating project:', error)
        return NextResponse.json(
            { error: 'Failed to update project' },
            { status: 500 }
        )
    }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if project exists
        const existingProject = await prisma.project.findUnique({
            where: { id: params.id }
        })

        if (!existingProject) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        // Delete project
        await prisma.project.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Project deleted successfully' })
    } catch (error) {
        console.error('Error deleting project:', error)
        return NextResponse.json(
            { error: 'Failed to delete project' },
            { status: 500 }
        )
    }
}

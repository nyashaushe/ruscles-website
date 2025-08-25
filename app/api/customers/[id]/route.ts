import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/customers/[id] - Get a specific customer
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const customer = await prisma.user.findUnique({
            where: {
                id: params.id,
                role: 'USER' // Only get customers
            },
            include: {
                managedProjects: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        projectType: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5, // Limit to recent projects
                },
                assignedForms: {
                    select: {
                        id: true,
                        type: true,
                        status: true,
                        submittedAt: true,
                    },
                    orderBy: { submittedAt: 'desc' },
                    take: 5, // Limit to recent forms
                },
                _count: {
                    select: {
                        managedProjects: true,
                        assignedForms: true,
                    }
                }
            }
        })

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }

        return NextResponse.json(customer)
    } catch (error) {
        console.error('Error fetching customer:', error)
        return NextResponse.json(
            { error: 'Failed to fetch customer' },
            { status: 500 }
        )
    }
}

// PUT /api/customers/[id] - Update a customer
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

        // Check if customer exists
        const existingCustomer = await prisma.user.findUnique({
            where: {
                id: params.id,
                role: 'USER'
            }
        })

        if (!existingCustomer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }

        // Check if email is being changed and if it already exists
        if (body.email && body.email !== existingCustomer.email) {
            const emailExists = await prisma.user.findUnique({
                where: { email: body.email }
            })

            if (emailExists) {
                return NextResponse.json(
                    { error: 'Email already exists' },
                    { status: 400 }
                )
            }
        }

        // Update customer
        const customer = await prisma.user.update({
            where: { id: params.id },
            data: {
                name: body.name,
                email: body.email,
                phone: body.phone,
                isActive: body.isActive,
            },
            include: {
                _count: {
                    select: {
                        managedProjects: true,
                        assignedForms: true,
                    }
                }
            }
        })

        return NextResponse.json(customer)
    } catch (error) {
        console.error('Error updating customer:', error)
        return NextResponse.json(
            { error: 'Failed to update customer' },
            { status: 500 }
        )
    }
}

// DELETE /api/customers/[id] - Delete a customer
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if customer exists
        const existingCustomer = await prisma.user.findUnique({
            where: {
                id: params.id,
                role: 'USER'
            }
        })

        if (!existingCustomer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }

        // Check if customer has associated projects or forms
        const hasProjects = await prisma.project.count({
            where: { managerId: params.id }
        })

        const hasForms = await prisma.formSubmission.count({
            where: { assignedToId: params.id }
        })

        if (hasProjects > 0 || hasForms > 0) {
            return NextResponse.json(
                { error: 'Cannot delete customer with associated projects or forms. Consider deactivating instead.' },
                { status: 400 }
            )
        }

        // Delete customer
        await prisma.user.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Customer deleted successfully' })
    } catch (error) {
        console.error('Error deleting customer:', error)
        return NextResponse.json(
            { error: 'Failed to delete customer' },
            { status: 500 }
        )
    }
}

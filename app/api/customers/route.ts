import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/customers - List all customers with filtering
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } },
            ]
        }

        // Get customers with their projects and forms
        const customers = await prisma.user.findMany({
            where: {
                ...where,
                role: 'USER', // Only get customers, not admins
            },
            include: {
                _count: {
                    select: {
                        managedProjects: true,
                        assignedForms: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        })

        // Get total count for pagination
        const total = await prisma.user.count({
            where: {
                ...where,
                role: 'USER',
            }
        })

        return NextResponse.json({
            customers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            }
        })
    } catch (error) {
        console.error('Error fetching customers:', error)
        return NextResponse.json(
            { error: 'Failed to fetch customers' },
            { status: 500 }
        )
    }
}

// POST /api/customers - Create a new customer
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Validate required fields
        if (!body.name || !body.email) {
            return NextResponse.json(
                { error: 'Missing required fields: name, email' },
                { status: 400 }
            )
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: body.email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Customer with this email already exists' },
                { status: 400 }
            )
        }

        // Create customer
        const customer = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                phone: body.phone,
                role: 'USER',
                isActive: true,
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

        return NextResponse.json(customer, { status: 201 })
    } catch (error) {
        console.error('Error creating customer:', error)
        return NextResponse.json(
            { error: 'Failed to create customer' },
            { status: 500 }
        )
    }
}

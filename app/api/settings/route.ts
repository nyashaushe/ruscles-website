import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/settings - List all settings
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const key = searchParams.get('key')
        const isPublic = searchParams.get('isPublic')

        // Build where clause
        const where: any = {}

        if (key) {
            where.key = key
        }

        if (isPublic !== null) {
            where.isPublic = isPublic === 'true'
        }

        // Get settings
        const settings = await prisma.settings.findMany({
            where,
            orderBy: { key: 'asc' },
        })

        return NextResponse.json({ settings })
    } catch (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}

// POST /api/settings - Create or update a setting
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Validate required fields
        if (!body.key || !body.value) {
            return NextResponse.json(
                { error: 'Missing required fields: key, value' },
                { status: 400 }
            )
        }

        // Check if setting already exists
        const existingSetting = await prisma.settings.findUnique({
            where: { key: body.key }
        })

        let setting
        if (existingSetting) {
            // Update existing setting
            setting = await prisma.settings.update({
                where: { key: body.key },
                data: {
                    value: body.value,
                    description: body.description,
                    isPublic: body.isPublic ?? existingSetting.isPublic,
                    updatedBy: session.user.id,
                }
            })
        } else {
            // Create new setting
            setting = await prisma.settings.create({
                data: {
                    key: body.key,
                    value: body.value,
                    description: body.description,
                    isPublic: body.isPublic ?? false,
                    updatedBy: session.user.id,
                }
            })
        }

        return NextResponse.json(setting, { status: existingSetting ? 200 : 201 })
    } catch (error) {
        console.error('Error creating/updating setting:', error)
        return NextResponse.json(
            { error: 'Failed to create/update setting' },
            { status: 500 }
        )
    }
}

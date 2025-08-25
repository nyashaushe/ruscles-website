import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/content/blog - List all blog posts with filtering
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')
        const status = searchParams.get('status')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (status && status !== 'all') {
            where.status = status
        }

        // Get blog posts with author info
        const blogPosts = await prisma.contentItem.findMany({
            where: {
                ...where,
                type: 'BLOG_POST',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                blogPost: {
                    select: {
                        readingTime: true,
                        viewCount: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        })

        // Parse JSON fields
        const blogPostsWithParsedFields = blogPosts.map(post => ({
            ...post,
            tags: post.tags ? JSON.parse(post.tags) : [],
            categories: post.categories ? JSON.parse(post.categories) : [],
        }))

        // Get total count for pagination
        const total = await prisma.contentItem.count({
            where: {
                ...where,
                type: 'BLOG_POST',
            }
        })

        return NextResponse.json({
            blogPosts: blogPostsWithParsedFields,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            }
        })
    } catch (error) {
        console.error('Error fetching blog posts:', error)
        return NextResponse.json(
            { error: 'Failed to fetch blog posts' },
            { status: 500 }
        )
    }
}

// POST /api/content/blog - Create a new blog post
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Validate required fields
        if (!body.title || !body.content) {
            return NextResponse.json(
                { error: 'Missing required fields: title, content' },
                { status: 400 }
            )
        }

        // Generate slug from title
        const slug = body.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')

        // Check if slug already exists
        const existingPost = await prisma.contentItem.findUnique({
            where: { slug }
        })

        if (existingPost) {
            return NextResponse.json(
                { error: 'A blog post with this title already exists' },
                { status: 400 }
            )
        }

        // Create blog post
        const blogPost = await prisma.contentItem.create({
            data: {
                type: 'BLOG_POST',
                title: body.title,
                slug,
                content: body.content,
                excerpt: body.excerpt,
                status: body.status || 'DRAFT',
                publishedAt: body.status === 'PUBLISHED' ? new Date() : null,
                scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
                author: session.user.id,
                tags: JSON.stringify(body.tags || []),
                categories: JSON.stringify(body.categories || []),
                featuredImage: body.featuredImage,
                seoTitle: body.seoTitle,
                seoDescription: body.seoDescription,
                blogPost: {
                    create: {
                        readingTime: body.readingTime,
                        viewCount: 0,
                    }
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                blogPost: {
                    select: {
                        readingTime: true,
                        viewCount: true,
                    }
                }
            }
        })

        // Parse JSON fields for response
        const blogPostWithParsedFields = {
            ...blogPost,
            tags: blogPost.tags ? JSON.parse(blogPost.tags) : [],
            categories: blogPost.categories ? JSON.parse(blogPost.categories) : [],
        }

        return NextResponse.json(blogPostWithParsedFields, { status: 201 })
    } catch (error) {
        console.error('Error creating blog post:', error)
        return NextResponse.json(
            { error: 'Failed to create blog post' },
            { status: 500 }
        )
    }
}

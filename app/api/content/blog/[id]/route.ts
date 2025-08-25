import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/content/blog/[id] - Get a specific blog post
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const blogPost = await prisma.contentItem.findUnique({
            where: {
                id: params.id,
                type: 'BLOG_POST'
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

        if (!blogPost) {
            return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
        }

        // Parse JSON fields
        const blogPostWithParsedFields = {
            ...blogPost,
            tags: blogPost.tags ? JSON.parse(blogPost.tags) : [],
            categories: blogPost.categories ? JSON.parse(blogPost.categories) : [],
        }

        return NextResponse.json(blogPostWithParsedFields)
    } catch (error) {
        console.error('Error fetching blog post:', error)
        return NextResponse.json(
            { error: 'Failed to fetch blog post' },
            { status: 500 }
        )
    }
}

// PUT /api/content/blog/[id] - Update a blog post
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

        // Check if blog post exists
        const existingPost = await prisma.contentItem.findUnique({
            where: {
                id: params.id,
                type: 'BLOG_POST'
            }
        })

        if (!existingPost) {
            return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
        }

        // Generate new slug if title changed
        let slug = existingPost.slug
        if (body.title && body.title !== existingPost.title) {
            slug = body.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')

            // Check if new slug already exists
            const slugExists = await prisma.contentItem.findFirst({
                where: {
                    slug,
                    id: { not: params.id }
                }
            })

            if (slugExists) {
                return NextResponse.json(
                    { error: 'A blog post with this title already exists' },
                    { status: 400 }
                )
            }
        }

        // Update blog post
        const blogPost = await prisma.contentItem.update({
            where: { id: params.id },
            data: {
                title: body.title,
                slug,
                content: body.content,
                excerpt: body.excerpt,
                status: body.status,
                publishedAt: body.status === 'PUBLISHED' && !existingPost.publishedAt ? new Date() : existingPost.publishedAt,
                scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
                tags: JSON.stringify(body.tags || []),
                categories: JSON.stringify(body.categories || []),
                featuredImage: body.featuredImage,
                seoTitle: body.seoTitle,
                seoDescription: body.seoDescription,
                blogPost: {
                    update: {
                        readingTime: body.readingTime,
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

        return NextResponse.json(blogPostWithParsedFields)
    } catch (error) {
        console.error('Error updating blog post:', error)
        return NextResponse.json(
            { error: 'Failed to update blog post' },
            { status: 500 }
        )
    }
}

// DELETE /api/content/blog/[id] - Delete a blog post
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if blog post exists
        const existingPost = await prisma.contentItem.findUnique({
            where: {
                id: params.id,
                type: 'BLOG_POST'
            }
        })

        if (!existingPost) {
            return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
        }

        // Delete blog post (this will also delete the related blogPost record due to cascade)
        await prisma.contentItem.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Blog post deleted successfully' })
    } catch (error) {
        console.error('Error deleting blog post:', error)
        return NextResponse.json(
            { error: 'Failed to delete blog post' },
            { status: 500 }
        )
    }
}

import { useState, useEffect, useCallback } from 'react'

export interface Testimonial {
    id: string
    customerName: string
    customerTitle?: string
    customerCompany?: string
    customerPhoto?: string
    testimonialText: string
    rating?: number
    projectType?: string
    isVisible: boolean
    isFeatured: boolean
    displayOrder: number
    createdAt: string
    updatedAt: string
}

export interface TestimonialFilters {
    search?: string
    isVisible?: boolean
    isFeatured?: boolean
    projectType?: string
    page?: number
    limit?: number
}

export interface TestimonialStats {
    total: number
    visible: number
    hidden: number
    featured: number
    newThisMonth: number
    newThisYear: number
    averageRating: number
    projectTypeDistribution: Array<{
        projectType: string
        count: number
    }>
}

export interface TestimonialsResponse {
    testimonials: Testimonial[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

export function useTestimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    })
    const [stats, setStats] = useState<TestimonialStats>({
        total: 0,
        visible: 0,
        hidden: 0,
        featured: 0,
        newThisMonth: 0,
        newThisYear: 0,
        averageRating: 0,
        projectTypeDistribution: [],
    })

    // Fetch testimonials with filters
    const fetchTestimonials = useCallback(async (filters: TestimonialFilters = {}) => {
        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams()
            if (filters.search) params.append('search', filters.search)
            if (filters.isVisible !== undefined) params.append('isVisible', filters.isVisible.toString())
            if (filters.isFeatured !== undefined) params.append('isFeatured', filters.isFeatured.toString())
            if (filters.projectType) params.append('projectType', filters.projectType)
            if (filters.page) params.append('page', filters.page.toString())
            if (filters.limit) params.append('limit', filters.limit.toString())

            const response = await fetch(`/api/content/testimonials?${params.toString()}`)

            if (!response.ok) {
                throw new Error('Failed to fetch testimonials')
            }

            const data: TestimonialsResponse = await response.json()
            setTestimonials(data.testimonials)
            setPagination(data.pagination)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }, [])

    // Fetch testimonial stats
    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch('/api/content/testimonials/stats')
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (err) {
            console.error('Failed to fetch testimonial stats:', err)
        }
    }, [])

    // Create a new testimonial
    const createTestimonial = useCallback(async (testimonialData: Partial<Testimonial>) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/content/testimonials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testimonialData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create testimonial')
            }

            const newTestimonial = await response.json()
            setTestimonials(prev => [newTestimonial, ...prev])
            return newTestimonial
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create testimonial')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Update a testimonial
    const updateTestimonial = useCallback(async (id: string, testimonialData: Partial<Testimonial>) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/content/testimonials/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testimonialData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update testimonial')
            }

            const updatedTestimonial = await response.json()
            setTestimonials(prev => prev.map(t => t.id === id ? updatedTestimonial : t))
            return updatedTestimonial
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update testimonial')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Delete a testimonial
    const deleteTestimonial = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/content/testimonials/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete testimonial')
            }

            setTestimonials(prev => prev.filter(t => t.id !== id))
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete testimonial')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Get a single testimonial
    const getTestimonial = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/content/testimonials/${id}`)

            if (!response.ok) {
                throw new Error('Failed to fetch testimonial')
            }

            const testimonial = await response.json()
            return testimonial
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch testimonial')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Toggle visibility
    const toggleVisibility = useCallback(async (id: string, isVisible: boolean) => {
        try {
            const response = await fetch(`/api/content/testimonials/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isVisible }),
            })

            if (!response.ok) {
                throw new Error('Failed to toggle visibility')
            }

            const updatedTestimonial = await response.json()
            setTestimonials(prev => prev.map(t => t.id === id ? updatedTestimonial : t))
            return updatedTestimonial
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle visibility')
            throw err
        }
    }, [])

    // Toggle featured
    const toggleFeatured = useCallback(async (id: string, isFeatured: boolean) => {
        try {
            const response = await fetch(`/api/content/testimonials/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isFeatured }),
            })

            if (!response.ok) {
                throw new Error('Failed to toggle featured')
            }

            const updatedTestimonial = await response.json()
            setTestimonials(prev => prev.map(t => t.id === id ? updatedTestimonial : t))
            return updatedTestimonial
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle featured')
            throw err
        }
    }, [])

    // Reorder testimonials
    const reorderTestimonials = useCallback(async (reorderData: Array<{ id: string; displayOrder: number }>) => {
        try {
            const response = await fetch('/api/content/testimonials/reorder', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ testimonials: reorderData }),
            })

            if (!response.ok) {
                throw new Error('Failed to reorder testimonials')
            }

            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reorder testimonials')
            throw err
        }
    }, [])

    // Refresh testimonials
    const refresh = useCallback(() => {
        fetchTestimonials()
        fetchStats()
    }, [fetchTestimonials, fetchStats])

    // Initial load
    useEffect(() => {
        fetchTestimonials()
        fetchStats()
    }, [fetchTestimonials, fetchStats])

    return {
        testimonials,
        loading,
        error,
        pagination,
        stats,
        fetchTestimonials,
        fetchStats,
        createTestimonial,
        updateTestimonial,
        deleteTestimonial,
        getTestimonial,
        toggleVisibility,
        toggleFeatured,
        reorderTestimonials,
        refresh,
    }
}

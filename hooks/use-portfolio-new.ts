import { useState, useEffect, useCallback } from 'react'

export interface PortfolioItem {
    id: string
    title: string
    description: string
    serviceCategory: 'ELECTRICAL' | 'HVAC' | 'REFRIGERATION'
    images: string[]
    thumbnailImage: string
    completionDate: string
    clientName?: string
    projectValue?: number
    location?: string
    tags: string[]
    isVisible: boolean
    isFeatured: boolean
    displayOrder: number
    createdAt: string
    updatedAt: string
}

export interface PortfolioFilters {
    search?: string
    category?: string
    isVisible?: boolean
    isFeatured?: boolean
    page?: number
    limit?: number
}

export interface PortfolioStats {
    total: number
    visible: number
    hidden: number
    featured: number
    newThisMonth: number
    newThisYear: number
    totalValue: number
    categoryDistribution: Array<{
        category: string
        count: number
    }>
}

export interface PortfolioResponse {
    portfolioItems: PortfolioItem[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

export function usePortfolio() {
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    })
    const [stats, setStats] = useState<PortfolioStats>({
        total: 0,
        visible: 0,
        hidden: 0,
        featured: 0,
        newThisMonth: 0,
        newThisYear: 0,
        totalValue: 0,
        categoryDistribution: [],
    })

    // Fetch portfolio items with filters
    const fetchPortfolioItems = useCallback(async (filters: PortfolioFilters = {}) => {
        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams()
            if (filters.search) params.append('search', filters.search)
            if (filters.category && filters.category !== 'all') params.append('category', filters.category)
            if (filters.isVisible !== undefined) params.append('isVisible', filters.isVisible.toString())
            if (filters.isFeatured !== undefined) params.append('isFeatured', filters.isFeatured.toString())
            if (filters.page) params.append('page', filters.page.toString())
            if (filters.limit) params.append('limit', filters.limit.toString())

            const response = await fetch(`/api/content/portfolio?${params.toString()}`)

            if (!response.ok) {
                throw new Error('Failed to fetch portfolio items')
            }

            const data: PortfolioResponse = await response.json()
            setPortfolioItems(data.portfolioItems)
            setPagination(data.pagination)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }, [])

    // Fetch portfolio stats
    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch('/api/content/portfolio/stats')
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (err) {
            console.error('Failed to fetch portfolio stats:', err)
        }
    }, [])

    // Create a new portfolio item
    const createPortfolioItem = useCallback(async (portfolioData: Partial<PortfolioItem>) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/content/portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(portfolioData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create portfolio item')
            }

            const newPortfolioItem = await response.json()
            setPortfolioItems(prev => [newPortfolioItem, ...prev])
            return newPortfolioItem
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create portfolio item')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Update a portfolio item
    const updatePortfolioItem = useCallback(async (id: string, portfolioData: Partial<PortfolioItem>) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/content/portfolio/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(portfolioData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update portfolio item')
            }

            const updatedPortfolioItem = await response.json()
            setPortfolioItems(prev => prev.map(item => item.id === id ? updatedPortfolioItem : item))
            return updatedPortfolioItem
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update portfolio item')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Delete a portfolio item
    const deletePortfolioItem = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/content/portfolio/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete portfolio item')
            }

            setPortfolioItems(prev => prev.filter(item => item.id !== id))
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete portfolio item')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Get a single portfolio item
    const getPortfolioItem = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/content/portfolio/${id}`)

            if (!response.ok) {
                throw new Error('Failed to fetch portfolio item')
            }

            const portfolioItem = await response.json()
            return portfolioItem
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch portfolio item')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Toggle visibility
    const toggleVisibility = useCallback(async (id: string, isVisible: boolean) => {
        try {
            const response = await fetch(`/api/content/portfolio/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isVisible }),
            })

            if (!response.ok) {
                throw new Error('Failed to toggle visibility')
            }

            const updatedPortfolioItem = await response.json()
            setPortfolioItems(prev => prev.map(item => item.id === id ? updatedPortfolioItem : item))
            return updatedPortfolioItem
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle visibility')
            throw err
        }
    }, [])

    // Toggle featured
    const toggleFeatured = useCallback(async (id: string, isFeatured: boolean) => {
        try {
            const response = await fetch(`/api/content/portfolio/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isFeatured }),
            })

            if (!response.ok) {
                throw new Error('Failed to toggle featured')
            }

            const updatedPortfolioItem = await response.json()
            setPortfolioItems(prev => prev.map(item => item.id === id ? updatedPortfolioItem : item))
            return updatedPortfolioItem
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle featured')
            throw err
        }
    }, [])

    // Refresh portfolio items
    const refresh = useCallback(() => {
        fetchPortfolioItems()
        fetchStats()
    }, [fetchPortfolioItems, fetchStats])

    // Initial load
    useEffect(() => {
        fetchPortfolioItems()
        fetchStats()
    }, [fetchPortfolioItems, fetchStats])

    return {
        portfolioItems,
        loading,
        error,
        pagination,
        stats,
        fetchPortfolioItems,
        fetchStats,
        createPortfolioItem,
        updatePortfolioItem,
        deletePortfolioItem,
        getPortfolioItem,
        toggleVisibility,
        toggleFeatured,
        refresh,
    }
}

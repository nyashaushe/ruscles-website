import { useState, useEffect, useCallback } from 'react'

export interface Customer {
    id: string
    name: string
    email: string
    phone?: string
    role: 'USER'
    isActive: boolean
    createdAt: string
    updatedAt: string
    _count: {
        managedProjects: number
        assignedForms: number
    }
    managedProjects?: Array<{
        id: string
        title: string
        status: string
        projectType: string
        createdAt: string
    }>
    assignedForms?: Array<{
        id: string
        type: string
        status: string
        submittedAt: string
    }>
}

export interface CustomerFilters {
    search?: string
    isActive?: boolean
    page?: number
    limit?: number
}

export interface CustomerStats {
    total: number
    active: number
    inactive: number
    newThisMonth: number
    newThisYear: number
}

export interface CustomersResponse {
    customers: Customer[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

export function useCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    })
    const [stats, setStats] = useState<CustomerStats>({
        total: 0,
        active: 0,
        inactive: 0,
        newThisMonth: 0,
        newThisYear: 0,
    })

    // Fetch customers with filters
    const fetchCustomers = useCallback(async (filters: CustomerFilters = {}) => {
        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams()
            if (filters.search) params.append('search', filters.search)
            if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString())
            if (filters.page) params.append('page', filters.page.toString())
            if (filters.limit) params.append('limit', filters.limit.toString())

            const response = await fetch(`/api/customers?${params.toString()}`)

            if (!response.ok) {
                throw new Error('Failed to fetch customers')
            }

            const data: CustomersResponse = await response.json()
            setCustomers(data.customers)
            setPagination(data.pagination)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }, [])

    // Fetch customer stats
    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch('/api/customers/stats')
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (err) {
            console.error('Failed to fetch customer stats:', err)
        }
    }, [])

    // Create a new customer
    const createCustomer = useCallback(async (customerData: Partial<Customer>) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customerData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create customer')
            }

            const newCustomer = await response.json()
            setCustomers(prev => [newCustomer, ...prev])
            return newCustomer
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create customer')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Update a customer
    const updateCustomer = useCallback(async (id: string, customerData: Partial<Customer>) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/customers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customerData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update customer')
            }

            const updatedCustomer = await response.json()
            setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c))
            return updatedCustomer
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update customer')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Delete a customer
    const deleteCustomer = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/customers/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete customer')
            }

            setCustomers(prev => prev.filter(c => c.id !== id))
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete customer')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Get a single customer
    const getCustomer = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/customers/${id}`)

            if (!response.ok) {
                throw new Error('Failed to fetch customer')
            }

            const customer = await response.json()
            return customer
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch customer')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Refresh customers
    const refresh = useCallback(() => {
        fetchCustomers()
        fetchStats()
    }, [fetchCustomers, fetchStats])

    // Initial load
    useEffect(() => {
        fetchCustomers()
        fetchStats()
    }, [fetchCustomers, fetchStats])

    return {
        customers,
        loading,
        error,
        pagination,
        stats,
        fetchCustomers,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomer,
        refresh,
    }
}

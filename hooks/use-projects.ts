import { useState, useEffect, useCallback } from 'react'

export interface Project {
    id: string
    title: string
    description?: string
    customerName: string
    customerEmail?: string
    customerPhone?: string
    projectType: 'ELECTRICAL' | 'HVAC' | 'REFRIGERATION' | 'MAINTENANCE' | 'INSTALLATION' | 'REPAIR' | 'UPGRADE'
    status: 'PLANNING' | 'IN_PROGRESS' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    location?: string
    startDate?: string
    endDate?: string
    estimatedHours?: number
    actualHours?: number
    budget?: number
    actualCost?: number
    progress: number
    notes?: string
    attachments: string[]
    tags: string[]
    createdAt: string
    updatedAt: string
    manager: {
        id: string
        name?: string
        email?: string
    }
}

export interface ProjectFilters {
    search?: string
    status?: string
    type?: string
    page?: number
    limit?: number
}

export interface ProjectStats {
    total: number
    active: number
    completed: number
    planning: number
    inProgress: number
    onHold: number
}

export interface ProjectsResponse {
    projects: Project[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    })
    const [stats, setStats] = useState<ProjectStats>({
        total: 0,
        active: 0,
        completed: 0,
        planning: 0,
        inProgress: 0,
        onHold: 0,
    })

    // Fetch projects with filters
    const fetchProjects = useCallback(async (filters: ProjectFilters = {}) => {
        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams()
            if (filters.search) params.append('search', filters.search)
            if (filters.status && filters.status !== 'all') params.append('status', filters.status)
            if (filters.type && filters.type !== 'all') params.append('type', filters.type)
            if (filters.page) params.append('page', filters.page.toString())
            if (filters.limit) params.append('limit', filters.limit.toString())

            const response = await fetch(`/api/projects?${params.toString()}`)

            if (!response.ok) {
                throw new Error('Failed to fetch projects')
            }

            const data: ProjectsResponse = await response.json()
            setProjects(data.projects)
            setPagination(data.pagination)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }, [])

    // Fetch project stats
    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch('/api/projects/stats')
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (err) {
            console.error('Failed to fetch project stats:', err)
        }
    }, [])

    // Create a new project
    const createProject = useCallback(async (projectData: Partial<Project>) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create project')
            }

            const newProject = await response.json()
            setProjects(prev => [newProject, ...prev])
            return newProject
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create project')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Update a project
    const updateProject = useCallback(async (id: string, projectData: Partial<Project>) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update project')
            }

            const updatedProject = await response.json()
            setProjects(prev => prev.map(p => p.id === id ? updatedProject : p))
            return updatedProject
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update project')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Delete a project
    const deleteProject = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete project')
            }

            setProjects(prev => prev.filter(p => p.id !== id))
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete project')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Get a single project
    const getProject = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/projects/${id}`)

            if (!response.ok) {
                throw new Error('Failed to fetch project')
            }

            const project = await response.json()
            return project
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch project')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Refresh projects
    const refresh = useCallback(() => {
        fetchProjects()
        fetchStats()
    }, [fetchProjects, fetchStats])

    // Initial load
    useEffect(() => {
        fetchProjects()
        fetchStats()
    }, [fetchProjects, fetchStats])

    return {
        projects,
        loading,
        error,
        pagination,
        stats,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
        getProject,
        refresh,
    }
}

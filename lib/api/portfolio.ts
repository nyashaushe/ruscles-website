import { apiClient } from './client'
import type { PortfolioItem, CreatePortfolioItemData, UpdatePortfolioItemData } from '../types/content'

export interface PortfolioFilters {
  category?: 'electrical' | 'hvac' | 'refrigeration' | 'all'
  status?: 'visible' | 'hidden' | 'all'
  featured?: boolean
  search?: string
  tags?: string[]
}

export const portfolioApi = {
  // Get all portfolio items with filtering
  getPortfolioItems: async (filters: PortfolioFilters = {}): Promise<PortfolioItem[]> => {
    const params = new URLSearchParams()
    
    if (filters.category && filters.category !== 'all') {
      params.append('category', filters.category)
    }
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status)
    }
    if (filters.featured !== undefined) {
      params.append('featured', filters.featured.toString())
    }
    if (filters.search) {
      params.append('search', filters.search)
    }
    if (filters.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','))
    }

    const response = await apiClient.get(`/api/admin/portfolio?${params.toString()}`)
    return response.data
  },

  // Get single portfolio item
  getPortfolioItem: async (id: string): Promise<PortfolioItem> => {
    const response = await apiClient.get(`/api/admin/portfolio/${id}`)
    return response.data
  },

  // Create new portfolio item
  createPortfolioItem: async (data: CreatePortfolioItemData): Promise<PortfolioItem> => {
    const response = await apiClient.post('/api/admin/portfolio', data)
    return response.data
  },

  // Update portfolio item
  updatePortfolioItem: async (id: string, data: UpdatePortfolioItemData): Promise<PortfolioItem> => {
    const response = await apiClient.put(`/api/admin/portfolio/${id}`, data)
    return response.data
  },

  // Delete portfolio item
  deletePortfolioItem: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/portfolio/${id}`)
  },

  // Update display order
  updateDisplayOrder: async (items: { id: string; displayOrder: number }[]): Promise<void> => {
    await apiClient.put('/api/admin/portfolio/reorder', { items })
  },

  // Toggle featured status
  toggleFeatured: async (id: string, featured: boolean): Promise<PortfolioItem> => {
    const response = await apiClient.put(`/api/admin/portfolio/${id}/featured`, { featured })
    return response.data
  },

  // Toggle visibility
  toggleVisibility: async (id: string, visible: boolean): Promise<PortfolioItem> => {
    const response = await apiClient.put(`/api/admin/portfolio/${id}/visibility`, { visible })
    return response.data
  },

  // Upload portfolio images
  uploadImages: async (files: File[]): Promise<string[]> => {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`images`, file)
    })

    const response = await apiClient.post('/api/admin/portfolio/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.urls
  },

  // Delete image
  deleteImage: async (imageUrl: string): Promise<void> => {
    await apiClient.delete('/api/admin/portfolio/image', {
      data: { imageUrl }
    })
  }
}
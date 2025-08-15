import { apiClient } from "./client"
import type { PageContent } from "@/lib/types/content"

export const pagesApi = {
  async getAll(): Promise<PageContent[]> {
    const response = await apiClient.get('/admin/pages')
    return response.data
  },

  async getBySlug(slug: string): Promise<PageContent> {
    const response = await apiClient.get(`/admin/pages/${slug}`)
    return response.data
  },

  async create(data: Omit<PageContent, 'id' | 'lastUpdated'>): Promise<PageContent> {
    const response = await apiClient.post('/admin/pages', data)
    return response.data
  },

  async update(id: string, data: Partial<PageContent>): Promise<PageContent> {
    const response = await apiClient.put(`/admin/pages/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/pages/${id}`)
  }
}
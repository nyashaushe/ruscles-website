import { apiClient } from "./client"

interface ServiceDescription {
  id: string
  title: string
  description: string
  shortDescription: string
  features: string[]
  icon: 'electrical' | 'hvac' | 'refrigeration'
  displayOrder: number
  isActive: boolean
}

export const serviceDescriptionsApi = {
  async getAll(): Promise<ServiceDescription[]> {
    const response = await apiClient.get('/admin/service-descriptions')
    return response.data
  },

  async update(id: string, data: Partial<ServiceDescription>): Promise<ServiceDescription> {
    const response = await apiClient.put(`/admin/service-descriptions/${id}`, data)
    return response.data
  },

  async updateAll(services: ServiceDescription[]): Promise<ServiceDescription[]> {
    const response = await apiClient.put('/admin/service-descriptions', { services })
    return response.data
  }
}
import { apiClient } from "./client"

interface BusinessHours {
  day: string
  isOpen: boolean
  openTime: string
  closeTime: string
}

interface BusinessInfo {
  companyName: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  phone: string
  email: string
  emergencyPhone?: string
  businessHours: BusinessHours[]
  serviceAreas: string[]
  description: string
}

export const businessInfoApi = {
  async get(): Promise<BusinessInfo> {
    const response = await apiClient.get('/admin/business-info')
    return response.data
  },

  async update(data: BusinessInfo): Promise<BusinessInfo> {
    const response = await apiClient.put('/admin/business-info', data)
    return response.data
  }
}
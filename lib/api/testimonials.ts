import { apiClient, ApiResponse, PaginatedResponse } from './client'
import { Testimonial } from '@/lib/types/content'

export interface TestimonialFilters {
  isVisible?: boolean
  isFeatured?: boolean
  projectType?: string
  search?: string
}

export interface TestimonialSortOptions {
  sortBy?: 'customerName' | 'createdAt' | 'displayOrder' | 'rating'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateTestimonialData {
  customerName: string
  customerTitle?: string
  customerCompany?: string
  customerPhoto?: string
  testimonialText: string
  rating?: number
  projectType?: string
  isVisible: boolean
  isFeatured: boolean
}

export interface UpdateTestimonialData extends Partial<CreateTestimonialData> {
  customerPhoto?: string
  displayOrder?: number
}

export interface ReorderTestimonialData {
  id: string
  displayOrder: number
}

class TestimonialsApi {
  private basePath = '/testimonials'

  async getTestimonials(
    filters?: TestimonialFilters,
    sortOptions?: TestimonialSortOptions,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Testimonial>> {
    const params = {
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
      ...sortOptions,
    }

    return apiClient.get<PaginatedResponse<Testimonial>>(this.basePath, params)
  }

  async getTestimonial(id: string): Promise<ApiResponse<Testimonial>> {
    return apiClient.get<ApiResponse<Testimonial>>(`${this.basePath}/${id}`)
  }

  async createTestimonial(data: CreateTestimonialData): Promise<ApiResponse<Testimonial>> {
    return apiClient.post<ApiResponse<Testimonial>>(this.basePath, data)
  }

  async updateTestimonial(id: string, data: UpdateTestimonialData): Promise<ApiResponse<Testimonial>> {
    return apiClient.put<ApiResponse<Testimonial>>(`${this.basePath}/${id}`, data)
  }

  async deleteTestimonial(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`${this.basePath}/${id}`)
  }

  async uploadCustomerPhoto(file: File): Promise<ApiResponse<{ url: string }>> {
    return apiClient.uploadFile(`${this.basePath}/upload-photo`, file)
  }

  async reorderTestimonials(reorderData: ReorderTestimonialData[]): Promise<ApiResponse<void>> {
    return apiClient.put<ApiResponse<void>>(`${this.basePath}/reorder`, { testimonials: reorderData })
  }

  async toggleVisibility(id: string, isVisible: boolean): Promise<ApiResponse<Testimonial>> {
    return apiClient.patch<ApiResponse<Testimonial>>(`${this.basePath}/${id}/visibility`, { isVisible })
  }

  async toggleFeatured(id: string, isFeatured: boolean): Promise<ApiResponse<Testimonial>> {
    return apiClient.patch<ApiResponse<Testimonial>>(`${this.basePath}/${id}/featured`, { isFeatured })
  }
}

export const testimonialsApi = new TestimonialsApi()
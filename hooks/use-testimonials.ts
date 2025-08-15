import { useState, useEffect, useCallback } from 'react'
import { 
  testimonialsApi, 
  TestimonialFilters, 
  TestimonialSortOptions,
  CreateTestimonialData,
  UpdateTestimonialData,
  ReorderTestimonialData
} from '@/lib/api/testimonials'
import { Testimonial } from '@/lib/types/content'
import { useToast } from './use-toast'

interface UseTestimonialsListOptions {
  filters?: TestimonialFilters
  sortOptions?: TestimonialSortOptions
  page?: number
  limit?: number
  autoRefresh?: boolean
}

export function useTestimonialsList(options: UseTestimonialsListOptions = {}) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const { toast } = useToast()

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await testimonialsApi.getTestimonials(
        options.filters,
        options.sortOptions,
        options.page || 1,
        options.limit || 20
      )

      if (response.success) {
        setTestimonials(response.data)
        setPagination(response.pagination)
      } else {
        throw new Error(response.message || 'Failed to fetch testimonials')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch testimonials'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [options.filters, options.sortOptions, options.page, options.limit, toast])

  useEffect(() => {
    fetchTestimonials()
  }, [fetchTestimonials])

  const refresh = useCallback(() => {
    fetchTestimonials()
  }, [fetchTestimonials])

  return {
    testimonials,
    loading,
    error,
    pagination,
    refresh
  }
}

export function useTestimonial(id?: string) {
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchTestimonial = useCallback(async (testimonialId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await testimonialsApi.getTestimonial(testimonialId)
      
      if (response.success) {
        setTestimonial(response.data)
      } else {
        throw new Error(response.message || 'Failed to fetch testimonial')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch testimonial'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (id) {
      fetchTestimonial(id)
    }
  }, [id, fetchTestimonial])

  const create = useCallback(async (data: CreateTestimonialData): Promise<Testimonial | null> => {
    try {
      const response = await testimonialsApi.createTestimonial(data)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Testimonial created successfully"
        })
        return response.data
      } else {
        throw new Error(response.message || 'Failed to create testimonial')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create testimonial'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      return null
    }
  }, [toast])

  const update = useCallback(async (testimonialId: string, data: UpdateTestimonialData): Promise<Testimonial | null> => {
    try {
      const response = await testimonialsApi.updateTestimonial(testimonialId, data)
      
      if (response.success) {
        setTestimonial(response.data)
        toast({
          title: "Success",
          description: "Testimonial updated successfully"
        })
        return response.data
      } else {
        throw new Error(response.message || 'Failed to update testimonial')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update testimonial'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      return null
    }
  }, [toast])

  const deleteTestimonial = useCallback(async (testimonialId: string): Promise<boolean> => {
    try {
      const response = await testimonialsApi.deleteTestimonial(testimonialId)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Testimonial deleted successfully"
        })
        return true
      } else {
        throw new Error(response.message || 'Failed to delete testimonial')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete testimonial'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      return false
    }
  }, [toast])

  const uploadPhoto = useCallback(async (file: File): Promise<string | null> => {
    try {
      const response = await testimonialsApi.uploadCustomerPhoto(file)
      
      if (response.success) {
        return response.data.url
      } else {
        throw new Error(response.message || 'Failed to upload photo')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload photo'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      return null
    }
  }, [toast])

  const reorder = useCallback(async (reorderData: ReorderTestimonialData[]): Promise<boolean> => {
    try {
      const response = await testimonialsApi.reorderTestimonials(reorderData)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Testimonials reordered successfully"
        })
        return true
      } else {
        throw new Error(response.message || 'Failed to reorder testimonials')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder testimonials'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      return false
    }
  }, [toast])

  const toggleVisibility = useCallback(async (testimonialId: string, isVisible: boolean): Promise<boolean> => {
    try {
      const response = await testimonialsApi.toggleVisibility(testimonialId, isVisible)
      
      if (response.success) {
        setTestimonial(response.data)
        toast({
          title: "Success",
          description: `Testimonial ${isVisible ? 'shown' : 'hidden'} successfully`
        })
        return true
      } else {
        throw new Error(response.message || 'Failed to update visibility')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update visibility'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      return false
    }
  }, [toast])

  const toggleFeatured = useCallback(async (testimonialId: string, isFeatured: boolean): Promise<boolean> => {
    try {
      const response = await testimonialsApi.toggleFeatured(testimonialId, isFeatured)
      
      if (response.success) {
        setTestimonial(response.data)
        toast({
          title: "Success",
          description: `Testimonial ${isFeatured ? 'featured' : 'unfeatured'} successfully`
        })
        return true
      } else {
        throw new Error(response.message || 'Failed to update featured status')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update featured status'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      return false
    }
  }, [toast])

  return {
    testimonial,
    loading,
    error,
    create,
    update,
    delete: deleteTestimonial,
    uploadPhoto,
    reorder,
    toggleVisibility,
    toggleFeatured,
    refresh: () => id && fetchTestimonial(id)
  }
}
"use client"

import { useState, useEffect, useCallback } from 'react'

export interface BusinessInfo {
  id: string
  companyName: string
  tagline?: string
  description?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  logo?: string
  socialMedia: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
    youtube?: string
  }
  businessHours: {
    monday?: string
    tuesday?: string
    wednesday?: string
    thursday?: string
    friday?: string
    saturday?: string
    sunday?: string
  }
  services: {
    electrical?: string
    hvac?: string
    refrigeration?: string
    maintenance?: string
  }
  updatedAt: string
  updatedBy: string
}

export interface BusinessInfoResponse {
  businessInfo: BusinessInfo | null
}

export function useBusinessInfo() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch business info
  const fetchBusinessInfo = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/business-info')

      if (!response.ok) {
        throw new Error('Failed to fetch business info')
      }

      const data: BusinessInfoResponse = await response.json()
      setBusinessInfo(data.businessInfo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  // Create or update business info
  const upsertBusinessInfo = useCallback(async (businessData: Partial<BusinessInfo>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/business-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save business info')
      }

      const updatedBusinessInfo = await response.json()
      setBusinessInfo(updatedBusinessInfo)
      return updatedBusinessInfo
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save business info')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Refresh business info
  const refresh = useCallback(() => {
    fetchBusinessInfo()
  }, [fetchBusinessInfo])

  // Initial load
  useEffect(() => {
    fetchBusinessInfo()
  }, [fetchBusinessInfo])

  return {
    businessInfo,
    loading,
    error,
    fetchBusinessInfo,
    upsertBusinessInfo,
    refresh,
  }
}
"use client"

import { useState, useEffect } from "react"
import { businessInfoApi } from "@/lib/api/business-info"

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

export function useBusinessInfo() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchBusinessInfo = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await businessInfoApi.get()
      setBusinessInfo(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateBusinessInfo = async (data: BusinessInfo) => {
    try {
      const updatedInfo = await businessInfoApi.update(data)
      setBusinessInfo(updatedInfo)
      return updatedInfo
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  useEffect(() => {
    fetchBusinessInfo()
  }, [])

  return {
    businessInfo,
    isLoading,
    error,
    updateBusinessInfo,
    refetch: fetchBusinessInfo
  }
}
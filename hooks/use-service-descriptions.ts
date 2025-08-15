"use client"

import { useState, useEffect } from "react"
import { serviceDescriptionsApi } from "@/lib/api/service-descriptions"

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

export function useServiceDescriptions() {
  const [services, setServices] = useState<ServiceDescription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await serviceDescriptionsApi.getAll()
      setServices(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateServices = async (services: ServiceDescription[]) => {
    try {
      const updatedServices = await serviceDescriptionsApi.updateAll(services)
      setServices(updatedServices)
      return updatedServices
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const updateService = async (id: string, data: Partial<ServiceDescription>) => {
    try {
      const updatedService = await serviceDescriptionsApi.update(id, data)
      setServices(prev => prev.map(service => 
        service.id === id ? updatedService : service
      ))
      return updatedService
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  return {
    services,
    isLoading,
    error,
    updateServices,
    updateService,
    refetch: fetchServices
  }
}
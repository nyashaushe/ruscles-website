import { useState, useEffect, useCallback } from 'react'
import { portfolioApi, type PortfolioFilters } from '../lib/api/portfolio'
import type { PortfolioItem, CreatePortfolioItemData, UpdatePortfolioItemData } from '../lib/types/content'
import { useToast } from './use-toast'

export function usePortfolio(filters: PortfolioFilters = {}) {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchPortfolioItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const items = await portfolioApi.getPortfolioItems(filters)
      setPortfolioItems(items)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch portfolio items'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [filters, toast])

  useEffect(() => {
    fetchPortfolioItems()
  }, [fetchPortfolioItems])

  const createPortfolioItem = async (data: CreatePortfolioItemData): Promise<PortfolioItem | null> => {
    try {
      const newItem = await portfolioApi.createPortfolioItem(data)
      setPortfolioItems(prev => [newItem, ...prev])
      toast({
        title: 'Success',
        description: 'Portfolio item created successfully',
      })
      return newItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create portfolio item'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      return null
    }
  }

  const updatePortfolioItem = async (id: string, data: UpdatePortfolioItemData): Promise<PortfolioItem | null> => {
    try {
      const updatedItem = await portfolioApi.updatePortfolioItem(id, data)
      setPortfolioItems(prev => prev.map(item => item.id === id ? updatedItem : item))
      toast({
        title: 'Success',
        description: 'Portfolio item updated successfully',
      })
      return updatedItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update portfolio item'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      return null
    }
  }

  const deletePortfolioItem = async (id: string): Promise<boolean> => {
    try {
      await portfolioApi.deletePortfolioItem(id)
      setPortfolioItems(prev => prev.filter(item => item.id !== id))
      toast({
        title: 'Success',
        description: 'Portfolio item deleted successfully',
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete portfolio item'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      return false
    }
  }

  const toggleFeatured = async (id: string, featured: boolean): Promise<void> => {
    try {
      const updatedItem = await portfolioApi.toggleFeatured(id, featured)
      setPortfolioItems(prev => prev.map(item => item.id === id ? updatedItem : item))
      toast({
        title: 'Success',
        description: `Portfolio item ${featured ? 'featured' : 'unfeatured'} successfully`,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update featured status'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const toggleVisibility = async (id: string, visible: boolean): Promise<void> => {
    try {
      const updatedItem = await portfolioApi.toggleVisibility(id, visible)
      setPortfolioItems(prev => prev.map(item => item.id === id ? updatedItem : item))
      toast({
        title: 'Success',
        description: `Portfolio item ${visible ? 'shown' : 'hidden'} successfully`,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update visibility'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const updateDisplayOrder = async (items: { id: string; displayOrder: number }[]): Promise<void> => {
    try {
      await portfolioApi.updateDisplayOrder(items)
      // Update local state to reflect new order
      const updatedItems = [...portfolioItems]
      items.forEach(({ id, displayOrder }) => {
        const item = updatedItems.find(i => i.id === id)
        if (item) {
          item.displayOrder = displayOrder
        }
      })
      updatedItems.sort((a, b) => a.displayOrder - b.displayOrder)
      setPortfolioItems(updatedItems)
      toast({
        title: 'Success',
        description: 'Display order updated successfully',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update display order'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  return {
    portfolioItems,
    loading,
    error,
    refetch: fetchPortfolioItems,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    toggleFeatured,
    toggleVisibility,
    updateDisplayOrder,
  }
}

export function usePortfolioItem(id: string) {
  const [portfolioItem, setPortfolioItem] = useState<PortfolioItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPortfolioItem = async () => {
      try {
        setLoading(true)
        setError(null)
        const item = await portfolioApi.getPortfolioItem(id)
        setPortfolioItem(item)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch portfolio item'
        setError(errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPortfolioItem()
    }
  }, [id, toast])

  return {
    portfolioItem,
    loading,
    error,
  }
}
"use client"

import { useState, useEffect } from "react"
import { pagesApi } from "@/lib/api/pages"
import type { PageContent } from "@/lib/types/content"

export function usePages() {
  const [pages, setPages] = useState<PageContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPages = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await pagesApi.getAll()
      setPages(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPage = async (slug: string): Promise<PageContent | null> => {
    try {
      return await pagesApi.getBySlug(slug)
    } catch (err) {
      setError(err as Error)
      return null
    }
  }

  const updatePage = async (id: string, data: Partial<PageContent>) => {
    try {
      const updatedPage = await pagesApi.update(id, data)
      setPages(prev => prev.map(page => 
        page.id === id ? updatedPage : page
      ))
      return updatedPage
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const createPage = async (data: Omit<PageContent, 'id' | 'lastUpdated'>) => {
    try {
      const newPage = await pagesApi.create(data)
      setPages(prev => [...prev, newPage])
      return newPage
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const deletePage = async (id: string) => {
    try {
      await pagesApi.delete(id)
      setPages(prev => prev.filter(page => page.id !== id))
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  useEffect(() => {
    fetchPages()
  }, [])

  return {
    pages,
    isLoading,
    error,
    getPage,
    updatePage,
    createPage,
    deletePage,
    refetch: fetchPages
  }
}
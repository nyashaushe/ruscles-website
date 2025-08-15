import { useState, useEffect, useCallback } from 'react'
import { searchApi } from '@/lib/api/search'
import type { 
  GlobalSearchResult, 
  GlobalSearchParams, 
  GlobalSearchFilters,
  SavedSearch,
  FilterPreset 
} from '@/lib/types/search'

export function useGlobalSearch() {
  const [results, setResults] = useState<GlobalSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalResults, setTotalResults] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const search = useCallback(async (params: GlobalSearchParams) => {
    if (!params.query.trim()) {
      setResults([])
      setTotalResults(0)
      setHasMore(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await searchApi.globalSearch(params)
      
      if (params.offset && params.offset > 0) {
        // Append results for pagination
        setResults(prev => [...prev, ...response.data])
      } else {
        // Replace results for new search
        setResults(response.data)
      }
      
      setTotalResults(response.total)
      setHasMore(response.hasMore || false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
      setTotalResults(0)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setTotalResults(0)
    setHasMore(false)
    setError(null)
  }, [])

  return {
    results,
    loading,
    error,
    totalResults,
    hasMore,
    search,
    clearResults
  }
}

export function useSearchSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const getSuggestions = useCallback(async (query: string, types?: string[]) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const response = await searchApi.searchSuggestions(query, types)
      setSuggestions(response.data)
    } catch (err) {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  const clearSuggestions = useCallback(() => {
    setSuggestions([])
  }, [])

  return {
    suggestions,
    loading,
    getSuggestions,
    clearSuggestions
  }
}

export function useSavedSearches() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSavedSearches = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await searchApi.getSavedSearches()
      setSavedSearches(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load saved searches')
    } finally {
      setLoading(false)
    }
  }, [])

  const createSavedSearch = useCallback(async (data: Omit<SavedSearch, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      const response = await searchApi.createSavedSearch(data)
      setSavedSearches(prev => [...prev, response.data])
      return response.data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save search')
    }
  }, [])

  const updateSavedSearch = useCallback(async (id: string, data: Partial<SavedSearch>) => {
    try {
      const response = await searchApi.updateSavedSearch(id, data)
      setSavedSearches(prev => prev.map(search => 
        search.id === id ? response.data : search
      ))
      return response.data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update saved search')
    }
  }, [])

  const deleteSavedSearch = useCallback(async (id: string) => {
    try {
      await searchApi.deleteSavedSearch(id)
      setSavedSearches(prev => prev.filter(search => search.id !== id))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete saved search')
    }
  }, [])

  useEffect(() => {
    fetchSavedSearches()
  }, [fetchSavedSearches])

  return {
    savedSearches,
    loading,
    error,
    createSavedSearch,
    updateSavedSearch,
    deleteSavedSearch,
    refresh: fetchSavedSearches
  }
}

export function useFilterPresets(type?: string) {
  const [presets, setPresets] = useState<FilterPreset[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPresets = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await searchApi.getFilterPresets(type)
      setPresets(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load filter presets')
    } finally {
      setLoading(false)
    }
  }, [type])

  const createPreset = useCallback(async (data: Omit<FilterPreset, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      const response = await searchApi.createFilterPreset(data)
      setPresets(prev => [...prev, response.data])
      return response.data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create filter preset')
    }
  }, [])

  const updatePreset = useCallback(async (id: string, data: Partial<FilterPreset>) => {
    try {
      const response = await searchApi.updateFilterPreset(id, data)
      setPresets(prev => prev.map(preset => 
        preset.id === id ? response.data : preset
      ))
      return response.data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update filter preset')
    }
  }, [])

  const deletePreset = useCallback(async (id: string) => {
    try {
      await searchApi.deleteFilterPreset(id)
      setPresets(prev => prev.filter(preset => preset.id !== id))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete filter preset')
    }
  }, [])

  useEffect(() => {
    fetchPresets()
  }, [fetchPresets])

  return {
    presets,
    loading,
    error,
    createPreset,
    updatePreset,
    deletePreset,
    refresh: fetchPresets
  }
}
import { apiClient, PaginatedResponse, ApiResponse } from './client'
import type { 
  GlobalSearchResult, 
  GlobalSearchParams, 
  SavedSearch, 
  FilterPreset,
  AdvancedFilters 
} from '@/lib/types/search'

class SearchApi {
  private basePath = '/search'

  // Global search across all content types
  async globalSearch(params: GlobalSearchParams): Promise<PaginatedResponse<GlobalSearchResult>> {
    const searchParams = new URLSearchParams()
    
    searchParams.set('query', params.query)
    
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())
    if (params.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
    
    if (params.filters) {
      if (params.filters.types?.length) {
        searchParams.set('types', params.filters.types.join(','))
      }
      if (params.filters.status?.length) {
        searchParams.set('status', params.filters.status.join(','))
      }
      if (params.filters.priority?.length) {
        searchParams.set('priority', params.filters.priority.join(','))
      }
      if (params.filters.categories?.length) {
        searchParams.set('categories', params.filters.categories.join(','))
      }
      if (params.filters.tags?.length) {
        searchParams.set('tags', params.filters.tags.join(','))
      }
      if (params.filters.author) {
        searchParams.set('author', params.filters.author)
      }
      if (params.filters.dateRange) {
        searchParams.set('dateFrom', params.filters.dateRange.from.toISOString())
        searchParams.set('dateTo', params.filters.dateRange.to.toISOString())
      }
    }

    const queryString = searchParams.toString()
    const endpoint = `${this.basePath}/global?${queryString}`
    
    return apiClient.get<PaginatedResponse<GlobalSearchResult>>(endpoint)
  }

  // Search suggestions/autocomplete
  async searchSuggestions(query: string, types?: string[]): Promise<ApiResponse<string[]>> {
    const searchParams = new URLSearchParams()
    searchParams.set('query', query)
    if (types?.length) {
      searchParams.set('types', types.join(','))
    }
    
    return apiClient.get<ApiResponse<string[]>>(`${this.basePath}/suggestions?${searchParams.toString()}`)
  }

  // Get popular search terms
  async getPopularSearches(type?: string): Promise<ApiResponse<string[]>> {
    const searchParams = new URLSearchParams()
    if (type) searchParams.set('type', type)
    
    return apiClient.get<ApiResponse<string[]>>(`${this.basePath}/popular?${searchParams.toString()}`)
  }

  // Saved searches
  async getSavedSearches(): Promise<ApiResponse<SavedSearch[]>> {
    return apiClient.get<ApiResponse<SavedSearch[]>>(`${this.basePath}/saved`)
  }

  async createSavedSearch(data: Omit<SavedSearch, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<ApiResponse<SavedSearch>> {
    return apiClient.post<ApiResponse<SavedSearch>>(`${this.basePath}/saved`, data)
  }

  async updateSavedSearch(id: string, data: Partial<SavedSearch>): Promise<ApiResponse<SavedSearch>> {
    return apiClient.put<ApiResponse<SavedSearch>>(`${this.basePath}/saved/${id}`, data)
  }

  async deleteSavedSearch(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`${this.basePath}/saved/${id}`)
  }

  // Filter presets
  async getFilterPresets(type?: string): Promise<ApiResponse<FilterPreset[]>> {
    const searchParams = new URLSearchParams()
    if (type) searchParams.set('type', type)
    
    return apiClient.get<ApiResponse<FilterPreset[]>>(`${this.basePath}/presets?${searchParams.toString()}`)
  }

  async createFilterPreset(data: Omit<FilterPreset, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<ApiResponse<FilterPreset>> {
    return apiClient.post<ApiResponse<FilterPreset>>(`${this.basePath}/presets`, data)
  }

  async updateFilterPreset(id: string, data: Partial<FilterPreset>): Promise<ApiResponse<FilterPreset>> {
    return apiClient.put<ApiResponse<FilterPreset>>(`${this.basePath}/presets/${id}`, data)
  }

  async deleteFilterPreset(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`${this.basePath}/presets/${id}`)
  }

  // Advanced search with complex filters
  async advancedSearch(filters: AdvancedFilters): Promise<PaginatedResponse<GlobalSearchResult>> {
    return apiClient.post<PaginatedResponse<GlobalSearchResult>>(`${this.basePath}/advanced`, filters)
  }

  // Search analytics
  async getSearchAnalytics(dateRange?: { from: Date; to: Date }): Promise<ApiResponse<{
    totalSearches: number
    uniqueQueries: number
    topQueries: Array<{ query: string; count: number }>
    searchesByType: Array<{ type: string; count: number }>
    averageResultsPerSearch: number
  }>> {
    const searchParams = new URLSearchParams()
    if (dateRange) {
      searchParams.set('dateFrom', dateRange.from.toISOString())
      searchParams.set('dateTo', dateRange.to.toISOString())
    }
    
    return apiClient.get<ApiResponse<any>>(`${this.basePath}/analytics?${searchParams.toString()}`)
  }
}

export const searchApi = new SearchApi()
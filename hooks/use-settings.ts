import { useState, useEffect, useCallback } from 'react'

export interface Setting {
    id: string
    key: string
    value: string
    description?: string
    isPublic: boolean
    updatedAt: string
    updatedBy: string
}

export interface SettingsResponse {
    settings: Setting[]
}

export function useSettings() {
    const [settings, setSettings] = useState<Setting[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch settings
    const fetchSettings = useCallback(async (filters?: { key?: string; isPublic?: boolean }) => {
        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams()
            if (filters?.key) params.append('key', filters.key)
            if (filters?.isPublic !== undefined) params.append('isPublic', filters.isPublic.toString())

            const response = await fetch(`/api/settings?${params.toString()}`)

            if (!response.ok) {
                throw new Error('Failed to fetch settings')
            }

            const data: SettingsResponse = await response.json()
            setSettings(data.settings)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }, [])

    // Create or update a setting
    const upsertSetting = useCallback(async (settingData: Partial<Setting>) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settingData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to save setting')
            }

            const updatedSetting = await response.json()

            // Update the settings list
            setSettings(prev => {
                const existingIndex = prev.findIndex(s => s.key === updatedSetting.key)
                if (existingIndex >= 0) {
                    const newSettings = [...prev]
                    newSettings[existingIndex] = updatedSetting
                    return newSettings
                } else {
                    return [...prev, updatedSetting]
                }
            })

            return updatedSetting
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save setting')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Get a setting by key
    const getSetting = useCallback((key: string) => {
        return settings.find(s => s.key === key)
    }, [settings])

    // Get setting value by key
    const getSettingValue = useCallback((key: string, defaultValue?: string) => {
        const setting = settings.find(s => s.key === key)
        return setting?.value || defaultValue
    }, [settings])

    // Refresh settings
    const refresh = useCallback(() => {
        fetchSettings()
    }, [fetchSettings])

    // Initial load
    useEffect(() => {
        fetchSettings()
    }, [fetchSettings])

    return {
        settings,
        loading,
        error,
        fetchSettings,
        upsertSetting,
        getSetting,
        getSettingValue,
        refresh,
    }
}

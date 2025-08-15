import { ErrorLogEntry } from '@/lib/utils/error-handling'

export interface ErrorMonitoringConfig {
  endpoint?: string
  apiKey?: string
  environment?: string
  userId?: string
  sessionId?: string
  enableConsoleLogging?: boolean
  enableLocalStorage?: boolean
  maxLocalStorageEntries?: number
  batchSize?: number
  flushInterval?: number
}

export class ErrorMonitoringService {
  private config: Required<ErrorMonitoringConfig>
  private errorQueue: ErrorLogEntry[] = []
  private flushTimer?: NodeJS.Timeout

  constructor(config: ErrorMonitoringConfig = {}) {
    this.config = {
      endpoint: '/api/monitoring/errors',
      apiKey: '',
      environment: process.env.NODE_ENV || 'development',
      userId: '',
      sessionId: this.generateSessionId(),
      enableConsoleLogging: process.env.NODE_ENV === 'development',
      enableLocalStorage: true,
      maxLocalStorageEntries: 100,
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      ...config
    }

    // Start periodic flush
    this.startPeriodicFlush()

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush())
    }
  }

  private generateSessionId(): string {
    if (typeof window === 'undefined') return 'server'
    
    let sessionId = sessionStorage.getItem('error_monitoring_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('error_monitoring_session_id', sessionId)
    }
    return sessionId
  }

  private startPeriodicFlush() {
    this.flushTimer = setInterval(() => {
      if (this.errorQueue.length > 0) {
        this.flush()
      }
    }, this.config.flushInterval)
  }

  public logError(error: any, context?: Record<string, any>): string {
    const errorEntry: ErrorLogEntry = {
      id: this.generateErrorId(),
      message: this.getErrorMessage(error),
      stack: error?.stack,
      status: error?.status,
      code: error?.code,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      userId: this.config.userId,
      sessionId: this.config.sessionId,
      context: {
        environment: this.config.environment,
        ...context
      },
      severity: this.determineSeverity(error),
      category: this.determineCategory(error)
    }

    // Log to console if enabled
    if (this.config.enableConsoleLogging) {
      console.error('Error logged:', errorEntry)
    }

    // Store in localStorage if enabled
    if (this.config.enableLocalStorage) {
      this.storeInLocalStorage(errorEntry)
    }

    // Add to queue for remote logging
    this.errorQueue.push(errorEntry)

    // Flush immediately for critical errors
    if (errorEntry.severity === 'critical') {
      this.flush()
    } else if (this.errorQueue.length >= this.config.batchSize) {
      this.flush()
    }

    return errorEntry.id
  }

  private getErrorMessage(error: any): string {
    if (typeof error === 'string') return error
    if (error?.message) return error.message
    return 'Unknown error'
  }

  private determineSeverity(error: any): ErrorLogEntry['severity'] {
    if (error?.status >= 500) return 'high'
    if (error?.status === 429) return 'medium'
    if (error?.status >= 400) return 'low'
    if (error?.name === 'ChunkLoadError' || error?.name === 'TypeError') return 'high'
    if (error?.message?.includes('Network')) return 'medium'
    return 'medium'
  }

  private determineCategory(error: any): ErrorLogEntry['category'] {
    if (error?.isNetworkError || error?.status) return 'network'
    if (error?.name === 'ValidationError' || error?.code?.includes('validation')) return 'validation'
    if (error?.name === 'TypeError' || error?.name === 'ReferenceError') return 'runtime'
    if (error?.message?.includes('user') || error?.message?.includes('permission')) return 'user'
    return 'system'
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private storeInLocalStorage(errorEntry: ErrorLogEntry) {
    try {
      const existingErrors = JSON.parse(localStorage.getItem('error_logs') || '[]')
      existingErrors.push(errorEntry)
      
      // Keep only the most recent entries
      const trimmedErrors = existingErrors.slice(-this.config.maxLocalStorageEntries)
      localStorage.setItem('error_logs', JSON.stringify(trimmedErrors))
    } catch (e) {
      console.error('Failed to store error in localStorage:', e)
    }
  }

  private async flush() {
    if (this.errorQueue.length === 0) return

    const errorsToSend = [...this.errorQueue]
    this.errorQueue = []

    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          errors: errorsToSend,
          metadata: {
            environment: this.config.environment,
            sessionId: this.config.sessionId,
            userId: this.config.userId,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (error) {
      console.error('Failed to send errors to monitoring service:', error)
      
      // Re-queue errors for retry
      this.errorQueue.unshift(...errorsToSend)
    }
  }

  public async getErrorStats(): Promise<{
    total: number
    byCategory: Record<string, number>
    bySeverity: Record<string, number>
    recent: number
  }> {
    try {
      const response = await fetch(`${this.config.endpoint}/stats`, {
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      })
      
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to fetch error stats:', error)
    }

    // Fallback to localStorage stats
    return this.getLocalStorageStats()
  }

  private getLocalStorageStats() {
    try {
      const logs: ErrorLogEntry[] = JSON.parse(localStorage.getItem('error_logs') || '[]')
      const now = Date.now()
      const oneHourAgo = now - (60 * 60 * 1000)
      
      const stats = {
        total: logs.length,
        byCategory: {} as Record<string, number>,
        bySeverity: {} as Record<string, number>,
        recent: logs.filter(log => new Date(log.timestamp).getTime() > oneHourAgo).length
      }
      
      logs.forEach(log => {
        stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1
        stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1
      })
      
      return stats
    } catch {
      return { total: 0, byCategory: {}, bySeverity: {}, recent: 0 }
    }
  }

  public async getRecentErrors(limit = 50): Promise<ErrorLogEntry[]> {
    try {
      const response = await fetch(`${this.config.endpoint}/recent?limit=${limit}`, {
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      })
      
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to fetch recent errors:', error)
    }

    // Fallback to localStorage
    try {
      const logs: ErrorLogEntry[] = JSON.parse(localStorage.getItem('error_logs') || '[]')
      return logs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
    } catch {
      return []
    }
  }

  public clearLocalErrors() {
    localStorage.removeItem('error_logs')
  }

  public updateConfig(newConfig: Partial<ErrorMonitoringConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  public destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    this.flush() // Final flush
  }
}

// Global instance
let globalErrorMonitoring: ErrorMonitoringService | null = null

export function initializeErrorMonitoring(config?: ErrorMonitoringConfig): ErrorMonitoringService {
  if (!globalErrorMonitoring) {
    globalErrorMonitoring = new ErrorMonitoringService(config)
  }
  return globalErrorMonitoring
}

export function getErrorMonitoring(): ErrorMonitoringService {
  if (!globalErrorMonitoring) {
    globalErrorMonitoring = new ErrorMonitoringService()
  }
  return globalErrorMonitoring
}

// React hook for error monitoring
export function useErrorMonitoring(config?: ErrorMonitoringConfig) {
  const [monitoring] = React.useState(() => {
    return globalErrorMonitoring || new ErrorMonitoringService(config)
  })

  React.useEffect(() => {
    if (!globalErrorMonitoring) {
      globalErrorMonitoring = monitoring
    }
    
    return () => {
      // Don't destroy global instance on unmount
    }
  }, [monitoring])

  const logError = React.useCallback((error: any, context?: Record<string, any>) => {
    return monitoring.logError(error, context)
  }, [monitoring])

  const getStats = React.useCallback(() => {
    return monitoring.getErrorStats()
  }, [monitoring])

  const getRecentErrors = React.useCallback((limit?: number) => {
    return monitoring.getRecentErrors(limit)
  }, [monitoring])

  return {
    logError,
    getStats,
    getRecentErrors,
    clearLocalErrors: monitoring.clearLocalErrors.bind(monitoring),
    updateConfig: monitoring.updateConfig.bind(monitoring)
  }
}

// Add React import
import React from 'react'
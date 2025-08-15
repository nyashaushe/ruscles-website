import { useState, useCallback } from 'react'
import { ExportsApi } from '@/lib/api/exports'
import type { 
  ExportOptions, 
  ExportJob, 
  ReportMetrics, 
  ContentAnalytics,
  ScheduledReport
} from '@/lib/types/exports'
import type { FormFilters } from '@/lib/types/forms'
import type { ContentFilters } from '@/lib/types/content'
import { useToast } from './use-toast'

export function useExports() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([])
  const [reportMetrics, setReportMetrics] = useState<ReportMetrics | null>(null)
  const [contentAnalytics, setContentAnalytics] = useState<ContentAnalytics | null>(null)
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Export forms
  const exportForms = useCallback(async (
    filters?: FormFilters,
    options: ExportOptions = { format: 'csv' }
  ) => {
    try {
      setIsExporting(true)
      const response = await ExportsApi.exportForms(filters, options)
      
      if (response.success) {
        toast({
          title: 'Export Started',
          description: 'Your form export is being processed. You will be notified when it\'s ready.',
        })
        
        // Poll for job completion
        pollExportJob(response.data.jobId)
        return response.data.jobId
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      console.error('Export forms error:', error)
      toast({
        title: 'Export Failed',
        description: 'Failed to start form export. Please try again.',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsExporting(false)
    }
  }, [toast])

  // Export content
  const exportContent = useCallback(async (
    filters?: ContentFilters,
    options: ExportOptions = { format: 'csv' }
  ) => {
    try {
      setIsExporting(true)
      const response = await ExportsApi.exportContent(filters, options)
      
      if (response.success) {
        toast({
          title: 'Export Started',
          description: 'Your content export is being processed. You will be notified when it\'s ready.',
        })
        
        // Poll for job completion
        pollExportJob(response.data.jobId)
        return response.data.jobId
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      console.error('Export content error:', error)
      toast({
        title: 'Export Failed',
        description: 'Failed to start content export. Please try again.',
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsExporting(false)
    }
  }, [toast])

  // Poll export job status
  const pollExportJob = useCallback(async (jobId: string) => {
    const checkStatus = async () => {
      try {
        const response = await ExportsApi.getExportJob(jobId)
        if (response.success) {
          const job = response.data
          
          // Update jobs list
          setExportJobs(prev => {
            const index = prev.findIndex(j => j.id === jobId)
            if (index >= 0) {
              const updated = [...prev]
              updated[index] = job
              return updated
            } else {
              return [...prev, job]
            }
          })

          if (job.status === 'completed') {
            toast({
              title: 'Export Complete',
              description: 'Your export is ready for download.',
            })
            return true
          } else if (job.status === 'failed') {
            toast({
              title: 'Export Failed',
              description: job.error || 'Export failed with unknown error.',
              variant: 'destructive',
            })
            return true
          }
        }
        return false
      } catch (error) {
        console.error('Error checking export status:', error)
        return true // Stop polling on error
      }
    }

    // Poll every 2 seconds until complete
    const pollInterval = setInterval(async () => {
      const isComplete = await checkStatus()
      if (isComplete) {
        clearInterval(pollInterval)
      }
    }, 2000)

    // Initial check
    await checkStatus()
  }, [toast])

  // Download export
  const downloadExport = useCallback(async (jobId: string, filename?: string) => {
    try {
      const blob = await ExportsApi.downloadExport(jobId)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename || `export-${jobId}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: 'Download Started',
        description: 'Your export file is being downloaded.',
      })
    } catch (error) {
      console.error('Download export error:', error)
      toast({
        title: 'Download Failed',
        description: 'Failed to download export file. Please try again.',
        variant: 'destructive',
      })
    }
  }, [toast])

  // Get export jobs
  const fetchExportJobs = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await ExportsApi.getExportJobs()
      if (response.success) {
        setExportJobs(response.data)
      }
    } catch (error) {
      console.error('Fetch export jobs error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get form metrics
  const fetchFormMetrics = useCallback(async (dateRange?: { from: Date; to: Date }) => {
    try {
      setIsLoading(true)
      const response = await ExportsApi.getFormMetrics(dateRange)
      if (response.success) {
        setReportMetrics(response.data)
      }
    } catch (error) {
      console.error('Fetch form metrics error:', error)
      toast({
        title: 'Failed to Load Metrics',
        description: 'Could not load form metrics. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Get content analytics
  const fetchContentAnalytics = useCallback(async (dateRange?: { from: Date; to: Date }) => {
    try {
      setIsLoading(true)
      const response = await ExportsApi.getContentAnalytics(dateRange)
      if (response.success) {
        setContentAnalytics(response.data)
      }
    } catch (error) {
      console.error('Fetch content analytics error:', error)
      toast({
        title: 'Failed to Load Analytics',
        description: 'Could not load content analytics. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Scheduled reports management
  const fetchScheduledReports = useCallback(async () => {
    try {
      const response = await ExportsApi.getScheduledReports()
      if (response.success) {
        setScheduledReports(response.data)
      }
    } catch (error) {
      console.error('Fetch scheduled reports error:', error)
    }
  }, [])

  const createScheduledReport = useCallback(async (
    report: Omit<ScheduledReport, 'id' | 'createdAt' | 'lastRun' | 'nextRun'>
  ) => {
    try {
      const response = await ExportsApi.createScheduledReport(report)
      if (response.success) {
        setScheduledReports(prev => [...prev, response.data])
        toast({
          title: 'Report Scheduled',
          description: 'Your scheduled report has been created successfully.',
        })
        return response.data
      }
    } catch (error) {
      console.error('Create scheduled report error:', error)
      toast({
        title: 'Failed to Schedule Report',
        description: 'Could not create scheduled report. Please try again.',
        variant: 'destructive',
      })
      throw error
    }
  }, [toast])

  const updateScheduledReport = useCallback(async (
    id: string,
    updates: Partial<Omit<ScheduledReport, 'id' | 'createdAt'>>
  ) => {
    try {
      const response = await ExportsApi.updateScheduledReport(id, updates)
      if (response.success) {
        setScheduledReports(prev => 
          prev.map(report => report.id === id ? response.data : report)
        )
        toast({
          title: 'Report Updated',
          description: 'Scheduled report has been updated successfully.',
        })
        return response.data
      }
    } catch (error) {
      console.error('Update scheduled report error:', error)
      toast({
        title: 'Failed to Update Report',
        description: 'Could not update scheduled report. Please try again.',
        variant: 'destructive',
      })
      throw error
    }
  }, [toast])

  const deleteScheduledReport = useCallback(async (id: string) => {
    try {
      const response = await ExportsApi.deleteScheduledReport(id)
      if (response.success) {
        setScheduledReports(prev => prev.filter(report => report.id !== id))
        toast({
          title: 'Report Deleted',
          description: 'Scheduled report has been deleted successfully.',
        })
      }
    } catch (error) {
      console.error('Delete scheduled report error:', error)
      toast({
        title: 'Failed to Delete Report',
        description: 'Could not delete scheduled report. Please try again.',
        variant: 'destructive',
      })
      throw error
    }
  }, [toast])

  const runScheduledReport = useCallback(async (id: string) => {
    try {
      const response = await ExportsApi.runScheduledReport(id)
      if (response.success) {
        toast({
          title: 'Report Started',
          description: 'Your scheduled report is being generated.',
        })
        pollExportJob(response.data.jobId)
        return response.data.jobId
      }
    } catch (error) {
      console.error('Run scheduled report error:', error)
      toast({
        title: 'Failed to Run Report',
        description: 'Could not run scheduled report. Please try again.',
        variant: 'destructive',
      })
      throw error
    }
  }, [toast, pollExportJob])

  // Quick export functions
  const quickExportFormsCSV = useCallback(async (filters?: FormFilters) => {
    return exportForms(filters, { format: 'csv', includeResponses: true })
  }, [exportForms])

  const quickExportContentCSV = useCallback(async (filters?: ContentFilters) => {
    return exportContent(filters, { format: 'csv', includeMetadata: true })
  }, [exportContent])

  return {
    // State
    isExporting,
    isLoading,
    exportJobs,
    reportMetrics,
    contentAnalytics,
    scheduledReports,

    // Export functions
    exportForms,
    exportContent,
    downloadExport,
    quickExportFormsCSV,
    quickExportContentCSV,

    // Data fetching
    fetchExportJobs,
    fetchFormMetrics,
    fetchContentAnalytics,

    // Scheduled reports
    fetchScheduledReports,
    createScheduledReport,
    updateScheduledReport,
    deleteScheduledReport,
    runScheduledReport,

    // Utilities
    pollExportJob,
  }
}
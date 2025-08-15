import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useExports } from '@/hooks/use-exports'
import { ExportsApi } from '@/lib/api/exports'
import { useToast } from '@/hooks/use-toast'

// Mock the API
vi.mock('@/lib/api/exports')
vi.mock('@/hooks/use-toast')

const mockExportsApi = vi.mocked(ExportsApi)
const mockUseToast = vi.mocked(useToast)

describe('useExports', () => {
  const mockToast = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseToast.mockReturnValue({ toast: mockToast })
  })

  it('should export forms successfully', async () => {
    const mockJobId = 'job-123'
    mockExportsApi.exportForms.mockResolvedValue({
      success: true,
      data: { jobId: mockJobId }
    })

    const { result } = renderHook(() => useExports())

    await act(async () => {
      const jobId = await result.current.exportForms(
        { status: ['new'] },
        { format: 'csv' }
      )
      expect(jobId).toBe(mockJobId)
    })

    expect(mockExportsApi.exportForms).toHaveBeenCalledWith(
      { status: ['new'] },
      { format: 'csv' }
    )
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Export Started',
      description: 'Your form export is being processed. You will be notified when it\'s ready.',
    })
  })

  it('should export content successfully', async () => {
    const mockJobId = 'job-456'
    mockExportsApi.exportContent.mockResolvedValue({
      success: true,
      data: { jobId: mockJobId }
    })

    const { result } = renderHook(() => useExports())

    await act(async () => {
      const jobId = await result.current.exportContent(
        { type: ['blog_post'] },
        { format: 'json' }
      )
      expect(jobId).toBe(mockJobId)
    })

    expect(mockExportsApi.exportContent).toHaveBeenCalledWith(
      { type: ['blog_post'] },
      { format: 'json' }
    )
  })

  it('should handle export errors', async () => {
    mockExportsApi.exportForms.mockRejectedValue(new Error('Export failed'))

    const { result } = renderHook(() => useExports())

    await act(async () => {
      try {
        await result.current.exportForms()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Export Failed',
      description: 'Failed to start form export. Please try again.',
      variant: 'destructive',
    })
  })

  it('should fetch form metrics', async () => {
    const mockMetrics = {
      totalForms: 100,
      formsByStatus: { new: 20, in_progress: 30, completed: 50 },
      formsByType: { contact: 60, service_inquiry: 40 },
      formsByPriority: { low: 30, medium: 50, high: 20 },
      averageResponseTime: 3600,
      responseRate: 85.5,
      trendsData: [
        { date: '2024-01-01', submissions: 5, responses: 4 },
        { date: '2024-01-02', submissions: 8, responses: 6 }
      ]
    }

    mockExportsApi.getFormMetrics.mockResolvedValue({
      success: true,
      data: mockMetrics
    })

    const { result } = renderHook(() => useExports())

    await act(async () => {
      await result.current.fetchFormMetrics({
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31')
      })
    })

    expect(result.current.reportMetrics).toEqual(mockMetrics)
    expect(mockExportsApi.getFormMetrics).toHaveBeenCalledWith({
      from: new Date('2024-01-01'),
      to: new Date('2024-01-31')
    })
  })

  it('should fetch content analytics', async () => {
    const mockAnalytics = {
      totalPosts: 50,
      publishedPosts: 40,
      draftPosts: 10,
      totalViews: 10000,
      averageViews: 250,
      topPerformingPosts: [
        {
          id: '1',
          title: 'Top Post',
          views: 1000,
          publishedAt: '2024-01-01T00:00:00Z'
        }
      ],
      contentTrends: [
        { date: '2024-01-01', posts: 2, views: 500 },
        { date: '2024-01-02', posts: 1, views: 300 }
      ]
    }

    mockExportsApi.getContentAnalytics.mockResolvedValue({
      success: true,
      data: mockAnalytics
    })

    const { result } = renderHook(() => useExports())

    await act(async () => {
      await result.current.fetchContentAnalytics()
    })

    expect(result.current.contentAnalytics).toEqual(mockAnalytics)
  })

  it('should create scheduled report', async () => {
    const mockReport = {
      id: 'report-123',
      name: 'Weekly Forms Report',
      type: 'forms' as const,
      frequency: 'weekly' as const,
      recipients: ['admin@test.com'],
      options: { format: 'csv' as const },
      isActive: true,
      nextRun: new Date(),
      createdAt: new Date()
    }

    mockExportsApi.createScheduledReport.mockResolvedValue({
      success: true,
      data: mockReport
    })

    const { result } = renderHook(() => useExports())

    await act(async () => {
      const report = await result.current.createScheduledReport({
        name: 'Weekly Forms Report',
        type: 'forms',
        frequency: 'weekly',
        recipients: ['admin@test.com'],
        options: { format: 'csv' },
        isActive: true
      })
      expect(report).toEqual(mockReport)
    })

    expect(result.current.scheduledReports).toContain(mockReport)
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Report Scheduled',
      description: 'Your scheduled report has been created successfully.',
    })
  })

  it('should download export file', async () => {
    const mockBlob = new Blob(['test data'], { type: 'text/csv' })
    mockExportsApi.downloadExport.mockResolvedValue(mockBlob)

    // Mock DOM methods
    const mockCreateElement = vi.fn()
    const mockAppendChild = vi.fn()
    const mockRemoveChild = vi.fn()
    const mockClick = vi.fn()
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url')
    const mockRevokeObjectURL = vi.fn()

    const mockLink = {
      href: '',
      download: '',
      click: mockClick,
      style: { visibility: '' }
    }

    mockCreateElement.mockReturnValue(mockLink)

    Object.defineProperty(document, 'createElement', {
      value: mockCreateElement,
      writable: true
    })
    Object.defineProperty(document.body, 'appendChild', {
      value: mockAppendChild,
      writable: true
    })
    Object.defineProperty(document.body, 'removeChild', {
      value: mockRemoveChild,
      writable: true
    })
    Object.defineProperty(URL, 'createObjectURL', {
      value: mockCreateObjectURL,
      writable: true
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: mockRevokeObjectURL,
      writable: true
    })

    const { result } = renderHook(() => useExports())

    await act(async () => {
      await result.current.downloadExport('job-123', 'test-export.csv')
    })

    expect(mockExportsApi.downloadExport).toHaveBeenCalledWith('job-123')
    expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob)
    expect(mockClick).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url')
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Download Started',
      description: 'Your export file is being downloaded.',
    })
  })

  it('should poll export job status', async () => {
    const jobId = 'job-123'
    const completedJob = {
      id: jobId,
      type: 'forms' as const,
      status: 'completed' as const,
      progress: 100,
      createdAt: new Date(),
      completedAt: new Date(),
      downloadUrl: 'http://test.com/download',
      options: { format: 'csv' as const }
    }

    mockExportsApi.getExportJob.mockResolvedValue({
      success: true,
      data: completedJob
    })

    const { result } = renderHook(() => useExports())

    await act(async () => {
      await result.current.pollExportJob(jobId)
    })

    await waitFor(() => {
      expect(result.current.exportJobs).toContainEqual(completedJob)
    })

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Export Complete',
      description: 'Your export is ready for download.',
    })
  })

  it('should handle failed export job', async () => {
    const jobId = 'job-456'
    const failedJob = {
      id: jobId,
      type: 'forms' as const,
      status: 'failed' as const,
      progress: 0,
      createdAt: new Date(),
      error: 'Export processing failed',
      options: { format: 'csv' as const }
    }

    mockExportsApi.getExportJob.mockResolvedValue({
      success: true,
      data: failedJob
    })

    const { result } = renderHook(() => useExports())

    await act(async () => {
      await result.current.pollExportJob(jobId)
    })

    await waitFor(() => {
      expect(result.current.exportJobs).toContainEqual(failedJob)
    })

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Export Failed',
      description: 'Export processing failed',
      variant: 'destructive',
    })
  })
})
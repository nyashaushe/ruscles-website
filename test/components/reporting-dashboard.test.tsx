import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ReportingDashboard } from '@/components/admin/reporting-dashboard'
import { useExports } from '@/hooks/use-exports'

// Mock the useExports hook
vi.mock('@/hooks/use-exports')

const mockUseExports = vi.mocked(useExports)

describe('ReportingDashboard', () => {
  const mockExportsHook = {
    reportMetrics: {
      totalForms: 150,
      formsByStatus: {
        new: 25,
        in_progress: 40,
        responded: 60,
        completed: 25
      },
      formsByPriority: {
        low: 50,
        medium: 70,
        high: 25,
        urgent: 5
      },
      formsByType: {
        contact: 80,
        service_inquiry: 50,
        quote_request: 20
      },
      averageResponseTime: 7200, // 2 hours in seconds
      responseRate: 87.5,
      trendsData: [
        { date: '2024-01-01', submissions: 5, responses: 4 },
        { date: '2024-01-02', submissions: 8, responses: 6 },
        { date: '2024-01-03', submissions: 3, responses: 3 }
      ]
    },
    contentAnalytics: {
      totalPosts: 45,
      publishedPosts: 35,
      draftPosts: 10,
      totalViews: 15000,
      averageViews: 428.6,
      topPerformingPosts: [
        {
          id: '1',
          title: 'HVAC Maintenance Tips',
          views: 2500,
          publishedAt: '2024-01-15T00:00:00Z'
        },
        {
          id: '2',
          title: 'Electrical Safety Guide',
          views: 1800,
          publishedAt: '2024-01-10T00:00:00Z'
        }
      ],
      contentTrends: [
        { date: '2024-01-01', posts: 2, views: 800 },
        { date: '2024-01-02', posts: 1, views: 450 },
        { date: '2024-01-03', posts: 3, views: 1200 }
      ]
    },
    isLoading: false,
    isExporting: false,
    exportJobs: [],
    scheduledReports: [],
    fetchFormMetrics: vi.fn(),
    fetchContentAnalytics: vi.fn(),
    quickExportFormsCSV: vi.fn(),
    quickExportContentCSV: vi.fn(),
    exportForms: vi.fn(),
    exportContent: vi.fn(),
    downloadExport: vi.fn(),
    fetchExportJobs: vi.fn(),
    fetchScheduledReports: vi.fn(),
    createScheduledReport: vi.fn(),
    updateScheduledReport: vi.fn(),
    deleteScheduledReport: vi.fn(),
    runScheduledReport: vi.fn(),
    pollExportJob: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseExports.mockReturnValue(mockExportsHook)
  })

  it('renders dashboard overview correctly', () => {
    render(<ReportingDashboard />)

    // Check main title
    expect(screen.getByText('Reports & Analytics')).toBeInTheDocument()
    expect(screen.getByText('View insights and export data for forms and content')).toBeInTheDocument()

    // Check overview metrics
    expect(screen.getByText('150')).toBeInTheDocument() // Total forms
    expect(screen.getByText('87.5%')).toBeInTheDocument() // Response rate
    expect(screen.getByText('2h')).toBeInTheDocument() // Average response time
    expect(screen.getByText('35')).toBeInTheDocument() // Published content
  })

  it('displays forms analytics correctly', async () => {
    render(<ReportingDashboard />)

    // Switch to forms tab
    const formsTab = screen.getByRole('tab', { name: /forms analytics/i })
    fireEvent.click(formsTab)

    await waitFor(() => {
      // Check forms by status
      expect(screen.getByText('Forms by Status')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument() // New forms count
      expect(screen.getByText('40')).toBeInTheDocument() // In progress count

      // Check forms by priority
      expect(screen.getByText('Forms by Priority')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument() // Low priority count
      expect(screen.getByText('5')).toBeInTheDocument() // Urgent priority count
    })
  })

  it('displays content analytics correctly', async () => {
    render(<ReportingDashboard />)

    // Switch to content tab
    const contentTab = screen.getByRole('tab', { name: /content analytics/i })
    fireEvent.click(contentTab)

    await waitFor(() => {
      // Check content metrics
      expect(screen.getByText('15,000')).toBeInTheDocument() // Total views
      expect(screen.getByText('429')).toBeInTheDocument() // Average views (rounded)
      expect(screen.getByText('10')).toBeInTheDocument() // Draft posts

      // Check top performing posts
      expect(screen.getByText('HVAC Maintenance Tips')).toBeInTheDocument()
      expect(screen.getByText('Electrical Safety Guide')).toBeInTheDocument()
      expect(screen.getByText('2,500')).toBeInTheDocument() // Top post views
    })
  })

  it('handles export actions correctly', async () => {
    render(<ReportingDashboard />)

    // Test forms export
    const exportFormsButton = screen.getByText('Export Forms Data')
    fireEvent.click(exportFormsButton)

    expect(mockExportsHook.quickExportFormsCSV).toHaveBeenCalledWith({
      dateRange: expect.any(Object)
    })

    // Test content export
    const exportContentButton = screen.getByText('Export Content Data')
    fireEvent.click(exportContentButton)

    expect(mockExportsHook.quickExportContentCSV).toHaveBeenCalledWith({
      dateRange: expect.any(Object)
    })
  })

  it('shows loading state correctly', () => {
    mockUseExports.mockReturnValue({
      ...mockExportsHook,
      isLoading: true,
      reportMetrics: null,
      contentAnalytics: null
    })

    render(<ReportingDashboard />)

    expect(screen.getByRole('status')).toBeInTheDocument() // Loading spinner
  })

  it('handles date range changes', async () => {
    render(<ReportingDashboard />)

    // Test period selection
    const periodSelect = screen.getByRole('combobox')
    fireEvent.click(periodSelect)

    const sevenDaysOption = screen.getByText('Last 7 days')
    fireEvent.click(sevenDaysOption)

    await waitFor(() => {
      expect(mockExportsHook.fetchFormMetrics).toHaveBeenCalled()
      expect(mockExportsHook.fetchContentAnalytics).toHaveBeenCalled()
    })
  })

  it('displays export options in exports tab', async () => {
    render(<ReportingDashboard />)

    // Switch to exports tab
    const exportsTab = screen.getByRole('tab', { name: /data exports/i })
    fireEvent.click(exportsTab)

    await waitFor(() => {
      expect(screen.getByText('Export Forms Data')).toBeInTheDocument()
      expect(screen.getByText('Export Content Data')).toBeInTheDocument()
      expect(screen.getByText('Data Backup')).toBeInTheDocument()
      expect(screen.getByText('Full Forms Backup')).toBeInTheDocument()
      expect(screen.getByText('Full Content Backup')).toBeInTheDocument()
    })
  })

  it('disables export buttons when exporting', () => {
    mockUseExports.mockReturnValue({
      ...mockExportsHook,
      isExporting: true
    })

    render(<ReportingDashboard />)

    const exportButtons = screen.getAllByText(/export/i).filter(el => 
      el.tagName === 'BUTTON' || el.closest('button')
    )

    exportButtons.forEach(button => {
      const buttonElement = button.tagName === 'BUTTON' ? button : button.closest('button')
      expect(buttonElement).toBeDisabled()
    })
  })

  it('shows trend indicators correctly', () => {
    render(<ReportingDashboard />)

    // Should show trend indicators for forms and content
    const trendIcons = screen.getAllByTestId(/trending/i)
    expect(trendIcons.length).toBeGreaterThan(0)
  })

  it('handles empty data states', () => {
    mockUseExports.mockReturnValue({
      ...mockExportsHook,
      reportMetrics: {
        ...mockExportsHook.reportMetrics!,
        trendsData: []
      },
      contentAnalytics: {
        ...mockExportsHook.contentAnalytics!,
        topPerformingPosts: []
      }
    })

    render(<ReportingDashboard />)

    // Switch to forms tab to check trends
    const formsTab = screen.getByRole('tab', { name: /forms analytics/i })
    fireEvent.click(formsTab)

    expect(screen.getByText('No trend data available for the selected period')).toBeInTheDocument()

    // Switch to content tab to check top posts
    const contentTab = screen.getByRole('tab', { name: /content analytics/i })
    fireEvent.click(contentTab)

    expect(screen.getByText('No content performance data available')).toBeInTheDocument()
  })
})
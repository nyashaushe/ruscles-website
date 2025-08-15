'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, Download, TrendingUp, TrendingDown, BarChart3, FileText, Users, Clock } from 'lucide-react'
import { format, subDays, subMonths } from 'date-fns'
import { useExports } from '@/hooks/use-exports'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils'

interface DateRange {
  from: Date
  to: Date
}

export function ReportingDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  const {
    reportMetrics,
    contentAnalytics,
    isLoading,
    fetchFormMetrics,
    fetchContentAnalytics,
    quickExportFormsCSV,
    quickExportContentCSV,
    isExporting
  } = useExports()

  useEffect(() => {
    fetchFormMetrics(dateRange)
    fetchContentAnalytics(dateRange)
  }, [dateRange, fetchFormMetrics, fetchContentAnalytics])

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    const now = new Date()
    let from: Date

    switch (period) {
      case '7d':
        from = subDays(now, 7)
        break
      case '30d':
        from = subDays(now, 30)
        break
      case '90d':
        from = subDays(now, 90)
        break
      case '6m':
        from = subMonths(now, 6)
        break
      case '1y':
        from = subMonths(now, 12)
        break
      default:
        from = subDays(now, 30)
    }

    setDateRange({ from, to: now })
  }

  const handleExportForms = async () => {
    try {
      await quickExportFormsCSV({
        dateRange: dateRange
      })
    } catch (error) {
      console.error('Export forms failed:', error)
    }
  }

  const handleExportContent = async () => {
    try {
      await quickExportContentCSV({
        dateRange: dateRange
      })
    } catch (error) {
      console.error('Export content failed:', error)
    }
  }

  const calculateTrend = (data: { date: string; submissions?: number; posts?: number }[]) => {
    if (data.length < 2) return { trend: 0, isPositive: true }
    
    const recent = data.slice(-7).reduce((sum, item) => sum + (item.submissions || item.posts || 0), 0)
    const previous = data.slice(-14, -7).reduce((sum, item) => sum + (item.submissions || item.posts || 0), 0)
    
    if (previous === 0) return { trend: recent > 0 ? 100 : 0, isPositive: true }
    
    const trend = ((recent - previous) / previous) * 100
    return { trend: Math.abs(trend), isPositive: trend >= 0 }
  }

  if (isLoading && !reportMetrics && !contentAnalytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const formsTrend = reportMetrics ? calculateTrend(reportMetrics.trendsData) : { trend: 0, isPositive: true }
  const contentTrend = contentAnalytics ? calculateTrend(contentAnalytics.contentTrends) : { trend: 0, isPositive: true }

  return (
    <div className="space-y-6">
      {/* Header with Date Range and Export Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">
            View insights and export data for forms and content
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to })
                    setSelectedPeriod('custom')
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="forms">Forms Analytics</TabsTrigger>
          <TabsTrigger value="content">Content Analytics</TabsTrigger>
          <TabsTrigger value="exports">Data Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportMetrics?.totalForms || 0}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {formsTrend.isPositive ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  {formsTrend.trend.toFixed(1)}% from last period
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportMetrics?.responseRate ? `${reportMetrics.responseRate.toFixed(1)}%` : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Forms with responses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportMetrics?.averageResponseTime ? `${Math.round(reportMetrics.averageResponseTime / 60)}h` : '0h'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Time to first response
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published Content</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{contentAnalytics?.publishedPosts || 0}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {contentTrend.isPositive ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  {contentTrend.trend.toFixed(1)}% from last period
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Export data and generate reports for the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button 
                onClick={handleExportForms} 
                disabled={isExporting}
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Forms Data
              </Button>
              <Button 
                onClick={handleExportContent} 
                disabled={isExporting}
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Content Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Forms by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportMetrics?.formsByStatus && Object.entries(reportMetrics.formsByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forms by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportMetrics?.formsByPriority && Object.entries(reportMetrics.formsByPriority).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={priority === 'urgent' ? 'destructive' : priority === 'high' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {priority}
                        </Badge>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Form Submission Trends</CardTitle>
              <CardDescription>
                Daily form submissions and responses over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportMetrics?.trendsData && reportMetrics.trendsData.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground mb-4">
                    Showing {reportMetrics.trendsData.length} days of data
                  </div>
                  {/* Simple text-based chart - in a real app you'd use a charting library */}
                  <div className="space-y-1">
                    {reportMetrics.trendsData.slice(-10).map((day, index) => (
                      <div key={day.date} className="flex items-center gap-4 text-sm">
                        <span className="w-20 text-muted-foreground">
                          {format(new Date(day.date), 'MMM dd')}
                        </span>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <div 
                              className="bg-blue-500 h-2 rounded"
                              style={{ width: `${Math.max(day.submissions * 10, 4)}px` }}
                            />
                            <span className="text-xs">{day.submissions} submissions</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div 
                              className="bg-green-500 h-2 rounded"
                              style={{ width: `${Math.max(day.responses * 10, 4)}px` }}
                            />
                            <span className="text-xs">{day.responses} responses</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No trend data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{contentAnalytics?.totalViews?.toLocaleString() || 0}</div>
                <p className="text-sm text-muted-foreground">
                  Across all published content
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{contentAnalytics?.averageViews?.toFixed(0) || 0}</div>
                <p className="text-sm text-muted-foreground">
                  Per published post
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Draft Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{contentAnalytics?.draftPosts || 0}</div>
                <p className="text-sm text-muted-foreground">
                  Unpublished content
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>
                Most viewed posts in the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contentAnalytics?.topPerformingPosts && contentAnalytics.topPerformingPosts.length > 0 ? (
                <div className="space-y-3">
                  {contentAnalytics.topPerformingPosts.map((post, index) => (
                    <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <h4 className="font-medium">{post.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Published {format(new Date(post.publishedAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{post.views.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">views</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No content performance data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Export Forms Data</CardTitle>
                <CardDescription>
                  Download form submissions and responses for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleExportForms} 
                  disabled={isExporting}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isExporting ? 'Exporting...' : 'Export as CSV'}
                </Button>
                <div className="text-sm text-muted-foreground">
                  Includes: Form details, customer information, responses, and metadata
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Content Data</CardTitle>
                <CardDescription>
                  Download content items and analytics for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleExportContent} 
                  disabled={isExporting}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isExporting ? 'Exporting...' : 'Export as CSV'}
                </Button>
                <div className="text-sm text-muted-foreground">
                  Includes: Blog posts, testimonials, portfolio items, and view counts
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Data Backup</CardTitle>
              <CardDescription>
                Create comprehensive backups of all form and content data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2 md:grid-cols-2">
                  <Button variant="outline" disabled={isExporting}>
                    <Download className="mr-2 h-4 w-4" />
                    Full Forms Backup
                  </Button>
                  <Button variant="outline" disabled={isExporting}>
                    <Download className="mr-2 h-4 w-4" />
                    Full Content Backup
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Full backups include all historical data, attachments, and metadata in JSON format
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
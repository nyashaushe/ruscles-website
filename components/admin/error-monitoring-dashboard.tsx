'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  Bug, 
  TrendingUp, 
  Download, 
  Trash2, 
  RefreshCw,
  Clock,
  Globe,
  User,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { getErrorLogs, getErrorStats, clearErrorLogs, ErrorLogEntry } from '@/lib/utils/error-handling'
import { formatDistanceToNow } from 'date-fns'

export function ErrorMonitoringDashboard() {
  const [errorLogs, setErrorLogs] = useState<ErrorLogEntry[]>([])
  const [stats, setStats] = useState<ReturnType<typeof getErrorStats>>({
    total: 0,
    byCategory: {},
    bySeverity: {},
    recent: 0
  })
  const [selectedError, setSelectedError] = useState<ErrorLogEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadErrorData = () => {
    setIsLoading(true)
    try {
      const logs = getErrorLogs()
      const errorStats = getErrorStats()
      
      setErrorLogs(logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
      setStats(errorStats)
    } catch (error) {
      console.error('Failed to load error data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadErrorData()
  }, [])

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all error logs? This action cannot be undone.')) {
      clearErrorLogs()
      loadErrorData()
    }
  }

  const handleExportLogs = () => {
    const dataStr = JSON.stringify(errorLogs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'network': return <Globe className="h-4 w-4" />
      case 'validation': return <CheckCircle className="h-4 w-4" />
      case 'runtime': return <Bug className="h-4 w-4" />
      case 'user': return <User className="h-4 w-4" />
      case 'system': return <AlertTriangle className="h-4 w-4" />
      default: return <XCircle className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading error data...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Error Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor and analyze application errors for better debugging
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadErrorData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleClearLogs} variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent (1h)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bySeverity.critical || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Errors</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byCategory.network || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error Logs */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Errors</TabsTrigger>
          <TabsTrigger value="by-category">By Category</TabsTrigger>
          <TabsTrigger value="by-severity">By Severity</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          {errorLogs.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No errors found</h3>
                  <p className="text-muted-foreground">Your application is running smoothly!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {errorLogs.slice(0, 50).map((error) => (
                <Card 
                  key={error.id} 
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedError?.id === error.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedError(error)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getCategoryIcon(error.category)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getSeverityColor(error.severity) as any}>
                              {error.severity}
                            </Badge>
                            <Badge variant="outline">{error.category}</Badge>
                            {error.status && (
                              <Badge variant="secondary">HTTP {error.status}</Badge>
                            )}
                          </div>
                          <p className="font-medium truncate">{error.message}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{formatDistanceToNow(new Date(error.timestamp))} ago</span>
                            {error.url && (
                              <span className="truncate max-w-xs">{error.url}</span>
                            )}
                            {error.userId && (
                              <span>User: {error.userId}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="by-category" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <Card key={category}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize">
                    {category} Errors
                  </CardTitle>
                  {getCategoryIcon(category)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                  <p className="text-xs text-muted-foreground">
                    {((count / stats.total) * 100).toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="by-severity" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(stats.bySeverity).map(([severity, count]) => (
              <Card key={severity}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize">
                    {severity}
                  </CardTitle>
                  <AlertTriangle className={`h-4 w-4 ${
                    severity === 'critical' ? 'text-red-500' :
                    severity === 'high' ? 'text-orange-500' :
                    severity === 'medium' ? 'text-yellow-500' :
                    'text-gray-500'
                  }`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                  <p className="text-xs text-muted-foreground">
                    {((count / stats.total) * 100).toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Error Details Modal */}
      {selectedError && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Error Details</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedError(null)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>ID:</strong> {selectedError.id}</div>
                  <div><strong>Timestamp:</strong> {new Date(selectedError.timestamp).toLocaleString()}</div>
                  <div><strong>Severity:</strong> 
                    <Badge variant={getSeverityColor(selectedError.severity) as any} className="ml-2">
                      {selectedError.severity}
                    </Badge>
                  </div>
                  <div><strong>Category:</strong> 
                    <Badge variant="outline" className="ml-2">
                      {selectedError.category}
                    </Badge>
                  </div>
                  {selectedError.status && (
                    <div><strong>Status:</strong> {selectedError.status}</div>
                  )}
                  {selectedError.code && (
                    <div><strong>Code:</strong> {selectedError.code}</div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Context</h4>
                <div className="space-y-2 text-sm">
                  {selectedError.url && (
                    <div><strong>URL:</strong> <code className="text-xs">{selectedError.url}</code></div>
                  )}
                  {selectedError.userId && (
                    <div><strong>User ID:</strong> {selectedError.userId}</div>
                  )}
                  {selectedError.sessionId && (
                    <div><strong>Session ID:</strong> {selectedError.sessionId}</div>
                  )}
                  {selectedError.userAgent && (
                    <div><strong>User Agent:</strong> <code className="text-xs">{selectedError.userAgent}</code></div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Error Message</h4>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{selectedError.message}</AlertDescription>
              </Alert>
            </div>

            {selectedError.stack && (
              <div>
                <h4 className="font-medium mb-2">Stack Trace</h4>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                  {selectedError.stack}
                </pre>
              </div>
            )}

            {selectedError.context && (
              <div>
                <h4 className="font-medium mb-2">Additional Context</h4>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                  {JSON.stringify(selectedError.context, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
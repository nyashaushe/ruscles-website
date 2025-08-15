'use client'

import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, CheckCircle, TrendingUp, Flag, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { notificationsApi } from '@/lib/api/notifications'
import { spamDetector } from '@/lib/utils/spam-detection'
import { formatDistanceToNow } from 'date-fns'

interface SpamStats {
  totalSubmissions: number
  spamDetected: number
  spamRate: number
  recentSpamTrends: Array<{ date: string; count: number }>
}

interface FlaggedSubmission {
  id: string
  formType: string
  submittedAt: Date
  spamScore: number
  reasons: string[]
  status: 'pending' | 'confirmed_spam' | 'false_positive'
  customerInfo: {
    name: string
    email: string
  }
}

export function SpamDetectionDashboard() {
  const [stats, setStats] = useState<SpamStats | null>(null)
  const [flaggedSubmissions, setFlaggedSubmissions] = useState<FlaggedSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSpamData()
  }, [])

  const loadSpamData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [statsResponse] = await Promise.all([
        notificationsApi.getSpamStats()
      ])

      if (statsResponse.success) {
        setStats(statsResponse.data)
      }

      // Mock flagged submissions for demo
      setFlaggedSubmissions([
        {
          id: '1',
          formType: 'contact',
          submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          spamScore: 85,
          reasons: ['Contains suspicious keywords: casino, free money', 'Too many links'],
          status: 'pending',
          customerInfo: {
            name: 'John Doe',
            email: 'john@tempmail.org'
          }
        },
        {
          id: '2',
          formType: 'service_inquiry',
          submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          spamScore: 72,
          reasons: ['Honeypot field was filled', 'Form submitted too quickly'],
          status: 'pending',
          customerInfo: {
            name: 'Jane Smith',
            email: 'jane@example.com'
          }
        }
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load spam data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFlagAsSpam = async (submissionId: string) => {
    try {
      await spamDetector.flagAsSpam(submissionId, 'Confirmed spam by admin')
      setFlaggedSubmissions(prev =>
        prev.map(submission =>
          submission.id === submissionId
            ? { ...submission, status: 'confirmed_spam' as const }
            : submission
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to flag as spam')
    }
  }

  const handleMarkAsFalsePositive = (submissionId: string) => {
    setFlaggedSubmissions(prev =>
      prev.map(submission =>
        submission.id === submissionId
          ? { ...submission, status: 'false_positive' as const }
          : submission
      )
    )
  }

  const getSpamScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600'
    if (score >= 60) return 'text-orange-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getSpamScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'destructive'
    if (score >= 60) return 'destructive'
    if (score >= 40) return 'secondary'
    return 'outline'
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading spam detection data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-600">{error}</p>
        <Button onClick={loadSpamData} variant="outline" size="sm" className="mt-2">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSubmissions || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spam Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.spamDetected || 0}</div>
            <p className="text-xs text-muted-foreground">Blocked submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spam Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.spamRate?.toFixed(1) || 0}%</div>
            <Progress value={stats?.spamRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clean Submissions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats ? stats.totalSubmissions - stats.spamDetected : 0}
            </div>
            <p className="text-xs text-muted-foreground">Legitimate inquiries</p>
          </CardContent>
        </Card>
      </div>

      {/* Flagged Submissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flag className="h-5 w-5" />
            <span>Flagged Submissions</span>
            <Badge variant="secondary">{flaggedSubmissions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">
                Pending Review ({flaggedSubmissions.filter(s => s.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="confirmed">
                Confirmed Spam ({flaggedSubmissions.filter(s => s.status === 'confirmed_spam').length})
              </TabsTrigger>
              <TabsTrigger value="false_positive">
                False Positives ({flaggedSubmissions.filter(s => s.status === 'false_positive').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {flaggedSubmissions
                    .filter(submission => submission.status === 'pending')
                    .map(submission => (
                      <Card key={submission.id} className="border-orange-200 bg-orange-50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline">{submission.formType}</Badge>
                                <Badge variant={getSpamScoreBadgeVariant(submission.spamScore)}>
                                  {submission.spamScore}% spam
                                </Badge>
                              </div>
                              
                              <h4 className="font-medium">{submission.customerInfo.name}</h4>
                              <p className="text-sm text-gray-600">{submission.customerInfo.email}</p>
                              
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Spam indicators:</p>
                                <ul className="text-xs text-red-600 space-y-1">
                                  {submission.reasons.map((reason, index) => (
                                    <li key={index}>• {reason}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <p className="text-xs text-gray-500 mt-2">
                                {formatDistanceToNow(submission.submittedAt, { addSuffix: true })}
                              </p>
                            </div>
                            
                            <div className="flex flex-col space-y-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {/* View details */}}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleFlagAsSpam(submission.id)}
                              >
                                <Flag className="h-4 w-4 mr-1" />
                                Confirm Spam
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsFalsePositive(submission.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Not Spam
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  
                  {flaggedSubmissions.filter(s => s.status === 'pending').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>No pending submissions to review</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="confirmed" className="mt-4">
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {flaggedSubmissions
                    .filter(submission => submission.status === 'confirmed_spam')
                    .map(submission => (
                      <Card key={submission.id} className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant="destructive">Confirmed Spam</Badge>
                                <Badge variant="outline">{submission.formType}</Badge>
                              </div>
                              <p className="text-sm font-medium">{submission.customerInfo.name}</p>
                              <p className="text-xs text-gray-600">{submission.customerInfo.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-red-600">
                                {submission.spamScore}% spam
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDistanceToNow(submission.submittedAt, { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="false_positive" className="mt-4">
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {flaggedSubmissions
                    .filter(submission => submission.status === 'false_positive')
                    .map(submission => (
                      <Card key={submission.id} className="border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant="outline" className="border-green-500 text-green-700">
                                  False Positive
                                </Badge>
                                <Badge variant="outline">{submission.formType}</Badge>
                              </div>
                              <p className="text-sm font-medium">{submission.customerInfo.name}</p>
                              <p className="text-xs text-gray-600">{submission.customerInfo.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-green-600">Legitimate</p>
                              <p className="text-xs text-gray-500">
                                {formatDistanceToNow(submission.submittedAt, { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
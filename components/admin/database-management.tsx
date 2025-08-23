'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Database, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'

interface DatabaseStats {
    users: number
    forms: number
    content: number
    testimonials: number
    portfolio: number
}

interface DatabaseHealth {
    status: 'healthy' | 'error'
    message: string
    timestamp: string
    stats: DatabaseStats | null
}

export function DatabaseManagement() {
    const [health, setHealth] = useState<DatabaseHealth | null>(null)
    const [loading, setLoading] = useState(false)
    const [seeding, setSeeding] = useState(false)
    const [resetting, setResetting] = useState(false)

    const checkHealth = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/db/health')
            const data = await response.json()
            setHealth(data)
        } catch (error) {
            setHealth({
                status: 'error',
                message: 'Failed to check database health',
                timestamp: new Date().toISOString(),
                stats: null,
            })
        } finally {
            setLoading(false)
        }
    }

    const seedDatabase = async () => {
        setSeeding(true)
        try {
            const response = await fetch('/api/db/seed', { method: 'POST' })
            const data = await response.json()
            if (data.status === 'success') {
                await checkHealth() // Refresh health data
            }
        } catch (error) {
            console.error('Failed to seed database:', error)
        } finally {
            setSeeding(false)
        }
    }

    const resetDatabase = async () => {
        if (!confirm('Are you sure you want to reset the database? This will delete all data!')) {
            return
        }

        setResetting(true)
        try {
            const response = await fetch('/api/db/reset', { method: 'POST' })
            const data = await response.json()
            if (data.status === 'success') {
                await checkHealth() // Refresh health data
            }
        } catch (error) {
            console.error('Failed to reset database:', error)
        } finally {
            setResetting(false)
        }
    }

    useEffect(() => {
        checkHealth()
    }, [])

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Database Management
                    </CardTitle>
                    <CardDescription>
                        Monitor database health and manage data operations
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Health Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Status:</span>
                            {health ? (
                                <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
                                    {health.status === 'healthy' ? (
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                    ) : (
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                    )}
                                    {health.status}
                                </Badge>
                            ) : (
                                <Badge variant="secondary">Unknown</Badge>
                            )}
                        </div>
                        <Button
                            onClick={checkHealth}
                            disabled={loading}
                            size="sm"
                            variant="outline"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                            Refresh
                        </Button>
                    </div>

                    {/* Health Message */}
                    {health && (
                        <Alert>
                            <AlertDescription>
                                {health.message}
                                {health.timestamp && (
                                    <span className="block text-xs text-muted-foreground mt-1">
                                        Last checked: {new Date(health.timestamp).toLocaleString()}
                                    </span>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Database Stats */}
                    {health?.stats && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{health.stats.users}</div>
                                <div className="text-xs text-muted-foreground">Users</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{health.stats.forms}</div>
                                <div className="text-xs text-muted-foreground">Forms</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{health.stats.content}</div>
                                <div className="text-xs text-muted-foreground">Content</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{health.stats.testimonials}</div>
                                <div className="text-xs text-muted-foreground">Testimonials</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{health.stats.portfolio}</div>
                                <div className="text-xs text-muted-foreground">Portfolio</div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                        <Button
                            onClick={seedDatabase}
                            disabled={seeding}
                            variant="outline"
                        >
                            {seeding ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Database className="h-4 w-4 mr-2" />
                            )}
                            Seed Database
                        </Button>
                        <Button
                            onClick={resetDatabase}
                            disabled={resetting}
                            variant="destructive"
                        >
                            {resetting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 mr-2" />
                            )}
                            Reset Database
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

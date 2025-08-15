'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReportingDashboard } from '@/components/admin/reporting-dashboard'
import { ScheduledReports } from '@/components/admin/scheduled-reports'
import { BarChart3, Calendar, Download } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="exports" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Data Exports
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Scheduled Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ReportingDashboard />
        </TabsContent>

        <TabsContent value="exports">
          <ReportingDashboard />
        </TabsContent>

        <TabsContent value="scheduled">
          <ScheduledReports />
        </TabsContent>
      </Tabs>
    </div>
  )
}
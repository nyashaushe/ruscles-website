"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, MessageSquare, FileText, Database, Zap } from "lucide-react"
import Link from "next/link"

export function IntegrationStatus() {
  const integrationFeatures = [
    {
      title: "Unified Dashboard Statistics",
      description: "Combined metrics from both forms and inquiries",
      status: "active",
      icon: Database
    },
    {
      title: "Cross-System Navigation",
      description: "Easy switching between forms and inquiries",
      status: "active",
      icon: ArrowRight
    },
    {
      title: "Unified Activity Feed",
      description: "Recent activity from all submission channels",
      status: "active",
      icon: Zap
    },
    {
      title: "Consistent Data Flow",
      description: "Standardized data handling across systems",
      status: "active",
      icon: CheckCircle
    }
  ]

  const systemConnections = [
    {
      from: "Forms System",
      to: "Inquiries System",
      description: "Shared navigation and statistics",
      icon: FileText,
      targetIcon: MessageSquare,
      links: [
        { label: "View Forms", href: "/admin/forms" },
        { label: "View Inquiries", href: "/admin/inquiries" }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Integration Status
          </CardTitle>
          <CardDescription>
            Forms management system successfully integrated with existing inquiries system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrationFeatures.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  <feature.icon className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{feature.title}</h4>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {feature.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Connections</CardTitle>
          <CardDescription>How the forms and inquiries systems work together</CardDescription>
        </CardHeader>
        <CardContent>
          {systemConnections.map((connection, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <connection.icon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{connection.from}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className="flex items-center gap-2">
                  <connection.targetIcon className="h-5 w-5 text-green-600" />
                  <span className="font-medium">{connection.to}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {connection.links.map((link) => (
                  <Button key={link.label} asChild variant="outline" size="sm">
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}
              </div>
            </div>
          ))}
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Integration Benefits</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Unified view of all customer submissions</li>
              <li>• Consistent workflow across both systems</li>
              <li>• Shared statistics and reporting</li>
              <li>• Easy navigation between related items</li>
              <li>• Centralized notification system</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
/**
 * Mobile-optimized form details component
 */

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    User,
    Mail,
    Phone,
    Building,
    Calendar,
    MessageSquare,
    Clock,
    ExternalLink
} from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "@/components/ui/status-badge"
import { PriorityBadge } from "@/components/ui/priority-badge"
import { formatRelativeTime, formatFormType } from "@/lib/utils"
import type { FormSubmission } from "@/lib/types"

interface MobileFormDetailsProps {
    form: FormSubmission
}

export function MobileFormDetails({ form }: MobileFormDetailsProps) {
    return (
        <div className="md:hidden space-y-4">
            {/* Header Card */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1 min-w-0 flex-1">
                            <CardTitle className="text-lg truncate">{form.customerInfo.name}</CardTitle>
                            <CardDescription className="text-sm truncate">
                                {form.customerInfo.email}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0 ml-3">
                            <StatusBadge status={form.status} />
                            <PriorityBadge priority={form.priority} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatRelativeTime(form.submittedAt)}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            {formatFormType(form.type)}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Contact Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <a
                            href={`mailto:${form.customerInfo.email}`}
                            className="text-blue-600 hover:underline text-sm truncate flex-1"
                        >
                            {form.customerInfo.email}
                        </a>
                        <ExternalLink className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    </div>

                    {form.customerInfo.phone && (
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <a
                                href={`tel:${form.customerInfo.phone}`}
                                className="text-blue-600 hover:underline text-sm truncate flex-1"
                            >
                                {form.customerInfo.phone}
                            </a>
                            <ExternalLink className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        </div>
                    )}

                    {form.customerInfo.company && (
                        <div className="flex items-center gap-3">
                            <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-900 truncate flex-1">
                                {form.customerInfo.company}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Message Content */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Message
                    </CardTitle>
                    {form.subject && (
                        <CardDescription className="text-sm font-medium text-gray-900">
                            {form.subject}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                            {form.message}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Additional Information */}
            {form.formData && Object.keys(form.formData).length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Object.entries(form.formData).map(([key, value]) => (
                            <div key={key} className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </label>
                                <p className="text-sm text-gray-900">{String(value)}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Metadata */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Submitted
                        </span>
                        <span className="text-sm text-gray-900">
                            {new Date(form.submittedAt).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Form ID
                        </span>
                        <span className="text-sm text-gray-900 font-mono">
                            {form.id.slice(-8)}
                        </span>
                    </div>

                    {form.assignedTo && (
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                Assigned To
                            </span>
                            <span className="text-sm text-gray-900">
                                {form.assignedTo}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
                <Button asChild className="touch-manipulation">
                    <Link href={`/admin/forms/${form.id}/respond`}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Respond
                    </Link>
                </Button>
                <Button variant="outline" asChild className="touch-manipulation">
                    <Link href={`/admin/forms/${form.id}`}>
                        View Full Details
                    </Link>
                </Button>
            </div>
        </div>
    )
}
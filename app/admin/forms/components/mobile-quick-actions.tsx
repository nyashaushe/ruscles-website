/**
 * Mobile-optimized quick actions for forms
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    MoreHorizontal,
    MessageSquare,
    User,
    Archive,
    CheckCircle,
    Clock,
    AlertTriangle,
    Trash2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { FormSubmission } from "@/lib/types"

interface MobileQuickActionsProps {
    selectedFormIds: string[]
    onBulkUpdate?: (updates: Partial<FormSubmission>, formIds: string[]) => Promise<void>
    onClearSelection: () => void
}

export function MobileQuickActions({
    selectedFormIds,
    onBulkUpdate,
    onClearSelection
}: MobileQuickActionsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [updating, setUpdating] = useState(false)
    const { toast } = useToast()

    const handleBulkAction = async (action: string, updates: Partial<FormSubmission>) => {
        if (!onBulkUpdate || selectedFormIds.length === 0) return

        try {
            setUpdating(true)
            await onBulkUpdate(updates, selectedFormIds)

            toast({
                title: "✅ Action Completed",
                description: `Successfully updated ${selectedFormIds.length} form(s)`,
            })

            onClearSelection()
            setIsOpen(false)
        } catch (error) {
            toast({
                title: "❌ Action Failed",
                description: "Failed to update forms. Please try again.",
                variant: "destructive",
            })
        } finally {
            setUpdating(false)
        }
    }

    if (selectedFormIds.length === 0) {
        return null
    }

    return (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-sm">
                            {selectedFormIds.length} selected
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearSelection}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            Clear
                        </Button>
                    </div>

                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button size="sm" className="touch-manipulation">
                                <MoreHorizontal className="h-4 w-4 mr-2" />
                                Actions
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[60vh]">
                            <SheetHeader>
                                <SheetTitle>Bulk Actions</SheetTitle>
                                <SheetDescription>
                                    Apply actions to {selectedFormIds.length} selected form(s)
                                </SheetDescription>
                            </SheetHeader>

                            <div className="mt-6 space-y-4">
                                {/* Status Updates */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-gray-900">Update Status</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleBulkAction('status', { status: 'in_progress' })}
                                            disabled={updating}
                                            className="justify-start touch-manipulation"
                                        >
                                            <Clock className="h-4 w-4 mr-2 text-orange-500" />
                                            In Progress
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleBulkAction('status', { status: 'completed' })}
                                            disabled={updating}
                                            className="justify-start touch-manipulation"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                            Completed
                                        </Button>
                                    </div>
                                </div>

                                {/* Priority Updates */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-gray-900">Update Priority</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleBulkAction('priority', { priority: 'high' })}
                                            disabled={updating}
                                            className="justify-start touch-manipulation"
                                        >
                                            <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                                            High Priority
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleBulkAction('priority', { priority: 'medium' })}
                                            disabled={updating}
                                            className="justify-start touch-manipulation"
                                        >
                                            <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                                            Medium Priority
                                        </Button>
                                    </div>
                                </div>

                                {/* Assignment */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-gray-900">Assignment</h3>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleBulkAction('assign', { assignedTo: 'Current User' })}
                                        disabled={updating}
                                        className="w-full justify-start touch-manipulation"
                                    >
                                        <User className="h-4 w-4 mr-2 text-blue-500" />
                                        Assign to Me
                                    </Button>
                                </div>

                                {/* Other Actions */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-gray-900">Other Actions</h3>
                                    <div className="space-y-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleBulkAction('archive', { archived: true })}
                                            disabled={updating}
                                            className="w-full justify-start touch-manipulation"
                                        >
                                            <Archive className="h-4 w-4 mr-2 text-gray-500" />
                                            Archive Forms
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleBulkAction('delete', {})}
                                            disabled={updating}
                                            className="w-full justify-start text-red-600 hover:text-red-700 touch-manipulation"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Forms
                                        </Button>
                                    </div>
                                </div>

                                {/* Cancel Button */}
                                <div className="pt-4 border-t">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full touch-manipulation"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </div>
    )
}
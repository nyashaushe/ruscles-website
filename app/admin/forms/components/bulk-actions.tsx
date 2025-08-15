"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Archive, 
  UserCheck, 
  MessageSquare, 
  Tag,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import type { FormSubmission } from "@/lib/types"

interface BulkActionsProps {
  selectedFormIds: string[]
  onBulkUpdate: (updates: Partial<FormSubmission>, formIds: string[]) => Promise<void>
  onClearSelection: () => void
}

export function BulkActions({ selectedFormIds, onBulkUpdate, onClearSelection }: BulkActionsProps) {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [selectedStatus, setSelectedStatus] = useState<FormSubmission['status']>('in_progress')
  const [assignTo, setAssignTo] = useState('')
  const [newTags, setNewTags] = useState('')
  const [archiveReason, setArchiveReason] = useState('')

  const handleBulkStatusUpdate = async () => {
    setIsLoading(true)
    try {
      await onBulkUpdate({ status: selectedStatus }, selectedFormIds)
      setIsStatusDialogOpen(false)
      onClearSelection()
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkAssign = async () => {
    if (!assignTo.trim()) return
    
    setIsLoading(true)
    try {
      await onBulkUpdate({ assignedTo: assignTo }, selectedFormIds)
      setIsAssignDialogOpen(false)
      setAssignTo('')
      onClearSelection()
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkTag = async () => {
    if (!newTags.trim()) return
    
    const tags = newTags.split(',').map(tag => tag.trim()).filter(Boolean)
    
    setIsLoading(true)
    try {
      await onBulkUpdate({ tags }, selectedFormIds)
      setIsTagDialogOpen(false)
      setNewTags('')
      onClearSelection()
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkArchive = async () => {
    setIsLoading(true)
    try {
      await onBulkUpdate({ 
        status: 'archived',
        notes: archiveReason ? `Archived: ${archiveReason}` : 'Archived via bulk action'
      }, selectedFormIds)
      setIsArchiveDialogOpen(false)
      setArchiveReason('')
      onClearSelection()
    } finally {
      setIsLoading(false)
    }
  }

  if (selectedFormIds.length === 0) return null

  return (
    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-blue-600" />
        <span className="text-sm text-blue-700 font-medium">
          {selectedFormIds.length} form{selectedFormIds.length === 1 ? '' : 's'} selected
        </span>
      </div>
      
      <div className="flex items-center gap-2 ml-auto">
        {/* Status Update */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <CheckCircle className="h-4 w-4 mr-1" />
              Update Status
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Status</DialogTitle>
              <DialogDescription>
                Change the status for {selectedFormIds.length} selected form{selectedFormIds.length === 1 ? '' : 's'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>New Status</Label>
                <Select value={selectedStatus} onValueChange={(value: FormSubmission['status']) => setSelectedStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkStatusUpdate} disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Status'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <UserCheck className="h-4 w-4 mr-1" />
              Assign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Forms</DialogTitle>
              <DialogDescription>
                Assign {selectedFormIds.length} selected form{selectedFormIds.length === 1 ? '' : 's'} to a team member
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select value={assignTo} onValueChange={setAssignTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin User</SelectItem>
                    <SelectItem value="john_doe">John Doe</SelectItem>
                    <SelectItem value="jane_smith">Jane Smith</SelectItem>
                    <SelectItem value="mike_wilson">Mike Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkAssign} disabled={isLoading || !assignTo}>
                {isLoading ? 'Assigning...' : 'Assign Forms'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Tags */}
        <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Tag className="h-4 w-4 mr-1" />
              Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Tags</DialogTitle>
              <DialogDescription>
                Add tags to {selectedFormIds.length} selected form{selectedFormIds.length === 1 ? '' : 's'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Textarea
                  placeholder="urgent, follow-up, electrical, etc."
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  rows={3}
                />
                <div className="text-xs text-gray-500">
                  Separate multiple tags with commas
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkTag} disabled={isLoading || !newTags.trim()}>
                {isLoading ? 'Adding Tags...' : 'Add Tags'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Archive */}
        <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Archive className="h-4 w-4 mr-1" />
              Archive
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Archive Forms</DialogTitle>
              <DialogDescription>
                Archive {selectedFormIds.length} selected form{selectedFormIds.length === 1 ? '' : 's'}. 
                Archived forms can be restored later if needed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Reason for archiving (optional)</Label>
                <Textarea
                  placeholder="Reason for archiving these forms..."
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">
                  Archived forms will be moved out of the active list but can be restored later.
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsArchiveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkArchive} disabled={isLoading} variant="destructive">
                {isLoading ? 'Archiving...' : 'Archive Forms'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear Selection */}
        <Button size="sm" variant="ghost" onClick={onClearSelection}>
          Clear Selection
        </Button>
      </div>
    </div>
  )
}
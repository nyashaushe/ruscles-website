import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  User,
  Calendar,
  AlertCircle
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { cn } from "@/lib/utils"

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested'

export interface ApprovalRequest {
  id: string
  contentId: string
  contentTitle: string
  contentType: 'blog_post' | 'testimonial' | 'portfolio_item' | 'page_content'
  requestedBy: string
  requestedAt: Date
  status: ApprovalStatus
  reviewedBy?: string
  reviewedAt?: Date
  comments?: string
  changes?: ApprovalChange[]
}

export interface ApprovalChange {
  id: string
  timestamp: Date
  user: string
  action: 'requested' | 'approved' | 'rejected' | 'changes_requested' | 'resubmitted'
  comment?: string
}

interface ApprovalWorkflowProps {
  request: ApprovalRequest
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove: (comment?: string) => Promise<void>
  onReject: (comment: string) => Promise<void>
  onRequestChanges: (comment: string) => Promise<void>
  currentUser: string
  loading?: boolean
}

const statusConfig = {
  pending: {
    label: 'Pending Review',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
  changes_requested: {
    label: 'Changes Requested',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertCircle,
  },
}

export function ApprovalWorkflow({
  request,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onRequestChanges,
  currentUser,
  loading = false,
}: ApprovalWorkflowProps) {
  const [comment, setComment] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const config = statusConfig[request.status]
  const Icon = config.icon

  const handleAction = async (action: 'approve' | 'reject' | 'changes', comment?: string) => {
    setActionLoading(action)
    try {
      switch (action) {
        case 'approve':
          await onApprove(comment)
          break
        case 'reject':
          if (comment) await onReject(comment)
          break
        case 'changes':
          if (comment) await onRequestChanges(comment)
          break
      }
      setComment('')
      onOpenChange(false)
    } finally {
      setActionLoading(null)
    }
  }

  const canTakeAction = request.status === 'pending' && request.requestedBy !== currentUser

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            Approval Request
          </DialogTitle>
          <DialogDescription>
            Review and approve content changes for publication.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-6">
            {/* Request Details */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{request.contentTitle}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Requested by {request.requestedBy}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(request.requestedAt, { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <Badge className={cn(config.color, 'border')} variant="outline">
                  <Icon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
              </div>

              <div className="text-sm">
                <span className="font-medium">Content Type:</span>{' '}
                <span className="capitalize">{request.contentType.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Current Review Status */}
            {request.reviewedBy && request.reviewedAt && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">
                    {request.status === 'approved' ? 'Approved' : 
                     request.status === 'rejected' ? 'Rejected' : 'Changes Requested'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    by {request.reviewedBy} {formatDistanceToNow(request.reviewedAt, { addSuffix: true })}
                  </span>
                </div>
                {request.comments && (
                  <p className="text-sm text-muted-foreground">{request.comments}</p>
                )}
              </div>
            )}

            {/* Change History */}
            {request.changes && request.changes.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Activity History
                </h4>
                <div className="space-y-3">
                  {request.changes.map((change, index) => (
                    <div key={change.id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {change.user.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{change.user}</span>
                          <span className="text-muted-foreground">
                            {change.action.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(change.timestamp, "MMM d, h:mm a")}
                          </span>
                        </div>
                        {change.comment && (
                          <p className="text-sm text-muted-foreground">{change.comment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Section */}
            {canTakeAction && (
              <>
                <Separator />
                <div className="space-y-4">
                  <Label htmlFor="comment">Review Comment (optional)</Label>
                  <Textarea
                    id="comment"
                    placeholder="Add a comment about your review decision..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {canTakeAction ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading || actionLoading !== null}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction('changes', comment)}
                disabled={loading || actionLoading !== null || !comment.trim()}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                {actionLoading === 'changes' ? 'Requesting...' : 'Request Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction('reject', comment)}
                disabled={loading || actionLoading !== null || !comment.trim()}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                {actionLoading === 'reject' ? 'Rejecting...' : 'Reject'}
              </Button>
              <Button
                onClick={() => handleAction('approve', comment)}
                disabled={loading || actionLoading !== null}
                className="bg-green-600 hover:bg-green-700"
              >
                {actionLoading === 'approve' ? 'Approving...' : 'Approve'}
              </Button>
            </>
          ) : (
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
  
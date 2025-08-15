import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, ChevronDown, Clock, Eye, EyeOff, Archive } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

export type ContentStatus = 'draft' | 'published' | 'scheduled' | 'archived' | 'pending_approval'

interface ContentStatusBadgeProps {
  status: ContentStatus
  scheduledFor?: Date
  publishedAt?: Date
  className?: string
  showDropdown?: boolean
  onStatusChange?: (status: ContentStatus) => void
  onSchedule?: () => void
  onPublish?: () => void
  onUnpublish?: () => void
  onArchive?: () => void
  disabled?: boolean
}

const statusConfig = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: null,
  },
  published: {
    label: 'Published',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: Eye,
  },
  scheduled: {
    label: 'Scheduled',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Calendar,
  },
  archived: {
    label: 'Archived',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: Archive,
  },
  pending_approval: {
    label: 'Pending Approval',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
}

export function ContentStatusBadge({
  status,
  scheduledFor,
  publishedAt,
  className,
  showDropdown = false,
  onStatusChange,
  onSchedule,
  onPublish,
  onUnpublish,
  onArchive,
  disabled = false,
}: ContentStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  const getStatusText = () => {
    if (status === 'scheduled' && scheduledFor) {
      return `Scheduled for ${formatDistanceToNow(scheduledFor, { addSuffix: true })}`
    }
    if (status === 'published' && publishedAt) {
      return `Published ${formatDistanceToNow(publishedAt, { addSuffix: true })}`
    }
    return config.label
  }

  if (!showDropdown) {
    return (
      <Badge 
        className={cn(config.color, 'border', className)}
        variant="outline"
      >
        {Icon && <Icon className="w-3 h-3 mr-1" />}
        {getStatusText()}
      </Badge>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            config.color,
            'border h-6 px-2 text-xs font-medium',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          disabled={disabled}
        >
          {Icon && <Icon className="w-3 h-3 mr-1" />}
          {getStatusText()}
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {status === 'draft' && (
          <>
            <DropdownMenuItem onClick={onPublish}>
              <Eye className="w-4 h-4 mr-2" />
              Publish Now
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSchedule}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule for Later
            </DropdownMenuItem>
          </>
        )}
        
        {status === 'published' && (
          <>
            <DropdownMenuItem onClick={onUnpublish}>
              <EyeOff className="w-4 h-4 mr-2" />
              Unpublish
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSchedule}>
              <Calendar className="w-4 h-4 mr-2" />
              Reschedule
            </DropdownMenuItem>
          </>
        )}
        
        {status === 'scheduled' && (
          <>
            <DropdownMenuItem onClick={onPublish}>
              <Eye className="w-4 h-4 mr-2" />
              Publish Now
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange?.('draft')}>
              <Clock className="w-4 h-4 mr-2" />
              Save as Draft
            </DropdownMenuItem>
          </>
        )}
        
        {status !== 'archived' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onArchive}>
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </DropdownMenuItem>
          </>
        )}
        
        {status === 'archived' && (
          <DropdownMenuItem onClick={() => onStatusChange?.('draft')}>
            <Clock className="w-4 h-4 mr-2" />
            Restore to Draft
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
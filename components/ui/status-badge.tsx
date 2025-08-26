import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status = 'new' | 'in_progress' | 'responded' | 'completed' | 'archived'

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    new: {
      label: 'New',
      variant: 'default' as const,
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-100'
    },
    in_progress: {
      label: 'In Progress', 
      variant: 'secondary' as const,
      className: 'bg-orange-100 text-orange-800 hover:bg-orange-100'
    },
    responded: {
      label: 'Responded',
      variant: 'secondary' as const,
      className: 'bg-green-100 text-green-800 hover:bg-green-100'
    },
    completed: {
      label: 'Completed',
      variant: 'secondary' as const,
      className: 'bg-green-100 text-green-800 hover:bg-green-100'
    },
    archived: {
      label: 'Archived',
      variant: 'outline' as const,
      className: 'bg-gray-100 text-gray-600 hover:bg-gray-100'
    }
  }

  const config = statusConfig[status] || statusConfig.new

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Priority = 'low' | 'medium' | 'high' | 'urgent'

interface PriorityBadgeProps {
  priority: Priority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const priorityConfig = {
    low: {
      label: 'Low',
      variant: 'outline' as const,
      className: 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-50'
    },
    medium: {
      label: 'Medium',
      variant: 'secondary' as const,
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
    },
    high: {
      label: 'High',
      variant: 'secondary' as const,
      className: 'bg-orange-100 text-orange-800 hover:bg-orange-100'
    },
    urgent: {
      label: 'Urgent',
      variant: 'destructive' as const,
      className: 'bg-red-100 text-red-800 hover:bg-red-100'
    }
  }

  const config = priorityConfig[priority] || priorityConfig.medium

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
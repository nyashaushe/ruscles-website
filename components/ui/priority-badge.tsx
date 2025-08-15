import { Badge } from "@/components/ui/badge"
import { getPriorityColor } from "@/lib/utils/formatting"
import { cn } from "@/lib/utils"

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent'
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge 
      className={cn(getPriorityColor(priority), className)}
      variant="secondary"
    >
      {priority}
    </Badge>
  )
}
import { Badge } from "@/components/ui/badge"
import { getStatusColor } from "@/lib/utils/formatting"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge 
      className={cn(getStatusColor(status), className)}
      variant="secondary"
    >
      {status.replace('_', ' ').replace('-', ' ')}
    </Badge>
  )
}
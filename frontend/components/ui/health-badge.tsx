import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { HealthLevel } from "@/lib/store"

interface HealthBadgeProps {
  level: HealthLevel
  healthFactor: number
  className?: string
}

const healthConfig = {
  Healthy: {
    className: "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20",
    label: "Saludable",
  },
  Warning: {
    className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20",
    label: "Precaución",
  },
  Critical: {
    className: "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20",
    label: "Crítico",
  },
}

export function HealthBadge({ level, healthFactor, className }: HealthBadgeProps) {
  const config = healthConfig[level]

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label} ({healthFactor.toFixed(2)})
    </Badge>
  )
}

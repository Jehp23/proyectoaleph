import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { RiskLevel } from "@/lib/store"

interface RiskBadgeProps {
  level: RiskLevel
  className?: string
}

const riskConfig = {
  Bajo: {
    className: "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20",
    label: "Bajo",
  },
  Medio: {
    className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20",
    label: "Medio",
  },
  Alto: {
    className: "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20",
    label: "Alto",
  },
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const config = riskConfig[level]

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  className?: string
  trend?: "up" | "down" | "neutral"
}

export function KpiCard({ title, value, subtitle, className, trend }: KpiCardProps) {
  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-muted-foreground",
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className={cn("text-xs mt-1", trend ? trendColors[trend] : "text-muted-foreground")}>{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

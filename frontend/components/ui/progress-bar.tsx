"use client"

import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  max: number
  className?: string
  label?: string
  showPercentage?: boolean
}

export function ProgressBar({ value, max, className, label, showPercentage = true }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && <span className="font-medium">{percentage.toFixed(1)}%</span>}
        </div>
      )}
      <div
        className="h-2 bg-muted rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

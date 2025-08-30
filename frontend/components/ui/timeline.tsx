import { cn } from "@/lib/utils"
import { Check, Clock, X } from "lucide-react"
import type { LoanStatus } from "@/lib/store"

interface TimelineProps {
  currentStatus: LoanStatus
  className?: string
}

const timelineSteps = [
  { status: "Requested", label: "Solicitado", icon: Clock },
  { status: "Active", label: "Activo", icon: Clock },
  { status: "Repaid", label: "Pagado", icon: Check },
  { status: "Settled", label: "Cerrado", icon: Check },
]

const statusOrder: Record<LoanStatus, number> = {
  Requested: 0,
  Active: 1,
  Repaid: 2,
  Defaulted: 2, // Same level as Repaid but different path
  Settled: 3,
}

export function Timeline({ currentStatus, className }: TimelineProps) {
  const currentStep = statusOrder[currentStatus]
  const isDefaulted = currentStatus === "Defaulted"

  return (
    <div className={cn("flex items-center space-x-4", className)}>
      {timelineSteps.map((step, index) => {
        const isCompleted = index < currentStep || (index === currentStep && currentStatus !== "Requested")
        const isCurrent = index === currentStep
        const isDefaultedStep = isDefaulted && index === 2

        const IconComponent = isDefaultedStep ? X : step.icon

        return (
          <div key={step.status} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted || isCurrent
                    ? isDefaultedStep
                      ? "border-red-500 bg-red-500 text-white"
                      : "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground bg-background text-muted-foreground",
                )}
              >
                <IconComponent className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "mt-2 text-xs text-center",
                  isCurrent ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {isDefaultedStep ? "En mora" : step.label}
              </span>
            </div>
            {index < timelineSteps.length - 1 && (
              <div
                className={cn("h-0.5 w-12 transition-colors", isCompleted ? "bg-primary" : "bg-muted-foreground/30")}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

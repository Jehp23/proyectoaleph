"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface LtvSliderProps {
  value: number
  onChange: (value: number) => void
  maxLtv?: number
  className?: string
  disabled?: boolean
}

export function LtvSlider({ value, onChange, maxLtv = 75, className, disabled }: LtvSliderProps) {
  const getColorClass = (ltv: number) => {
    if (ltv <= 50) return "text-green-500"
    if (ltv <= 65) return "text-yellow-500"
    return "text-red-500"
  }

  const getSliderClass = (ltv: number) => {
    if (ltv <= 50) return "[&_[role=slider]]:border-green-500 [&_[data-orientation=horizontal]]:bg-green-500"
    if (ltv <= 65) return "[&_[role=slider]]:border-yellow-500 [&_[data-orientation=horizontal]]:bg-yellow-500"
    return "[&_[role=slider]]:border-red-500 [&_[data-orientation=horizontal]]:bg-red-500"
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Ratio préstamo/colateral (LTV)</Label>
        <span className={cn("text-sm font-bold", getColorClass(value))}>{value}%</span>
      </div>

      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        max={maxLtv}
        min={10}
        step={1}
        disabled={disabled}
        className={cn("w-full", getSliderClass(value))}
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>10% (Conservador)</span>
        <span>50% (Moderado)</span>
        <span>{maxLtv}% (Riesgoso)</span>
      </div>

      {value > 65 && (
        <div className="text-xs text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20">
          ⚠️ LTV alto: riesgo de liquidación si el precio de BTC baja
        </div>
      )}
    </div>
  )
}

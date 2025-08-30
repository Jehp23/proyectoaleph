"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import type { HealthLevel, VaultStatus } from "@/lib/store"

interface ToolbarProps {
  ltvRange: [number, number]
  onLtvRangeChange: (range: [number, number]) => void
  selectedStatuses: VaultStatus[]
  onStatusToggle: (status: VaultStatus) => void
  selectedHealthLevels: HealthLevel[]
  onHealthLevelToggle: (level: HealthLevel) => void
  onClearFilters: () => void
}

const statusOptions: VaultStatus[] = ["Active", "Liquidated", "Closed"]
const healthOptions: HealthLevel[] = ["Healthy", "Warning", "Critical"]

const statusLabels = {
  Active: "Activo",
  Liquidated: "Liquidado",
  Closed: "Cerrado",
}

const healthLabels = {
  Healthy: "Saludable",
  Warning: "Precaución",
  Critical: "Crítico",
}

export function Toolbar({
  ltvRange,
  onLtvRangeChange,
  selectedStatuses,
  onStatusToggle,
  selectedHealthLevels,
  onHealthLevelToggle,
  onClearFilters,
}: ToolbarProps) {
  const hasActiveFilters =
    ltvRange[0] > 0 || ltvRange[1] < 100 || selectedStatuses.length > 0 || selectedHealthLevels.length > 0

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filtros</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>
            Rango LTV: {ltvRange[0]}% - {ltvRange[1]}%
          </Label>
          <Slider
            value={ltvRange}
            onValueChange={(value) => onLtvRangeChange(value as [number, number])}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>Estado del vault</Label>
          <div className="flex gap-2">
            {statusOptions.map((status) => (
              <Badge
                key={status}
                variant={selectedStatuses.includes(status) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onStatusToggle(status)}
              >
                {statusLabels[status]}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Nivel de salud</Label>
          <div className="flex gap-2">
            {healthOptions.map((level) => (
              <Badge
                key={level}
                variant={selectedHealthLevels.includes(level) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onHealthLevelToggle(level)}
              >
                {healthLabels[level]}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

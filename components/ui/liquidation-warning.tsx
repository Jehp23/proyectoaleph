"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Plus } from "lucide-react"
import type { Vault } from "@/lib/store"

interface LiquidationWarningProps {
  vault: Vault
  onAddCollateral?: () => void
  onRepayDebt?: () => void
}

export function LiquidationWarning({ vault, onAddCollateral, onRepayDebt }: LiquidationWarningProps) {
  if (vault.healthFactor >= 1.2) return null

  const isCritical = vault.healthFactor < 1.1
  const liquidationPrice =
    (Number(vault.usdtBorrowed) / 1000000 / (Number(vault.btcCollateral) / 100000000)) *
    (vault.liquidationThreshold / 100)

  return (
    <Alert className={`border-2 ${isCritical ? "border-red-500 bg-red-500/5" : "border-yellow-500 bg-yellow-500/5"}`}>
      <AlertTriangle className={`h-4 w-4 ${isCritical ? "text-red-500" : "text-yellow-500"}`} />
      <AlertDescription className="space-y-3">
        <div>
          <p className="font-medium">
            {isCritical ? "🚨 Riesgo crítico de liquidación" : "⚠️ Precaución: vault en riesgo"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Tu vault será liquidado si BTC cae por debajo de $
            {liquidationPrice.toLocaleString("es-ES", { maximumFractionDigits: 0 })} USD
          </p>
        </div>

        <div className="flex gap-2">
          {onAddCollateral && (
            <Button size="sm" variant="outline" onClick={onAddCollateral} className="gap-2 bg-transparent">
              <Plus className="h-3 w-3" />
              Agregar BTC
            </Button>
          )}
          {onRepayDebt && (
            <Button size="sm" onClick={onRepayDebt} className="gap-2">
              Pagar deuda
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

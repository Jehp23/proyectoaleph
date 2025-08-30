"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HealthBadge } from "./health-badge"
import { Eye, Plus, Minus } from "lucide-react"
import type { Vault } from "@/lib/store"
import Link from "next/link"

interface VaultCardProps {
  vault: Vault
  onAddCollateral?: (vaultId: string) => void
  onBorrowMore?: (vaultId: string) => void
  onRepay?: (vaultId: string) => void
}

const statusConfig = {
  Active: { label: "Activo", variant: "default" as const },
  Liquidated: { label: "Liquidado", variant: "destructive" as const },
  Closed: { label: "Cerrado", variant: "outline" as const },
}

export function VaultCard({ vault, onAddCollateral, onBorrowMore, onRepay }: VaultCardProps) {
  const statusInfo = statusConfig[vault.status]
  const btcAmount = Number(vault.btcCollateral) / 100000000 // Convert satoshis to BTC
  const usdtAmount = Number(vault.usdtBorrowed) / 1000000 // Convert wei to USDT
  const collateralValue = btcAmount * vault.btcPrice

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="text-2xl font-bold font-mono">{btcAmount.toFixed(4)} BTC</div>
            <div className="text-sm text-muted-foreground">
              ≈ ${collateralValue.toLocaleString("es-ES", { maximumFractionDigits: 0 })} USD
            </div>
          </div>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Prestado:</span>
            <div className="font-medium font-mono">
              {usdtAmount.toLocaleString("es-ES", { maximumFractionDigits: 0 })} USDT
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">LTV:</span>
            <div className="font-medium">{vault.ltv}%</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <HealthBadge level={vault.healthLevel} healthFactor={vault.healthFactor} />
          <div className="flex items-center gap-2">
            <Link href={`/vaults/${vault.id}`}>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Eye className="h-4 w-4" />
                Ver
              </Button>
            </Link>
            {vault.status === "Active" && (
              <div className="flex items-center gap-1">
                {onAddCollateral && (
                  <Button size="sm" variant="outline" onClick={() => onAddCollateral(vault.id)} className="gap-1">
                    <Plus className="h-3 w-3" />
                    BTC
                  </Button>
                )}
                {onBorrowMore && vault.healthFactor > 1.2 && (
                  <Button size="sm" variant="outline" onClick={() => onBorrowMore(vault.id)} className="gap-1">
                    <Plus className="h-3 w-3" />
                    USDT
                  </Button>
                )}
                {onRepay && (
                  <Button size="sm" variant="outline" onClick={() => onRepay(vault.id)} className="gap-1">
                    <Minus className="h-3 w-3" />
                    Pagar
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

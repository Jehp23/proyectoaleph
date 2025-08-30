"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HealthBadge } from "@/components/ui/health-badge"
import { Money } from "@/components/ui/money"
import { LiquidationWarning } from "@/components/ui/liquidation-warning"
import { TxModal } from "@/components/ui/tx-modal"
import { useStore } from "@/lib/store"
import { ArrowLeft, Plus, Minus, Activity, Clock, TrendingUp, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"

interface VaultDetailPageProps {
  params: { id: string }
}

export default function VaultDetailPage({ params }: VaultDetailPageProps) {
  const { vaults, addCollateral, borrowMore, repayDebt, closeVault } = useStore()
  const router = useRouter()
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<"addCollateral" | "borrowMore" | "repay" | "close" | null>(null)

  const vault = vaults.find((v) => v.id === params.id)

  if (!vault) {
    notFound()
  }

  const btcAmount = Number(vault.btcCollateral) / 100000000
  const usdtAmount = Number(vault.usdtBorrowed) / 1000000
  const collateralValue = btcAmount * vault.btcPrice
  const interestAccrued = Number(vault.accruedInterest) / 1000000

  const handleAction = (action: typeof actionType) => {
    setActionType(action)
    setShowActionModal(true)
  }

  const handleConfirmAction = async () => {
    if (!actionType) return

    await new Promise((resolve) => setTimeout(resolve, 1000))

    switch (actionType) {
      case "addCollateral":
        addCollateral(vault.id, BigInt(10000000)) // Add 0.1 BTC
        break
      case "borrowMore":
        borrowMore(vault.id, BigInt(5000000000)) // Borrow 5000 USDT
        break
      case "repay":
        repayDebt(vault.id, BigInt(10000000000)) // Repay 10000 USDT
        break
      case "close":
        closeVault(vault.id)
        router.push("/me")
        return
    }

    setActionType(null)
  }

  const getActionDescription = () => {
    switch (actionType) {
      case "addCollateral":
        return "Agregar 0.1 BTC como colateral adicional"
      case "borrowMore":
        return "Tomar 5,000 USDT adicionales en préstamo"
      case "repay":
        return "Pagar 10,000 USDT de la deuda"
      case "close":
        return "Cerrar el vault y retirar todo el colateral"
      default:
        return ""
    }
  }

  const statusConfig = {
    Active: { label: "Activo", variant: "default" as const },
    Liquidated: { label: "Liquidado", variant: "destructive" as const },
    Closed: { label: "Cerrado", variant: "outline" as const },
  }

  const statusInfo = statusConfig[vault.status]

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Vault #{vault.id}</h1>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </div>
            <p className="text-muted-foreground">Creado el {vault.createdAt.toLocaleDateString("es-ES")}</p>
          </div>
        </div>

        {/* Liquidation Warning */}
        <LiquidationWarning
          vault={vault}
          onAddCollateral={() => handleAction("addCollateral")}
          onRepayDebt={() => handleAction("repay")}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Vault Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Información del vault
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Colateral BTC</div>
                    <div className="text-xl font-bold font-mono">
                      <Money amount={vault.btcCollateral} currency="BTC" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ≈ <Money amount={collateralValue} currency="USD" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Prestado USDT</div>
                    <div className="text-xl font-bold font-mono">
                      <Money amount={vault.usdtBorrowed} currency="USDT" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      + <Money amount={vault.accruedInterest} currency="USDT" /> interés
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">LTV</div>
                    <div className="text-lg font-semibold">{vault.ltv}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Factor de salud</div>
                    <div className="text-lg font-semibold">
                      <HealthBadge level={vault.healthLevel} healthFactor={vault.healthFactor} />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Tasa de interés</div>
                    <div className="text-lg font-semibold">{vault.interestRate}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Historial de transacciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Plus className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <div className="font-medium">Vault creado</div>
                        <div className="text-sm text-muted-foreground">
                          {vault.createdAt.toLocaleDateString("es-ES")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono">
                        <Money amount={vault.btcCollateral} currency="BTC" />
                      </div>
                      <div className="text-sm text-muted-foreground">Colateral inicial</div>
                    </div>
                  </div>

                  {vault.status === "Liquidated" && vault.liquidatedAt && (
                    <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        </div>
                        <div>
                          <div className="font-medium text-red-500">Vault liquidado</div>
                          <div className="text-sm text-muted-foreground">
                            {vault.liquidatedAt.toLocaleDateString("es-ES")}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {vault.status === "Active" && (
                  <>
                    <Button onClick={() => handleAction("addCollateral")} className="w-full gap-2" variant="outline">
                      <Plus className="h-4 w-4" />
                      Agregar colateral
                    </Button>

                    {vault.healthFactor > 1.2 && (
                      <Button onClick={() => handleAction("borrowMore")} className="w-full gap-2" variant="outline">
                        <TrendingUp className="h-4 w-4" />
                        Pedir más USDT
                      </Button>
                    )}

                    <Button onClick={() => handleAction("repay")} className="w-full gap-2">
                      <Minus className="h-4 w-4" />
                      Pagar deuda
                    </Button>

                    {usdtAmount === 0 && (
                      <Button onClick={() => handleAction("close")} className="w-full gap-2" variant="outline">
                        Cerrar vault
                      </Button>
                    )}
                  </>
                )}

                {vault.status !== "Active" && (
                  <div className="text-center text-muted-foreground py-4">
                    No hay acciones disponibles para este vault
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de riesgo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Umbral de liquidación:</span>
                  <span className="font-medium">{vault.liquidationThreshold}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Precio de liquidación:</span>
                  <span className="font-medium font-mono">
                    <Money amount={(usdtAmount / btcAmount) * (100 / vault.liquidationThreshold)} currency="USD" />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Precio actual BTC:</span>
                  <span className="font-medium font-mono">
                    <Money amount={vault.btcPrice} currency="USD" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <TxModal
          open={showActionModal}
          onOpenChange={setShowActionModal}
          title="Gestionar vault"
          description={getActionDescription()}
          onConfirm={handleConfirmAction}
        />
      </div>
    </MainLayout>
  )
}

"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { KpiCard } from "@/components/ui/kpi-card"
import { HealthBadge } from "@/components/ui/health-badge"
import { Money } from "@/components/ui/money"
import { EmptyState } from "@/components/ui/empty-state"
import { TxModal } from "@/components/ui/tx-modal"
import { LiquidationWarning } from "@/components/ui/liquidation-warning"
import { useStore } from "@/lib/store"
import { Wallet, Eye, Plus, Minus, Shield, PieChart, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { SimplePieChart } from "@/components/ui/simple-charts"

const statusConfig = {
  Active: { label: "Activo", variant: "default" as const },
  Liquidated: { label: "Liquidado", variant: "destructive" as const },
  Closed: { label: "Cerrado", variant: "outline" as const },
}

export default function MyVaultsPage() {
  const { vaults, addCollateral, repayDebt, closeVault } = useStore()
  const [showTxModal, setShowTxModal] = useState(false)
  const [txAction, setTxAction] = useState<{ type: "addCollateral" | "repay" | "close"; vaultId: string } | null>(null)

  const userVaults = vaults.filter((vault) => vault.owner === "0x1234...5678" || vault.owner === "0xYour...Address")

  const totalCollateralBtc = userVaults.reduce((sum, vault) => sum + Number(vault.btcCollateral), 0)
  const totalBorrowedUsdt = userVaults.reduce((sum, vault) => sum + Number(vault.usdtBorrowed), 0)
  const activeVaults = userVaults.filter((vault) => vault.status === "Active")
  const healthyVaults = userVaults.filter((vault) => vault.healthLevel === "Healthy")
  const criticalVaults = userVaults.filter((vault) => vault.healthLevel === "Critical")
  const avgLtv =
    activeVaults.length > 0
      ? Math.round(activeVaults.reduce((sum, vault) => sum + vault.ltv, 0) / activeVaults.length)
      : 0

  const healthChartData = [
    {
      name: "Saludables",
      value: userVaults.filter((vault) => vault.healthLevel === "Healthy").length,
      fill: "hsl(var(--success))",
    },
    {
      name: "Precaución",
      value: userVaults.filter((vault) => vault.healthLevel === "Warning").length,
      fill: "hsl(var(--warning))",
    },
    {
      name: "Críticos",
      value: userVaults.filter((vault) => vault.healthLevel === "Critical").length,
      fill: "hsl(var(--danger))",
    },
  ].filter((item) => item.value > 0)

  const vaultsNeedingAttention = activeVaults
    .filter((vault) => vault.healthFactor < 1.2)
    .sort((a, b) => a.healthFactor - b.healthFactor)
    .slice(0, 3)

  const handleAction = (type: "addCollateral" | "repay" | "close", vaultId: string) => {
    setTxAction({ type, vaultId })
    setShowTxModal(true)
  }

  const handleConfirmAction = async () => {
    if (!txAction) return

    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 1000))

    switch (txAction.type) {
      case "addCollateral":
        addCollateral(txAction.vaultId, BigInt(10000000)) // Add 0.1 BTC
        break
      case "repay":
        repayDebt(txAction.vaultId, BigInt(10000000000)) // Repay 10000 USDT
        break
      case "close":
        closeVault(txAction.vaultId)
        break
    }

    setTxAction(null)
  }

  const getActionDescription = () => {
    if (!txAction) return ""
    switch (txAction.type) {
      case "addCollateral":
        return "Agregar 0.1 BTC como colateral adicional"
      case "repay":
        return "Pagar 10,000 USDT de la deuda"
      case "close":
        return "Cerrar el vault y retirar todo el colateral"
      default:
        return ""
    }
  }

  if (userVaults.length === 0) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Mis vaults</h1>
          </div>

          <EmptyState
            icon={Shield}
            title="No tienes vaults creados"
            description="Crea tu primer vault depositando BTC como colateral para tomar préstamos en USDT"
            action={
              <Link href="/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Crear mi primer vault
                </Button>
              </Link>
            }
          />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Mis vaults</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Colateral total"
            value={<Money amount={BigInt(totalCollateralBtc)} currency="BTC" showCurrency={false} />}
            subtitle="BTC depositado"
            trend="up"
          />
          <KpiCard
            title="Total prestado"
            value={<Money amount={BigInt(totalBorrowedUsdt)} currency="USDT" showCurrency={false} />}
            subtitle="USDT tomados"
            trend="neutral"
          />
          <KpiCard
            title="Vaults activos"
            value={activeVaults.length}
            subtitle={`de ${userVaults.length} totales`}
            trend="neutral"
          />
          <KpiCard
            title="LTV promedio"
            value={`${avgLtv}%`}
            subtitle={`${healthyVaults.length} saludables`}
            trend={avgLtv < 60 ? "up" : avgLtv < 70 ? "neutral" : "down"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {criticalVaults.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-red-500 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Vaults en riesgo crítico
                </h2>
                {criticalVaults.map((vault) => (
                  <LiquidationWarning
                    key={vault.id}
                    vault={vault}
                    onAddCollateral={() => handleAction("addCollateral", vault.id)}
                    onRepayDebt={() => handleAction("repay", vault.id)}
                  />
                ))}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Mis vaults</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userVaults.map((vault) => {
                    const statusInfo = statusConfig[vault.status]
                    const btcAmount = Number(vault.btcCollateral) / 100000000
                    const usdtAmount = Number(vault.usdtBorrowed) / 1000000

                    return (
                      <Card key={vault.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <div className="font-semibold font-mono">
                                  <Money amount={vault.btcCollateral} currency="BTC" />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {vault.ltv}% LTV • <Money amount={vault.usdtBorrowed} currency="USDT" />
                                </div>
                              </div>
                              <HealthBadge level={vault.healthLevel} healthFactor={vault.healthFactor} />
                              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link href={`/vaults/${vault.id}`}>
                                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                                  <Eye className="h-4 w-4" />
                                  Ver
                                </Button>
                              </Link>
                              {vault.status === "Active" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAction("addCollateral", vault.id)}
                                    className="gap-2 bg-transparent"
                                  >
                                    <Plus className="h-4 w-4" />
                                    BTC
                                  </Button>
                                  <Button size="sm" onClick={() => handleAction("repay", vault.id)} className="gap-2">
                                    <Minus className="h-4 w-4" />
                                    Pagar
                                  </Button>
                                </>
                              )}
                              {vault.status === "Active" && usdtAmount === 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAction("close", vault.id)}
                                  className="gap-2 bg-transparent"
                                >
                                  Cerrar
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {vaultsNeedingAttention.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Requieren atención
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {vaultsNeedingAttention.map((vault) => (
                      <div
                        key={vault.id}
                        className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20"
                      >
                        <div>
                          <div className="font-medium">Vault #{vault.id}</div>
                          <div className="text-sm text-muted-foreground">Factor: {vault.healthFactor.toFixed(2)}</div>
                        </div>
                        <Link href={`/vaults/${vault.id}`}>
                          <Button variant="outline" size="sm" className="bg-transparent">
                            Ver
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/new">
                  <Button className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Crear nuevo vault
                  </Button>
                </Link>
                <Link href="/vaults">
                  <Button variant="outline" className="w-full gap-2 bg-transparent">
                    <Shield className="h-4 w-4" />
                    Explorar vaults
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {healthChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Salud de vaults
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <SimplePieChart data={healthChartData} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <TxModal
          open={showTxModal}
          onOpenChange={setShowTxModal}
          title="Gestionar vault"
          description={getActionDescription()}
          onConfirm={handleConfirmAction}
        />
      </div>
    </MainLayout>
  )
}

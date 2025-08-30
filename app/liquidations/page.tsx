"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Money } from "@/components/ui/money"
import { HealthBadge } from "@/components/ui/health-badge"
import { useProtocol } from "@/hooks/useProtocol"
import { useOracleAdmin } from "@/hooks/useOracleAdmin"
import { Zap, AlertTriangle, TrendingDown, Clock, Info, Play, BarChart3, Settings } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

export default function LiquidationsPage() {
  const { data: protocol, isLoading } = useProtocol()
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationPrice, setSimulationPrice] = useState(protocol?.priceUsd || 45000)

  const { isOwner, oracleOwner, priceUsd, drop10, drop20, resetTo, busy, error } = useOracleAdmin()

  const mockVaults = [
    {
      id: "1",
      btcCollateral: "150000000", // 1.5 BTC
      usdtBorrowed: "45000000000", // 45,000 USDT
      status: "Active",
      healthLevel: "Critical" as const,
      healthFactor: 1.05,
      ltv: 72,
      liquidationThreshold: 75,
      liquidatedAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      btcCollateral: "100000000", // 1 BTC
      usdtBorrowed: "35000000000", // 35,000 USDT
      status: "Liquidated",
      healthLevel: "Critical" as const,
      healthFactor: 0.85,
      ltv: 85,
      liquidationThreshold: 75,
      liquidatedAt: new Date("2024-01-14"),
    },
  ]

  const liquidatedVaults = mockVaults.filter((vault) => vault.status === "Liquidated")
  const criticalVaults = mockVaults.filter((vault) => vault.status === "Active" && vault.healthLevel === "Critical")

  const currentBtcPrice = protocol?.priceUsd || priceUsd || 45000

  // Mock price history data for demonstration
  const priceHistory = [
    { time: "00:00", price: 45000, liquidations: 0 },
    { time: "04:00", price: 44500, liquidations: 0 },
    { time: "08:00", price: 43800, liquidations: 1 },
    { time: "12:00", price: 43200, liquidations: 2 },
    { time: "16:00", price: 42500, liquidations: 1 },
    { time: "20:00", price: 43100, liquidations: 0 },
    { time: "24:00", price: currentBtcPrice, liquidations: 0 },
  ]

  const handlePriceSimulation = async (targetPrice: number) => {
    setIsSimulating(true)
    setSimulationPrice(targetPrice)

    // Simulate gradual price change
    const steps = 20
    const priceStep = (targetPrice - currentBtcPrice) / steps

    for (let i = 1; i <= steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      const newPrice = currentBtcPrice + priceStep * i
      setSimulationPrice(newPrice)
    }

    setIsSimulating(false)
  }

  const resetPrice = () => {
    setSimulationPrice(45000)
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Liquidaciones</h1>
        </div>

        <Card className="bg-orange-500/5 border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-500" />
              Control de Oráculo (Demo)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Precio BTC (Oracle)</div>
                  <div className="text-2xl font-mono">
                    ${priceUsd?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? "…"}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div>Owner del oráculo:</div>
                  <div className="font-mono text-xs">{oracleOwner ?? "desconocido"}</div>
                </div>
              </div>

              <div className="mt-4 flex gap-2 flex-wrap">
                <button
                  disabled={!isOwner || busy}
                  title={!isOwner ? "Solo el owner del oráculo puede cambiar el precio (demo)" : undefined}
                  onClick={drop10}
                  className={`px-4 py-2 rounded-lg ${!isOwner ? "opacity-60 cursor-not-allowed border" : "bg-black text-white hover:bg-gray-800"}`}
                >
                  –10%
                </button>

                <button
                  disabled={!isOwner || busy}
                  title={!isOwner ? "Solo el owner del oráculo puede cambiar el precio (demo)" : undefined}
                  onClick={drop20}
                  className={`px-4 py-2 rounded-lg ${!isOwner ? "opacity-60 cursor-not-allowed border" : "bg-black text-white hover:bg-gray-800"}`}
                >
                  –20%
                </button>

                <button
                  disabled={!isOwner || busy}
                  title={!isOwner ? "Solo el owner del oráculo puede cambiar el precio (demo)" : undefined}
                  onClick={() => resetTo(60000)}
                  className={`px-4 py-2 rounded-lg ${!isOwner ? "opacity-60 cursor-not-allowed border" : "bg-black text-white hover:bg-gray-800"}`}
                >
                  Reset a 60,000
                </button>
              </div>

              {error && <div className="mt-3 text-sm text-red-600">⚠️ {error}</div>}
              {busy && <div className="mt-3 text-sm">⏳ Enviando transacción…</div>}
              {!isOwner && oracleOwner && (
                <div className="mt-3 text-sm text-orange-600">
                  ℹ️ Solo el owner del oráculo puede modificar precios para demo de liquidaciones
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Educational Section */}
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              ¿Cómo funcionan las liquidaciones?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Las liquidaciones protegen el protocolo cuando el valor del colateral BTC cae demasiado en relación con la
              deuda USDT.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-background rounded-lg border">
                <div className="font-semibold mb-2">1. Umbral de liquidación</div>
                <p className="text-sm text-muted-foreground">
                  Cuando el LTV supera el{" "}
                  {protocol?.liquidationThreshold ? Math.round(protocol.liquidationThreshold * 100) : 70}%, el vault
                  entra en zona de liquidación
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg border">
                <div className="font-semibold mb-2">2. Proceso automático</div>
                <p className="text-sm text-muted-foreground">
                  Los liquidadores pueden cerrar el vault y quedarse con el colateral
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg border">
                <div className="font-semibold mb-2">3. Penalización</div>
                <p className="text-sm text-muted-foreground">
                  El usuario pierde parte del colateral como penalización por el riesgo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Simulation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Simulador de liquidaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">Precio actual de BTC</div>
                <div className="text-2xl font-bold font-mono">
                  <Money amount={currentBtcPrice} currency="USD" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handlePriceSimulation(40000)}
                  disabled={isSimulating}
                  variant="outline"
                  className="bg-transparent"
                >
                  Simular caída a $40k
                </Button>
                <Button
                  onClick={() => handlePriceSimulation(35000)}
                  disabled={isSimulating}
                  variant="outline"
                  className="bg-transparent"
                >
                  Simular caída a $35k
                </Button>
                <Button onClick={resetPrice} disabled={isSimulating} variant="outline" className="bg-transparent">
                  Resetear
                </Button>
              </div>
            </div>

            {isSimulating && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full" />
                  <span className="text-yellow-500 font-medium">Simulando cambio de precio...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Price Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Precio BTC y liquidaciones (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceHistory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value, name) => [
                      name === "price" ? `$${value.toLocaleString()}` : value,
                      name === "price" ? "Precio BTC" : "Liquidaciones",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  />
                  <ReferenceLine y={42000} stroke="hsl(var(--danger))" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Liquidations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Liquidaciones recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {liquidatedVaults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay liquidaciones recientes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {liquidatedVaults.map((vault) => {
                    const btcAmount = Number(vault.btcCollateral) / 100000000
                    const usdtAmount = Number(vault.usdtBorrowed) / 1000000

                    return (
                      <div key={vault.id} className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">Vault #{vault.id}</div>
                          <Badge variant="destructive">Liquidado</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Colateral:</span>
                            <div className="font-mono">
                              <Money amount={vault.btcCollateral} currency="BTC" />
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Deuda:</span>
                            <div className="font-mono">
                              <Money amount={vault.usdtBorrowed} currency="USDT" />
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Liquidado el {vault.liquidatedAt?.toLocaleDateString("es-ES")}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vaults at Risk */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-yellow-500" />
                Vaults en riesgo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {criticalVaults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay vaults en riesgo crítico</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {criticalVaults.map((vault) => {
                    const liquidationPrice =
                      (Number(vault.usdtBorrowed) / 1000000 / (Number(vault.btcCollateral) / 100000000)) *
                      (100 / vault.liquidationThreshold)

                    return (
                      <div key={vault.id} className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">Vault #{vault.id}</div>
                          <HealthBadge level={vault.healthLevel} healthFactor={vault.healthFactor} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">LTV actual:</span>
                            <div className="font-medium">{vault.ltv}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Precio liquidación:</span>
                            <div className="font-mono">
                              <Money amount={liquidationPrice} currency="USD" />
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-yellow-600">
                          Riesgo de liquidación si BTC cae{" "}
                          {(((currentBtcPrice - liquidationPrice) / currentBtcPrice) * 100).toFixed(1)}% más
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Liquidation Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de liquidación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{liquidatedVaults.length}</div>
                <div className="text-sm text-muted-foreground">Total liquidados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{criticalVaults.length}</div>
                <div className="text-sm text-muted-foreground">En riesgo crítico</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  <Money
                    amount={liquidatedVaults.reduce((sum, v) => sum + Number(v.btcCollateral), 0)}
                    currency="BTC"
                    showCurrency={false}
                  />
                </div>
                <div className="text-sm text-muted-foreground">BTC liquidado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {protocol?.liquidationThreshold ? Math.round(protocol.liquidationThreshold * 100) : 70}%
                </div>
                <div className="text-sm text-muted-foreground">Umbral liquidación</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

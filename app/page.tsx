"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { KpiCard } from "@/components/ui/kpi-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BtcPriceTicker } from "@/components/ui/btc-price-ticker"
import { Money } from "@/components/ui/money"
import { PlusCircle, Wallet, Search, BarChart3, Shield, TrendingUp } from "lucide-react"
import { useStore } from "@/lib/store"
import Link from "next/link"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

export default function HomePage() {
  const { vaults, btcPrice, totalValueLocked, totalBorrowed } = useStore()

  // Calculate KPIs for crypto vaults
  const activeVaults = vaults.filter((vault) => vault.status === "Active").length
  const totalVaults = vaults.length
  const liquidatedVaults = vaults.filter((vault) => vault.status === "Liquidated").length
  const healthyVaults = vaults.filter((vault) => vault.healthLevel === "Healthy").length
  const healthyRate = totalVaults > 0 ? Math.round((healthyVaults / totalVaults) * 100) : 0

  // Calculate average LTV
  const activeVaultsList = vaults.filter((vault) => vault.status === "Active")
  const avgLtv =
    activeVaultsList.length > 0
      ? Math.round(activeVaultsList.reduce((sum, vault) => sum + vault.ltv, 0) / activeVaultsList.length)
      : 0

  // Chart data for vault health distribution
  const healthData = [
    {
      name: "Saludables",
      value: vaults.filter((v) => v.healthLevel === "Healthy").length,
      fill: "hsl(var(--success))",
    },
    {
      name: "Precaución",
      value: vaults.filter((v) => v.healthLevel === "Warning").length,
      fill: "hsl(var(--warning))",
    },
    {
      name: "Críticos",
      value: vaults.filter((v) => v.healthLevel === "Critical").length,
      fill: "hsl(var(--danger))",
    },
  ]

  // Chart data for vault status
  const statusData = [
    {
      name: "Activos",
      value: activeVaults,
      fill: "hsl(var(--primary))",
    },
    {
      name: "Liquidados",
      value: liquidatedVaults,
      fill: "hsl(var(--danger))",
    },
    {
      name: "Cerrados",
      value: vaults.filter((v) => v.status === "Closed").length,
      fill: "hsl(var(--muted-foreground))",
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-balance">Caución cripto no-custodial</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Depositá BTC como colateral y tomá préstamos en USDT de forma descentralizada y segura
          </p>
        </div>

        {/* BTC Price Ticker */}
        <BtcPriceTicker />

        {/* CTA Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/new">
            <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary/50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <PlusCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Crear vault</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-pretty">
                  Deposita BTC como colateral y toma un préstamo en USDT
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/me">
            <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-green-500/50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <Wallet className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-xl">Gestionar vaults</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-pretty">
                  Administra tus vaults activos, agrega colateral o paga deudas
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/vaults">
            <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-yellow-500/50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                  <Search className="h-6 w-6 text-yellow-500" />
                </div>
                <CardTitle className="text-xl">Explorar vaults</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-pretty">
                  Explora todos los vaults del protocolo y analiza métricas
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* KPIs Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Métricas del protocolo</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard
              title="Total Value Locked"
              value={<Money amount={totalValueLocked} currency="BTC" showCurrency={false} />}
              subtitle="BTC depositado"
              trend="up"
            />
            <KpiCard
              title="Total prestado"
              value={<Money amount={totalBorrowed} currency="USDT" showCurrency={false} />}
              subtitle="USDT en préstamos"
              trend="up"
            />
            <KpiCard
              title="Vaults activos"
              value={activeVaults}
              subtitle={`de ${totalVaults} totales`}
              trend="neutral"
            />
            <KpiCard
              title="LTV promedio"
              value={`${avgLtv}%`}
              subtitle={`${healthyRate}% saludables`}
              trend={avgLtv < 60 ? "up" : avgLtv < 70 ? "neutral" : "down"}
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Health Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Distribución por salud
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={healthData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {healthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estado de vaults
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/new">
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Crear vault
                </Button>
              </Link>
              <Link href="/vaults">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Search className="h-4 w-4" />
                  Explorar vaults
                </Button>
              </Link>
              <Link href="/me">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Wallet className="h-4 w-4" />
                  Mis vaults
                </Button>
              </Link>
              <Link href="/liquidations">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <TrendingUp className="h-4 w-4" />
                  Ver liquidaciones
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

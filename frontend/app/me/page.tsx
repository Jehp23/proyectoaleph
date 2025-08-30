"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/kpi-card";
import { HealthBadge } from "@/components/ui/health-badge";
import { Money } from "@/components/ui/money";
import { EmptyState } from "@/components/ui/empty-state";
import { TxModal } from "@/components/ui/tx-modal";
import { LiquidationWarning } from "@/components/ui/liquidation-warning";
import { useStore } from "@/lib/store";
import { useWallet } from "@/hooks/useWallet"; // <-- usa la cuenta real
import {
  Wallet,
  Eye,
  Plus,
  Minus,
  Shield,
  PieChart as PieChartIcon,
  AlertTriangle
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Pie
} from "recharts";

const statusConfig = {
  Active: { label: "Activo", variant: "default" as const },
  Liquidated: { label: "Liquidado", variant: "destructive" as const },
  Closed: { label: "Cerrado", variant: "outline" as const },
};

export default function MyVaultsPage() {
  const { vaults, addCollateral, repayDebt, closeVault } = useStore();
  const { address, connect } = useWallet(); // <-- address de MetaMask (o null)
  const [showTxModal, setShowTxModal] = useState(false);
  const [txAction, setTxAction] = useState<
    { type: "addCollateral" | "repay" | "close"; vaultId: string } | null
  >(null);

  // Filtra por el owner = cuenta conectada
  const userVaults = useMemo(() => {
    if (!address) return [];
    return vaults.filter(
      (v) => v.owner?.toLowerCase() === address.toLowerCase()
    );
  }, [vaults, address]);

  const activeVaults = useMemo(
    () => userVaults.filter((v) => v.status === "Active"),
    [userVaults]
  );

  const totalCollateralBtc = useMemo(
    () => userVaults.reduce((sum, v) => sum + Number(v.btcCollateral), 0),
    [userVaults]
  );
  const totalBorrowedUsdt = useMemo(
    () => userVaults.reduce((sum, v) => sum + Number(v.usdtBorrowed), 0),
    [userVaults]
  );
  const healthyVaults = useMemo(
    () => userVaults.filter((v) => v.healthLevel === "Healthy"),
    [userVaults]
  );
  const criticalVaults = useMemo(
    () => userVaults.filter((v) => v.healthLevel === "Critical"),
    [userVaults]
  );
  const avgLtv = useMemo(() => {
    return activeVaults.length > 0
      ? Math.round(
          activeVaults.reduce((sum, v) => sum + v.ltv, 0) / activeVaults.length
        )
      : 0;
  }, [activeVaults]);

  const healthChartData = useMemo(
    () =>
      [
        {
          name: "Saludables",
          value: userVaults.filter((v) => v.healthLevel === "Healthy").length,
          fill: "hsl(var(--success))",
        },
        {
          name: "Precaución",
          value: userVaults.filter((v) => v.healthLevel === "Warning").length,
          fill: "hsl(var(--warning))",
        },
        {
          name: "Críticos",
          value: userVaults.filter((v) => v.healthLevel === "Critical").length,
          fill: "hsl(var(--danger))",
        },
      ].filter((i) => i.value > 0),
    [userVaults]
  );

  const vaultsNeedingAttention = useMemo(
    () =>
      activeVaults
        .filter((v) => v.healthFactor < 1.2)
        .sort((a, b) => a.healthFactor - b.healthFactor)
        .slice(0, 3),
    [activeVaults]
  );

  const handleAction = (
    type: "addCollateral" | "repay" | "close",
    vaultId: string
  ) => {
    setTxAction({ type, vaultId });
    setShowTxModal(true);
  };

  const handleConfirmAction = async () => {
    if (!txAction) return;
    // Simula una tx (este store es mock)
    await new Promise((r) => setTimeout(r, 1000));
    switch (txAction.type) {
      case "addCollateral":
        addCollateral(txAction.vaultId, BigInt(10_000_000)); // 0.1 BTC (8 dec)
        break;
      case "repay":
        repayDebt(txAction.vaultId, BigInt(10_000_000_00)); // 10,000 USDT (6 dec)
        break;
      case "close":
        closeVault(txAction.vaultId);
        break;
    }
    setTxAction(null);
  };

  const getActionDescription = () => {
    if (!txAction) return "";
    switch (txAction.type) {
      case "addCollateral":
        return "Agregar 0.1 BTC como colateral adicional";
      case "repay":
        return "Pagar 10,000 USDT de la deuda";
      case "close":
        return "Cerrar el vault y retirar todo el colateral";
      default:
        return "";
    }
  };

  // Si no hay wallet conectada: CTA para conectar
  if (!address) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Mis vaults</h1>
          </div>
          <EmptyState
            icon={Shield}
            title="Conecta tu wallet"
            description="Necesitamos tu dirección para mostrar tus vaults."
            action={
              <Button className="gap-2" onClick={connect}>
                <Wallet className="h-4 w-4" />
                Conectar wallet
              </Button>
            }
          />
        </div>
      </MainLayout>
    );
  }

  // Conectado pero sin vaults
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
            description="Crea tu primer vault depositando BTC como colateral para tomar préstamos en USDT."
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
    );
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
            value={
              <Money
                amount={BigInt(totalCollateralBtc)}
                currency="BTC"
                showCurrency={false}
              />
            }
            subtitle="BTC depositado"
            trend="up"
          />
          <KpiCard
            title="Total prestado"
            value={
              <Money
                amount={BigInt(totalBorrowedUsdt)}
                currency="USDT"
                showCurrency={false}
              />
            }
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
                {criticalVaults.map((v) => (
                  <LiquidationWarning
                    key={v.id}
                    vault={v}
                    onAddCollateral={() => handleAction("addCollateral", v.id)}
                    onRepayDebt={() => handleAction("repay", v.id)}
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
                  {userVaults.map((v) => {
                    const statusInfo = statusConfig[v.status];
                    const usdtAmount = Number(v.usdtBorrowed) / 1_000_000;

                    return (
                      <Card key={v.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <div className="font-semibold font-mono">
                                  <Money amount={v.btcCollateral} currency="BTC" />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {v.ltv}% LTV •{" "}
                                  <Money amount={v.usdtBorrowed} currency="USDT" />
                                </div>
                              </div>
                              <HealthBadge
                                level={v.healthLevel}
                                healthFactor={v.healthFactor}
                              />
                              <Badge variant={statusInfo.variant}>
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link href={`/vaults/${v.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 bg-transparent"
                                >
                                  <Eye className="h-4 w-4" />
                                  Ver
                                </Button>
                              </Link>
                              {v.status === "Active" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAction("addCollateral", v.id)}
                                    className="gap-2 bg-transparent"
                                  >
                                    <Plus className="h-4 w-4" />
                                    BTC
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAction("repay", v.id)}
                                    className="gap-2"
                                  >
                                    <Minus className="h-4 w-4" />
                                    Pagar
                                  </Button>
                                </>
                              )}
                              {v.status === "Active" && usdtAmount === 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAction("close", v.id)}
                                  className="gap-2 bg-transparent"
                                >
                                  Cerrar
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
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
                    {vaultsNeedingAttention.map((v) => (
                      <div
                        key={v.id}
                        className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20"
                      >
                        <div>
                          <div className="font-medium">Vault #{v.id}</div>
                          <div className="text-sm text-muted-foreground">
                            Factor: {v.healthFactor.toFixed(2)}
                          </div>
                        </div>
                        <Link href={`/vaults/${v.id}`}>
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
                    <PieChartIcon className="h-5 w-5" />
                    Salud de vaults
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={healthChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {healthChartData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
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
  );
}

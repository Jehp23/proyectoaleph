"use client"

import { useVault } from "@/hooks/useVault"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, AlertCircle, CheckCircle } from "lucide-react"
import { formatUnits, mockWallet } from "@/lib/mock-blockchain"

export function WalletStatus() {
  const { vault, balances, isLoading } = useVault()
  const isConnected = mockWallet.isConnected
  const address = mockWallet.address

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Conecta tu wallet</h3>
          <p className="text-center text-muted-foreground mb-4">
            Conecta tu wallet para ver tus vaults y operar con CauciónBTC
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Wallet Conectada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <code className="text-xs bg-muted px-2 py-1 rounded">{address}</code>
        </CardContent>
      </Card>

      {/* Balances */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Balances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">WBTC:</span>
            <span className="font-mono text-sm">{formatUnits(balances.wbtc, 8)} WBTC</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">mUSD:</span>
            <span className="font-mono text-sm">{formatUnits(balances.musd, 18)} mUSD</span>
          </div>
        </CardContent>
      </Card>

      {/* Vault Status */}
      {vault?.isActive ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Tu Vault
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Colateral:</span>
                <div className="font-mono">{formatUnits(vault.collateralAmount, 8)} WBTC</div>
              </div>
              <div>
                <span className="text-muted-foreground">Deuda:</span>
                <div className="font-mono">{formatUnits(vault.debtAmount + vault.accruedInterest, 18)} mUSD</div>
              </div>
              <div>
                <span className="text-muted-foreground">LTV:</span>
                <div className="font-semibold">{vault.ltv}%</div>
              </div>
              <div>
                <span className="text-muted-foreground">Health Factor:</span>
                <div
                  className={`font-semibold ${
                    vault.healthFactor >= 1.5
                      ? "text-green-500"
                      : vault.healthFactor >= 1.1
                        ? "text-yellow-500"
                        : "text-red-500"
                  }`}
                >
                  {vault.healthFactor.toFixed(2)}
                </div>
              </div>
            </div>
            <Badge
              variant={vault.healthFactor >= 1.5 ? "default" : vault.healthFactor >= 1.1 ? "secondary" : "destructive"}
              className="w-full justify-center"
            >
              {vault.healthFactor >= 1.5 ? "Saludable" : vault.healthFactor >= 1.1 ? "Precaución" : "Crítico"}
            </Badge>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-center text-muted-foreground">No tienes un vault activo</p>
          </CardContent>
        </Card>
      )}

      {isLoading && <div className="text-center text-sm text-muted-foreground">Actualizando datos...</div>}
    </div>
  )
}

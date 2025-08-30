"use client"

import { useState } from "react"
import { useVault } from "@/hooks/useVault"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { PlusCircle, MinusCircle, DollarSign, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { bigIntToString, PRECISION_CONSTANTS } from "@/lib/precision-math"

export function VaultActions() {
  const { vault, balances, depositCollateral, withdrawCollateral, borrow, repay, closeVault, isLoading } = useVault()
  const [amounts, setAmounts] = useState({
    deposit: "",
    withdraw: "",
    borrow: "",
    repay: "",
  })

  const handleAmountChange = (action: string, value: string) => {
    setAmounts((prev) => ({ ...prev, [action]: value }))
  }

  const handleAction = async (action: string) => {
    const amount = amounts[action as keyof typeof amounts]

    if (!amount || amount.trim() === "") {
      toast({
        title: "Error",
        description: "Ingresa una cantidad válida",
        variant: "destructive",
      })
      return
    }

    try {
      switch (action) {
        case "deposit":
          await depositCollateral(amount)
          break
        case "withdraw":
          await withdrawCollateral(amount)
          break
        case "borrow":
          await borrow(amount)
          break
        case "repay":
          await repay(amount)
          break
      }

      // Clear input after successful action
      setAmounts((prev) => ({ ...prev, [action]: "" }))
    } catch (error) {
      // Error handling is now done in the hook functions
      console.error(`Error in ${action}:`, error)
    }
  }

  if (!vault?.isActive) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground mb-4">No tienes un vault activo</p>
          <Button asChild>
            <a href="/new">Crear Vault</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones de Vault</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="collateral" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="collateral">Colateral</TabsTrigger>
            <TabsTrigger value="debt">Deuda</TabsTrigger>
            <TabsTrigger value="manage">Gestionar</TabsTrigger>
          </TabsList>

          <TabsContent value="collateral" className="space-y-4">
            {/* Deposit Collateral */}
            <div className="space-y-2">
              <Label htmlFor="deposit">Depositar WBTC</Label>
              <div className="flex gap-2">
                <Input
                  id="deposit"
                  type="number"
                  placeholder="0.0"
                  value={amounts.deposit}
                  onChange={(e) => handleAmountChange("deposit", e.target.value)}
                  step="0.0001"
                  min="0"
                  max={bigIntToString(balances.wbtc, PRECISION_CONSTANTS.BTC_DECIMALS, 4)}
                />
                <Button
                  onClick={() => handleAction("deposit")}
                  disabled={isLoading || !amounts.deposit || Number.parseFloat(amounts.deposit) <= 0}
                  className="gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Depositar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Balance: {bigIntToString(balances.wbtc, PRECISION_CONSTANTS.BTC_DECIMALS, 4)} WBTC
              </p>
            </div>

            <Separator />

            {/* Withdraw Collateral */}
            <div className="space-y-2">
              <Label htmlFor="withdraw">Retirar WBTC</Label>
              <div className="flex gap-2">
                <Input
                  id="withdraw"
                  type="number"
                  placeholder="0.0"
                  value={amounts.withdraw}
                  onChange={(e) => handleAmountChange("withdraw", e.target.value)}
                  step="0.0001"
                  min="0"
                  max={bigIntToString(vault.collateralAmount, PRECISION_CONSTANTS.BTC_DECIMALS, 4)}
                />
                <Button
                  onClick={() => handleAction("withdraw")}
                  disabled={isLoading || !amounts.withdraw || Number.parseFloat(amounts.withdraw) <= 0}
                  variant="outline"
                  className="gap-2"
                >
                  <MinusCircle className="h-4 w-4" />
                  Retirar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Depositado: {bigIntToString(vault.collateralAmount, PRECISION_CONSTANTS.BTC_DECIMALS, 4)} WBTC
              </p>
            </div>
          </TabsContent>

          <TabsContent value="debt" className="space-y-4">
            {/* Borrow */}
            <div className="space-y-2">
              <Label htmlFor="borrow">Pedir prestado mUSD</Label>
              <div className="flex gap-2">
                <Input
                  id="borrow"
                  type="number"
                  placeholder="0.0"
                  value={amounts.borrow}
                  onChange={(e) => handleAmountChange("borrow", e.target.value)}
                  step="1"
                  min="0"
                  max={bigIntToString(vault.maxBorrowAmount, PRECISION_CONSTANTS.USDT_DECIMALS, 2)}
                />
                <Button
                  onClick={() => handleAction("borrow")}
                  disabled={isLoading || !amounts.borrow || Number.parseFloat(amounts.borrow) <= 0}
                  className="gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Pedir
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">LTV actual: {vault.ltv}% (máx: 60%)</p>
            </div>

            <Separator />

            {/* Repay */}
            <div className="space-y-2">
              <Label htmlFor="repay">Repagar mUSD</Label>
              <div className="flex gap-2">
                <Input
                  id="repay"
                  type="number"
                  placeholder="0.0"
                  value={amounts.repay}
                  onChange={(e) => handleAmountChange("repay", e.target.value)}
                  step="1"
                  min="0"
                  max={bigIntToString(vault.debtAmount + vault.accruedInterest, PRECISION_CONSTANTS.USDT_DECIMALS, 2)}
                />
                <Button
                  onClick={() => handleAction("repay")}
                  disabled={isLoading || !amounts.repay || Number.parseFloat(amounts.repay) <= 0}
                  variant="outline"
                  className="gap-2"
                >
                  <MinusCircle className="h-4 w-4" />
                  Repagar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Deuda total:{" "}
                {bigIntToString(vault.debtAmount + vault.accruedInterest, PRECISION_CONSTANTS.USDT_DECIMALS, 2)} mUSD
              </p>
              <p className="text-xs text-muted-foreground">
                Balance: {bigIntToString(balances.musd, PRECISION_CONSTANTS.USDT_DECIMALS, 2)} mUSD
              </p>
            </div>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Cerrar Vault</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Repaga toda la deuda y retira todo el colateral. Esta acción cerrará permanentemente tu vault.
                </p>
                <Button onClick={closeVault} disabled={isLoading} variant="destructive" className="gap-2">
                  <X className="h-4 w-4" />
                  Cerrar Vault
                </Button>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <h4 className="font-medium mb-2 text-yellow-600">⚠️ Advertencia</h4>
                <p className="text-sm text-muted-foreground">
                  Asegúrate de mantener un Health Factor saludable ({">"} 1.2) para evitar liquidaciones. El precio de
                  liquidación actual es ${vault.liquidationPrice.toFixed(2)}.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

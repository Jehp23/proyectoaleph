"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { TxModal } from "@/components/ui/tx-modal"
import { Money } from "@/components/ui/money"
import { LtvSlider } from "@/components/ui/ltv-slider"
import { useStore } from "@/lib/store"
import { ArrowLeft, ArrowRight, HelpCircle, Shield, Bitcoin } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import {
  stringToBigInt,
  calculateHealthFactor,
  calculateLiquidationPrice,
  PRECISION_CONSTANTS,
  safeToNumber,
} from "@/lib/precision-math"

export default function NewVaultPage() {
  const { createVault, btcPrice } = useStore()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [showTxModal, setShowTxModal] = useState(false)

  // Form state
  const [btcAmount, setBtcAmount] = useState("")
  const [ltv, setLtv] = useState(50) // Default 50% LTV
  const [interestRate] = useState(8.5) // Fixed 8.5% annual interest rate
  const [liquidationThreshold] = useState(75) // Fixed 75% liquidation threshold

  const safeParseBtcAmount = (amount: string): bigint => {
    if (!amount || amount.trim() === "" || !/^\d+(\.\d+)?$/.test(amount.trim())) {
      return BigInt(0)
    }
    try {
      return stringToBigInt(amount.trim(), PRECISION_CONSTANTS.BTC_DECIMALS)
    } catch {
      return BigInt(0)
    }
  }

  // High-precision calculations
  const btcCollateralSatoshis = safeParseBtcAmount(btcAmount)
  const btcPriceBigInt = BigInt(Math.round(btcPrice * Number(PRECISION_CONSTANTS.PRICE_MULTIPLIER)))
  const liquidationThresholdBP = BigInt(liquidationThreshold * 100) // Convert to basis points

  // Calculate collateral value in USD (exact precision)
  const collateralValueUsd =
    btcCollateralSatoshis > 0
      ? (btcCollateralSatoshis * btcPriceBigInt) / PRECISION_CONSTANTS.BTC_SATOSHI_MULTIPLIER
      : BigInt(0)

  // Calculate borrow amount based on LTV
  const borrowAmountUsd = collateralValueUsd > 0 ? (collateralValueUsd * BigInt(ltv)) / BigInt(100) : BigInt(0)

  // Convert to USDT wei (6 decimals)
  const borrowAmountUsdt =
    borrowAmountUsd * BigInt(10) ** BigInt(PRECISION_CONSTANTS.PRICE_DECIMALS - PRECISION_CONSTANTS.USDT_DECIMALS)

  // Calculate liquidation price with exact precision
  const liquidationPrice =
    btcCollateralSatoshis > 0 && borrowAmountUsdt > 0
      ? calculateLiquidationPrice(btcCollateralSatoshis, borrowAmountUsdt, liquidationThresholdBP)
      : BigInt(0)

  // Health factor calculation with exact precision
  const healthFactor = (() => {
    if (btcCollateralSatoshis <= 0) {
      return BigInt(0) // No collateral = no health factor
    }
    if (borrowAmountUsdt <= 0) {
      return BigInt(999) * PRECISION_CONSTANTS.HEALTH_FACTOR_MULTIPLIER // No debt = infinite health factor
    }
    return calculateHealthFactor(btcCollateralSatoshis, borrowAmountUsdt, btcPriceBigInt, liquidationThresholdBP)
  })()

  // Safe conversions for display only
  const healthFactorDisplay = (() => {
    if (btcCollateralSatoshis <= 0) {
      return 0
    }
    if (borrowAmountUsdt <= 0) {
      return 999 // Display as very high number when no debt
    }
    return safeToNumber(healthFactor, PRECISION_CONSTANTS.HEALTH_FACTOR_DECIMALS)
  })()

  const liquidationPriceDisplay = safeToNumber(liquidationPrice, PRECISION_CONSTANTS.PRICE_DECIMALS)

  const canProceedStep1 = btcAmount && btcCollateralSatoshis > 0
  const canProceedStep2 = borrowAmountUsdt > 0 && healthFactor > PRECISION_CONSTANTS.HEALTH_FACTOR_MULTIPLIER
  const canCreate = canProceedStep1 && canProceedStep2

  const handleCreateVault = async () => {
    if (!canCreate) return

    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    createVault({
      owner: "0xYour...Address", // Placeholder
      btcCollateral: btcCollateralSatoshis,
      usdtBorrowed: borrowAmountUsdt,
      ltv,
      liquidationThreshold,
      status: "Active",
      btcPrice,
      interestRate,
    })

    router.push("/me")
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Depósito de colateral</h2>
        <p className="text-muted-foreground">Especifica la cantidad de BTC que depositarás como colateral</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="btc-amount">Cantidad de BTC</Label>
        <div className="relative">
          <Bitcoin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-500" />
          <Input
            id="btc-amount"
            type="text"
            placeholder="1.00000000"
            value={btcAmount}
            onChange={(e) => {
              const value = e.target.value
              if (value === "" || /^\d*\.?\d{0,8}$/.test(value)) {
                setBtcAmount(value)
              }
            }}
            className="pl-10 font-mono"
            pattern="^\d+(\.\d{0,8})?$"
          />
        </div>
        {btcAmount && collateralValueUsd > 0 && (
          <p className="text-sm text-muted-foreground">
            ≈ <Money amount={collateralValueUsd} currency="USD" />
          </p>
        )}
      </div>

      {collateralValueUsd > 0 && (
        <Card className="bg-orange-500/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-orange-500">Información del colateral</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Valor actual:</span>
                <div className="font-medium">
                  <Money amount={collateralValueUsd} currency="USD" />
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Precio BTC:</span>
                <div className="font-medium font-mono">
                  <Money amount={btcPriceBigInt} currency="USD" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Configuración del préstamo</h2>
        <p className="text-muted-foreground">Ajusta el ratio préstamo/colateral y revisa los parámetros</p>
      </div>

      <div className="space-y-6">
        <LtvSlider
          value={ltv}
          onChange={setLtv}
          maxLtv={liquidationThreshold - 5} // 5% buffer from liquidation
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Cantidad a prestar</div>
              <div className="text-xl font-bold">
                <Money amount={borrowAmountUsdt} currency="USDT" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Factor de salud</div>
              <div
                className={`text-xl font-bold ${healthFactorDisplay >= 1.5 ? "text-green-500" : healthFactorDisplay >= 1.1 ? "text-yellow-500" : "text-red-500"}`}
              >
                {healthFactorDisplay >= 999 ? "∞" : healthFactorDisplay.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label>Parámetros del protocolo</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Estos parámetros están fijados por el protocolo para garantizar la seguridad del sistema.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Tasa de interés</div>
              <div className="font-semibold">{interestRate}% anual</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Umbral de liquidación</div>
              <div className="font-semibold">{liquidationThreshold}%</div>
            </div>
          </div>
        </div>

        {liquidationPriceDisplay > 0 && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-yellow-500 mb-1">Precio de liquidación</div>
                <p className="text-muted-foreground">
                  Tu vault será liquidado si BTC cae por debajo de{" "}
                  <span className="font-medium">
                    <Money amount={liquidationPriceDisplay} currency="USD" />
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Confirmación</h2>
        <p className="text-muted-foreground">Revisa los detalles antes de crear tu vault</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Resumen del vault
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Colateral BTC</div>
              <div className="text-lg font-semibold">
                <Money amount={btcCollateralSatoshis} currency="BTC" />
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Valor del colateral</div>
              <div className="text-lg font-semibold text-orange-500">
                <Money amount={collateralValueUsd} currency="USD" />
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Cantidad prestada</div>
              <div className="text-xl font-bold">
                <Money amount={borrowAmountUsdt} currency="USDT" />
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Factor de salud</div>
              <div
                className={`text-xl font-bold ${healthFactorDisplay >= 1.5 ? "text-green-500" : healthFactorDisplay >= 1.1 ? "text-yellow-500" : "text-red-500"}`}
              >
                {healthFactorDisplay >= 999 ? "∞" : healthFactorDisplay.toFixed(2)}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">LTV:</span>
              <span className="font-medium">{ltv}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tasa de interés:</span>
              <span className="font-medium">{interestRate}% anual</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Umbral de liquidación:</span>
              <span className="font-medium">{liquidationThreshold}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Precio de liquidación:</span>
              <span className="font-medium">
                <Money amount={liquidationPriceDisplay} currency="USD" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-blue-500 mb-1">Importante</div>
            <p className="text-muted-foreground">
              Al crear este vault, deberás aprobar el depósito de BTC y firmar la transacción. El colateral será
              bloqueado hasta que pagues completamente la deuda o cierres el vault.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Crear vault</h1>
            <p className="text-muted-foreground">Paso {currentStep} de 3</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                  step <= currentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground bg-background text-muted-foreground"
                }`}
              >
                <span className="text-sm font-medium">{step}</span>
              </div>
              {step < 3 && (
                <div
                  className={`h-0.5 w-12 transition-colors ${
                    step < currentStep ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="gap-2 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>

          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={currentStep === 1 ? !canProceedStep1 : !canProceedStep2}
              className="gap-2"
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => setShowTxModal(true)} disabled={!canCreate} className="gap-2">
              Crear vault
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        <TxModal
          open={showTxModal}
          onOpenChange={setShowTxModal}
          title="Crear vault de colateral"
          description="Confirma la creación de tu vault con colateral BTC"
          onConfirm={handleCreateVault}
        />
      </div>
    </MainLayout>
  )
}

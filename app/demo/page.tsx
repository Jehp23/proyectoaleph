"use client"

import { useState } from 'react'
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useVault } from '@/hooks/useVault'
import { CONTRACTS, ORACLE_ABI } from '@/lib/contracts'
import { useWriteContract, useAccount } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { TrendingDown, Zap, AlertTriangle, Play, RotateCcw } from 'lucide-react'
import { WalletStatus } from '@/components/ui/wallet-status'
import { VaultActions } from '@/components/ui/vault-actions'

export default function DemoPage() {
  const { isConnected } = useAccount()
  const { protocol, vault, refreshData } = useVault()
  const { writeContract } = useWriteContract()
  const [isSimulating, setIsSimulating] = useState(false)

  const simulatePriceDrop = async (percentage: number) => {
    if (!isConnected) return
    
    setIsSimulating(true)
    try {
      await writeContract({
        address: CONTRACTS.ORACLE,
        abi: ORACLE_ABI,
        functionName: 'simulatePriceDrop',
        args: [CONTRACTS.WBTC, BigInt(percentage)],
      })
      
      // Refresh data after simulation
      setTimeout(() => {
        refreshData()
        setIsSimulating(false)
      }, 2000)
    } catch (error) {
      console.error('Error simulating price drop:', error)
      setIsSimulating(false)
    }
  }

  const resetPrice = async () => {
    if (!isConnected) return
    
    setIsSimulating(true)
    try {
      const originalPrice = parseUnits("45000", 8) // $45,000
      await writeContract({
        address: CONTRACTS.ORACLE,
        abi: ORACLE_ABI,
        functionName: 'setPrice',
        args: [CONTRACTS.WBTC, originalPrice],
      })
      
      setTimeout(() => {
        refreshData()
        setIsSimulating(false)
      }, 2000)
    } catch (error) {
      console.error('Error resetting price:', error)
      setIsSimulating(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-4xl font-bold">Demo CauciónBTC</h1>
            <Badge variant="outline" className="text-xs">
              <Play className="h-3 w-3 mr-1" />
              Modo Demo
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experimenta con liquidaciones simuladas y gestión de vaults en tiempo real
          </p>
        </div>

        {!isConnected ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Conecta tu wallet</h3>
              <p className="text-center text-muted-foreground">
                Necesitas conectar tu wallet para usar el modo demo
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Wallet Status */}
            <div className="space-y-6">
              <WalletStatus />
            </div>

            {/* Center Column - Demo Controls */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Simulación de Crisis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold font-mono">
                      ${protocol?.wbtcPrice ? protocol.wbtcPrice.toLocaleString() : '45,000'}
                    </div>
                    <p className="text-sm text-muted-foreground">Precio actual de BTC</p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Simular caída de precio:</h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => simulatePriceDrop(10)}
                        disabled={isSimulating}
                        variant="outline"
                        className="gap-2"
                      >
                        <TrendingDown className="h-4 w-4" />
                        -10%
                      </Button>
                      <Button
                        onClick={() => simulatePriceDrop(20)}
                        disabled={isSimulating}
                        variant="outline"
                        className="gap-2"
                      >
                        <TrendingDown className="h-4 w-4" />
                        -20%
                      </Button>
                      <Button
                        onClick={() => simulatePriceDrop(30)}
                        disabled={isSimulating}
                        variant="destructive"
                        className="gap-2"
                      >
                        <TrendingDown className="h-4 w-4" />
                        -30%
                      </Button>
                      <Button
                        onClick={resetPrice}
                        disabled={isSimulating}
                        variant="secondary"
                        className="gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </Button>
                    </div>

                    {isSimulating && (
                      <div className="text-center text-sm text-muted-foreground">
                        Simulando cambio de precio...
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h4 className="font-medium text-blue-600 mb-1">💡 Cómo usar</h4>
                    <ol className="text-sm text-muted-foreground space-y-1">
                      <li>1. Crea un vault con colateral WBTC</li>
                      <li>2. Pide prestado mUSD (máx 60% LTV)</li>
                      <li>3. Simula caída de precio con los botones</li>
                      <li>4. Observa cómo cambia el Health Factor</li>
                      <li>5. Si HF &lt; 1.0, el vault puede ser liquidado</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* Protocol Stats */}
              {protocol && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Estado del Protocolo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Collateral:</span>
                      <span className="font-mono">
                        {formatUnits(protocol.totalCollateral, 8)} WBTC
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Debt:</span>
                      <span className="font-mono">
                        {formatUnits(protocol.totalDebt, 18)} mUSD
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Active Vaults:</span>
                      <span className="font-semibold">{protocol.vaultCount}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Vault Actions */}
            <div className="space-y-6">
              <VaultActions />
            </div>
          </div>
        )}

        {/* Demo Script */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>🎬 Script de Demo (3-4 min)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Preparación:</h4>
                <ol className="text-sm space-y-2 text-muted-foreground">
                  <li>1. Conectar wallet (MetaMask/WalletConnect)</li>
                  <li>2. Cambiar a red Sepolia</li>
                  <li>3. Obtener tokens de prueba (faucet)</li>
                  <li>4. Crear vault inicial con 0.05 WBTC</li>
                </ol>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold">Demo Flow:</h4>
                <ol className="text-sm space-y-2 text-muted-foreground">
                  <li>1. Mostrar vault saludable (HF ~1.4)</li>
                  <li>2. Simular caída -20% → HF crítico</li>
                  <li>3. Demostrar liquidación parcial</li>
                  <li>4. Reset precio y recovery</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

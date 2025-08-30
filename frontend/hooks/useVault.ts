"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  mockWallet,
  mockBalances,
  mockVault,
  mockProtocol,
  type MockVaultData,
  type MockProtocolData,
  formatUnits,
  parseUnits,
} from "@/lib/mock-blockchain"

export interface VaultData extends MockVaultData {}
export interface ProtocolData extends MockProtocolData {}

export function useVault() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [vault, setVault] = useState<VaultData>(mockVault)
  const [protocol, setProtocol] = useState<ProtocolData>(mockProtocol)
  const [balances, setBalances] = useState(mockBalances)

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const priceChange = (Math.random() - 0.5) * 1000 // ±$500 variation
      const newPrice = Math.max(30000, protocol.wbtcPrice + priceChange)

      // Recalculate health factor based on new price
      const collateralValue = Number(formatUnits(vault.collateralAmount, 8)) * newPrice
      const debtValue = Number(formatUnits(vault.debtAmount + vault.accruedInterest, 18))
      const newHealthFactor = (collateralValue * 0.75) / debtValue // 75% liquidation threshold

      setProtocol((prev) => ({ ...prev, wbtcPrice: newPrice }))
      setVault((prev) => ({
        ...prev,
        healthFactor: newHealthFactor,
        liquidationPrice: debtValue / (Number(formatUnits(prev.collateralAmount, 8)) * 0.75),
      }))
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [vault.collateralAmount, vault.debtAmount, vault.accruedInterest, protocol.wbtcPrice])

  const simulateTransaction = async (action: string, amount?: string) => {
    setIsLoading(true)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Transacción simulada",
      description: `${action} ${amount ? `de ${amount}` : ""} completado exitosamente`,
    })

    setIsLoading(false)
  }

  const depositCollateral = async (amount: string) => {
    const amountWei = parseUnits(amount, 8)
    setVault((prev) => ({
      ...prev,
      collateralAmount: prev.collateralAmount + amountWei,
    }))
    await simulateTransaction("Depósito de colateral", `${amount} WBTC`)
  }

  const borrow = async (amount: string) => {
    const amountWei = parseUnits(amount, 18)
    setVault((prev) => ({
      ...prev,
      debtAmount: prev.debtAmount + amountWei,
      ltv: Math.min(60, prev.ltv + 10),
    }))
    await simulateTransaction("Préstamo", `${amount} mUSD`)
  }

  const withdrawCollateral = async (amount: string) => {
    const amountWei = parseUnits(amount, 8)
    setVault((prev) => ({
      ...prev,
      collateralAmount: prev.collateralAmount - amountWei,
    }))
    await simulateTransaction("Retiro de colateral", `${amount} WBTC`)
  }

  const repay = async (amount: string) => {
    const amountWei = parseUnits(amount, 18)
    setVault((prev) => ({
      ...prev,
      debtAmount: prev.debtAmount - amountWei,
      ltv: Math.max(0, prev.ltv - 10),
    }))
    await simulateTransaction("Pago de deuda", `${amount} mUSD`)
  }

  const liquidate = async (userAddress: string, repayAmount: string) => {
    await simulateTransaction("Liquidación", `${repayAmount} mUSD`)
  }

  const closeVault = async () => {
    setVault((prev) => ({ ...prev, isActive: false }))
    await simulateTransaction("Cierre de vault")
  }

  const approveWbtc = async (amount: bigint) => {
    await simulateTransaction("Aprobación WBTC")
  }

  const approveMusd = async (amount: bigint) => {
    await simulateTransaction("Aprobación mUSD")
  }

  const refreshData = () => {
    // Simulate data refresh
    toast({
      title: "Datos actualizados",
      description: "Información sincronizada con la blockchain",
    })
  }

  return {
    // Data
    vault,
    protocol,
    balances: {
      wbtc: balances.wbtc,
      musd: balances.musd,
    },
    allowances: {
      wbtc: BigInt("1000000000000000000000"), // High allowance for demo
      musd: BigInt("1000000000000000000000"),
    },

    // Actions
    depositCollateral,
    withdrawCollateral,
    borrow,
    repay,
    closeVault,
    liquidate,
    approveWbtc,
    approveMusd,
    refreshData,

    // States
    isLoading,
    isConnected: mockWallet.isConnected,
  }
}

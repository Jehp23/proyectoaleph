"use client"

import { useEffect, useState } from "react"
import { useVaultList, type VaultListItem } from "./useVaultList"

export interface LiquidatableVault extends VaultListItem {
  liquidationReward: number
  maxLiquidationAmount: number
}

export function useLiquidatableVaults() {
  const { vaults, isLoading: vaultsLoading, error: vaultsError } = useVaultList()
  const [liquidatableVaults, setLiquidatableVaults] = useState<LiquidatableVault[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setIsLoading(vaultsLoading)
      setError(vaultsError)

      if (!vaultsLoading && !vaultsError) {
        const liquidatable = vaults
          .filter((vault) => vault.isActive && vault.healthFactor < 1.0)
          .map((vault) => {
            const totalDebt = vault.debtAmount + vault.accruedInterest
            const maxLiquidationAmount = totalDebt * 0.5 // Max 50% liquidation
            const liquidationReward = maxLiquidationAmount * 0.1 // 10% bonus

            return {
              ...vault,
              liquidationReward,
              maxLiquidationAmount,
            }
          })
          .sort((a, b) => a.healthFactor - b.healthFactor) // Most at risk first

        setLiquidatableVaults(liquidatable)
      }
    } catch (err) {
      console.error("Error processing liquidatable vaults:", err)
      setError(err instanceof Error ? err.message : "Failed to process liquidatable vaults")
    }
  }, [vaults, vaultsLoading, vaultsError])

  return {
    liquidatableVaults,
    count: liquidatableVaults.length,
    isLoading,
    error,
    refetch: () => setIsLoading(true),
  }
}

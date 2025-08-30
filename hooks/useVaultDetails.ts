"use client"

import { useEffect, useState } from "react"
import type { Address } from "viem"
import { readVaultData } from "@/lib/onchain"

export interface VaultDetails {
  owner: Address
  collateralAmount: number
  debtAmount: number
  accruedInterest: number
  ltv: number
  healthFactor: number
  liquidationPrice: number
  isActive: boolean
  totalDebt: number
  collateralValueUsd: number
  availableToBorrow: number
  liquidationRisk: "safe" | "warning" | "danger"
  timeToLiquidation?: number // Estimated time in seconds if price keeps falling
}

export function useVaultDetails(owner: Address | undefined) {
  const [vaultDetails, setVaultDetails] = useState<VaultDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchVaultDetails() {
      if (!owner) {
        if (mounted) {
          setVaultDetails(null)
          setIsLoading(false)
          setError(null)
        }
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const vaultData = await readVaultData(owner)

        if (!vaultData.isActive) {
          if (mounted) {
            setVaultDetails(null)
          }
          return
        }

        const totalDebt = vaultData.debtAmount + vaultData.accruedInterest
        const collateralValueUsd = vaultData.collateralAmount * 45000 // TODO: Use real BTC price
        const maxBorrowable = collateralValueUsd * 0.6 // 60% LTV max
        const availableToBorrow = Math.max(0, maxBorrowable - totalDebt)

        let liquidationRisk: "safe" | "warning" | "danger"
        if (vaultData.healthFactor >= 1.5) {
          liquidationRisk = "safe"
        } else if (vaultData.healthFactor >= 1.1) {
          liquidationRisk = "warning"
        } else {
          liquidationRisk = "danger"
        }

        const details: VaultDetails = {
          owner,
          ...vaultData,
          totalDebt,
          collateralValueUsd,
          availableToBorrow,
          liquidationRisk,
        }

        if (mounted) {
          setVaultDetails(details)
        }
      } catch (err) {
        console.error("Error fetching vault details:", err)
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to fetch vault details")
          setVaultDetails(null)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchVaultDetails()

    const interval = setInterval(fetchVaultDetails, 5000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [owner])

  return {
    vaultDetails,
    isLoading,
    error,
    refetch: () => setIsLoading(true),
  }
}

"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { readVaultData } from "@/lib/onchain"

export interface UserVault {
  collateralAmount: number
  debtAmount: number
  accruedInterest: number
  ltv: number
  healthFactor: number
  liquidationPrice: number
  isActive: boolean
}

export function useUserVaults() {
  const { address } = useAccount()
  const [vault, setVault] = useState<UserVault | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchUserVault() {
      if (!address) {
        if (mounted) {
          setVault(null)
          setIsLoading(false)
          setError(null)
        }
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const vaultData = await readVaultData(address)

        if (mounted) {
          setVault(vaultData.isActive ? vaultData : null)
        }
      } catch (err) {
        console.error("Error fetching user vault:", err)
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to fetch user vault")
          setVault(null)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchUserVault()

    const interval = setInterval(fetchUserVault, 6000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [address])

  return {
    vault,
    hasVault: vault !== null,
    isLoading,
    error,
    refetch: () => setIsLoading(true),
  }
}

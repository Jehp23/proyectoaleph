"use client"

import { useEffect, useState } from "react"
import type { Address } from "viem"
import { usePublicClient } from "wagmi"
import { getContracts } from "@/lib/contracts"

export interface VaultListItem {
  owner: Address
  collateralAmount: number
  debtAmount: number
  accruedInterest: number
  ltv: number
  healthFactor: number
  liquidationPrice: number
  isActive: boolean
}

export function useVaultList() {
  const [vaults, setVaults] = useState<VaultListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const publicClient = usePublicClient()

  useEffect(() => {
    let mounted = true

    async function fetchVaultList() {
      if (!publicClient) return

      try {
        setIsLoading(true)
        setError(null)

        const contracts = getContracts()
        if (!contracts.vaultManager) {
          throw new Error("VaultManager contract not configured")
        }

        const protocolData = await publicClient.readContract({
          address: contracts.vaultManager,
          abi: contracts.vaultManagerAbi,
          functionName: "getProtocolData",
        })

        const vaultCount = Number(protocolData[2])

        // we'll need to track known vault owners. For now, return empty array
        // until we implement event indexing or subgraph
        const vaultList: VaultListItem[] = []

        // TODO: Implement proper vault enumeration via:
        // 1. Event logs scanning for VaultCreated events
        // 2. Subgraph integration
        // 3. Backend indexing service

        if (mounted) {
          setVaults(vaultList)
        }
      } catch (err) {
        console.error("Error fetching vault list:", err)
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to fetch vault list")
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchVaultList()

    const interval = setInterval(fetchVaultList, 10000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [publicClient])

  return { vaults, isLoading, error, refetch: () => setIsLoading(true) }
}

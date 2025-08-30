"use client"

import type React from "react"

import { useEffect } from "react"
import { useVault } from "@/hooks/useVault"
import { useStore } from "@/lib/store"
import { LIQUIDATION_THRESHOLD_PERCENT, ANNUAL_INTEREST_RATE } from "@/lib/risk-params"

/**
 * Component to sync blockchain data with Zustand store
 * This bridges the gap between wagmi hooks and existing UI components
 */
export function BlockchainProvider({ children }: { children: React.ReactNode }) {
  const { vault, protocol, isConnected } = useVault()
  const { updateBtcPrice, vaults, createVault: createMockVault } = useStore()

  // Sync BTC price from blockchain to store
  useEffect(() => {
    if (protocol?.wbtcPrice && protocol.wbtcPrice !== 0) {
      updateBtcPrice(protocol.wbtcPrice)
    }
  }, [protocol?.wbtcPrice, updateBtcPrice])

  // Sync user vault data (if needed for compatibility with existing components)
  useEffect(() => {
    if (isConnected && vault?.isActive) {
      // Convert blockchain vault data to store format if needed
      // This maintains compatibility with existing UI components
      const mockVault = {
        id: "user-vault",
        owner: "Connected User",
        btcCollateral: vault.collateralAmount,
        usdtBorrowed: vault.debtAmount + vault.accruedInterest,
        ltv: vault.ltv,
        liquidationThreshold: LIQUIDATION_THRESHOLD_PERCENT,
        healthFactor: vault.healthFactor,
        healthLevel:
          vault.healthFactor >= 1.5
            ? ("Healthy" as const)
            : vault.healthFactor >= 1.1
              ? ("Warning" as const)
              : ("Critical" as const),
        status: "Active" as const,
        createdAt: new Date(),
        btcPrice: protocol?.wbtcPrice || 45000,
        interestRate: ANNUAL_INTEREST_RATE,
        lastInterestUpdate: new Date(),
        accruedInterest: vault.accruedInterest,
      }

      // Only add if not already exists
      const existingVault = vaults.find((v) => v.id === "user-vault")
      if (!existingVault) {
        createMockVault(mockVault)
      }
    }
  }, [isConnected, vault, protocol, vaults, createMockVault])

  return <>{children}</>
}

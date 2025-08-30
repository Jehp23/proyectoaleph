"use client"

import { create } from "zustand"

export type VaultStatus = "Active" | "Liquidated" | "Closed"
export type HealthLevel = "Healthy" | "Warning" | "Critical"

export interface Vault {
  id: string
  owner: string
  btcCollateral: bigint // BTC amount in satoshis
  usdtBorrowed: bigint // USDT amount in wei
  ltv: number // Loan-to-value ratio percentage
  liquidationThreshold: number // Liquidation threshold percentage
  healthFactor: number // Health factor (>1 is safe)
  healthLevel: HealthLevel
  status: VaultStatus
  createdAt: Date
  liquidatedAt?: Date
  closedAt?: Date
  btcPrice: number // BTC price in USD when vault was created
  interestRate: number // Annual interest rate percentage
  lastInterestUpdate: Date
  accruedInterest: bigint // Accrued interest in USDT wei
}

interface StoreState {
  vaults: Vault[]
  btcPrice: number // Current BTC price in USD
  totalValueLocked: bigint // Total BTC locked in protocol
  totalBorrowed: bigint // Total USDT borrowed
  createVault: (
    vault: Omit<Vault, "id" | "createdAt" | "healthFactor" | "healthLevel" | "accruedInterest" | "lastInterestUpdate">,
  ) => void
  liquidateVault: (id: string) => void
  closeVault: (id: string) => void
  updateBtcPrice: (price: number) => void
  addCollateral: (id: string, amount: bigint) => void
  borrowMore: (id: string, amount: bigint) => void
  repayDebt: (id: string, amount: bigint) => void
}

// Helper function to calculate health factor
const calculateHealthFactor = (
  btcCollateral: bigint,
  usdtBorrowed: bigint,
  btcPrice: number,
  liquidationThreshold: number,
): number => {
  if (usdtBorrowed === BigInt(0)) return 999 // No debt = very healthy
  const collateralValue = (Number(btcCollateral) * btcPrice) / 100000000 // Convert satoshis to BTC
  const borrowedValue = Number(usdtBorrowed) / 1000000 // Convert wei to USDT
  return (collateralValue * liquidationThreshold) / 100 / borrowedValue
}

// Helper function to determine health level
const getHealthLevel = (healthFactor: number): HealthLevel => {
  if (healthFactor >= 1.5) return "Healthy"
  if (healthFactor >= 1.1) return "Warning"
  return "Critical"
}

export const useStore = create<StoreState>()((set, get) => ({
  btcPrice: 45000, // $45,000 USD
  totalValueLocked: BigInt(500000000), // 5 BTC in satoshis
  totalBorrowed: BigInt(150000000000), // 150,000 USDT in wei
  vaults: [
    // Mock data
    {
      id: "1",
      owner: "0x1234...5678",
      btcCollateral: BigInt(100000000), // 1 BTC
      usdtBorrowed: BigInt(30000000000), // 30,000 USDT
      ltv: 67, // 67% LTV
      liquidationThreshold: 75,
      healthFactor: 1.12,
      healthLevel: "Warning",
      status: "Active",
      createdAt: new Date("2024-01-15"),
      btcPrice: 45000,
      interestRate: 8.5,
      lastInterestUpdate: new Date("2024-01-20"),
      accruedInterest: BigInt(125000000), // 125 USDT
    },
    {
      id: "2",
      owner: "0x2345...6789",
      btcCollateral: BigInt(200000000), // 2 BTC
      usdtBorrowed: BigInt(50000000000), // 50,000 USDT
      ltv: 56, // 56% LTV
      liquidationThreshold: 75,
      healthFactor: 1.35,
      healthLevel: "Healthy",
      status: "Active",
      createdAt: new Date("2024-01-10"),
      btcPrice: 44500,
      interestRate: 8.5,
      lastInterestUpdate: new Date("2024-01-18"),
      accruedInterest: BigInt(200000000), // 200 USDT
    },
    {
      id: "3",
      owner: "0x3456...7890",
      btcCollateral: BigInt(50000000), // 0.5 BTC
      usdtBorrowed: BigInt(20000000000), // 20,000 USDT
      ltv: 89, // 89% LTV - very risky
      liquidationThreshold: 75,
      healthFactor: 0.84,
      healthLevel: "Critical",
      status: "Liquidated",
      createdAt: new Date("2024-01-05"),
      liquidatedAt: new Date("2024-01-22"),
      btcPrice: 44000,
      interestRate: 8.5,
      lastInterestUpdate: new Date("2024-01-22"),
      accruedInterest: BigInt(150000000), // 150 USDT
    },
  ],
  createVault: (vaultData) => {
    const healthFactor = calculateHealthFactor(
      vaultData.btcCollateral,
      vaultData.usdtBorrowed,
      vaultData.btcPrice,
      vaultData.liquidationThreshold,
    )
    const newVault: Vault = {
      ...vaultData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      healthFactor,
      healthLevel: getHealthLevel(healthFactor),
      accruedInterest: BigInt(0),
      lastInterestUpdate: new Date(),
    }
    set((state) => ({
      vaults: [...state.vaults, newVault],
      totalValueLocked: state.totalValueLocked + vaultData.btcCollateral,
      totalBorrowed: state.totalBorrowed + vaultData.usdtBorrowed,
    }))
  },
  liquidateVault: (id) => {
    set((state) => ({
      vaults: state.vaults.map((vault) =>
        vault.id === id ? { ...vault, status: "Liquidated" as VaultStatus, liquidatedAt: new Date() } : vault,
      ),
    }))
  },
  closeVault: (id) => {
    set((state) => ({
      vaults: state.vaults.map((vault) =>
        vault.id === id ? { ...vault, status: "Closed" as VaultStatus, closedAt: new Date() } : vault,
      ),
    }))
  },
  updateBtcPrice: (price) => {
    set((state) => ({
      btcPrice: price,
      vaults: state.vaults.map((vault) => {
        if (vault.status !== "Active") return vault
        const healthFactor = calculateHealthFactor(
          vault.btcCollateral,
          vault.usdtBorrowed,
          price,
          vault.liquidationThreshold,
        )
        return {
          ...vault,
          healthFactor,
          healthLevel: getHealthLevel(healthFactor),
        }
      }),
    }))
  },
  addCollateral: (id, amount) => {
    set((state) => ({
      vaults: state.vaults.map((vault) => {
        if (vault.id !== id) return vault
        const newCollateral = vault.btcCollateral + amount
        const healthFactor = calculateHealthFactor(
          newCollateral,
          vault.usdtBorrowed,
          state.btcPrice,
          vault.liquidationThreshold,
        )
        return {
          ...vault,
          btcCollateral: newCollateral,
          healthFactor,
          healthLevel: getHealthLevel(healthFactor),
          ltv: Math.round(
            (Number(vault.usdtBorrowed) / 1000000 / ((Number(newCollateral) * state.btcPrice) / 100000000)) * 100,
          ),
        }
      }),
      totalValueLocked: state.totalValueLocked + amount,
    }))
  },
  borrowMore: (id, amount) => {
    set((state) => ({
      vaults: state.vaults.map((vault) => {
        if (vault.id !== id) return vault
        const newBorrowed = vault.usdtBorrowed + amount
        const healthFactor = calculateHealthFactor(
          vault.btcCollateral,
          newBorrowed,
          state.btcPrice,
          vault.liquidationThreshold,
        )
        return {
          ...vault,
          usdtBorrowed: newBorrowed,
          healthFactor,
          healthLevel: getHealthLevel(healthFactor),
          ltv: Math.round(
            (Number(newBorrowed) / 1000000 / ((Number(vault.btcCollateral) * state.btcPrice) / 100000000)) * 100,
          ),
        }
      }),
      totalBorrowed: state.totalBorrowed + amount,
    }))
  },
  repayDebt: (id, amount) => {
    set((state) => ({
      vaults: state.vaults.map((vault) => {
        if (vault.id !== id) return vault
        const newBorrowed = vault.usdtBorrowed - amount
        const healthFactor = calculateHealthFactor(
          vault.btcCollateral,
          newBorrowed,
          state.btcPrice,
          vault.liquidationThreshold,
        )
        return {
          ...vault,
          usdtBorrowed: newBorrowed,
          healthFactor,
          healthLevel: getHealthLevel(healthFactor),
          ltv:
            newBorrowed > 0
              ? Math.round(
                  (Number(newBorrowed) / 1000000 / ((Number(vault.btcCollateral) * state.btcPrice) / 100000000)) * 100,
                )
              : 0,
        }
      }),
      totalBorrowed: state.totalBorrowed - amount,
    }))
  },
}))

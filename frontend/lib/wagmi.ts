"use client"

export const SUPPORTED_CHAINS = {
  sepolia: {
    id: 11155111,
    name: "Sepolia",
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "",
  },
  hardhat: {
    id: 31337,
    name: "Hardhat",
    rpcUrl: "http://127.0.0.1:8545",
  },
} as const

export const config = {
  appName: "CauciónBTC",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "caucionbtc-demo",
  chains: [SUPPORTED_CHAINS.sepolia, SUPPORTED_CHAINS.hardhat],
}

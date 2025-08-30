"use client"

import { createConfig, http } from "wagmi"
import { sepolia, hardhat } from "wagmi/chains"
import { metaMask, walletConnect } from "wagmi/connectors"

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

export const config = createConfig({
  chains: [sepolia, hardhat],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "caucionbtc-demo",
    }),
  ],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
})

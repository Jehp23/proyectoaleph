"use client"

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia, hardhat } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'CauciónBTC',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [sepolia, hardhat],
  ssr: true,
})

export const SUPPORTED_CHAINS = {
  sepolia: {
    id: 11155111,
    name: 'Sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  },
  hardhat: {
    id: 31337,
    name: 'Hardhat',
    rpcUrl: 'http://127.0.0.1:8545',
  },
} as const

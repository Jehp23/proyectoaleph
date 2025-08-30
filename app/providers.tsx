"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia, hardhat } from 'wagmi/chains'
import { useState } from 'react'

import '@rainbow-me/rainbowkit/styles.css'

const config = getDefaultConfig({
  appName: 'CauciónBTC',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'caucionbtc-demo',
  chains: [sepolia, hardhat],
  ssr: true,
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

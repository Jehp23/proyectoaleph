"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, createConfig, http } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"
import { ExecutionModeProvider } from "@/lib/execution-mode-context"
import type { ReactNode } from "react"

const queryClient = new QueryClient()

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111)
const CHAIN = CHAIN_ID === 1 ? mainnet : sepolia

const wagmiConfig = createConfig({
  chains: [CHAIN],
  transports: { [CHAIN.id]: http(process.env.NEXT_PUBLIC_RPC_URL) },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ExecutionModeProvider>{children}</ExecutionModeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

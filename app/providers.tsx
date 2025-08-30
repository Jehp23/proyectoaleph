"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { config } from "@/lib/wagmi"
import { ExecutionModeProvider } from "@/lib/execution-mode-context"
import type { ReactNode } from "react"

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ExecutionModeProvider>{children}</ExecutionModeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

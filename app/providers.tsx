"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MockWalletProvider } from "@/lib/mock-wallet"
import { ExecutionModeProvider } from "@/lib/execution-mode-context"
import type { ReactNode } from "react"

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MockWalletProvider>
      <QueryClientProvider client={queryClient}>
        <ExecutionModeProvider>{children}</ExecutionModeProvider>
      </QueryClientProvider>
    </MockWalletProvider>
  )
}

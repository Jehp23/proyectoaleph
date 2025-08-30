"use client"

import "@rainbow-me/rainbowkit/styles.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit"
import { config } from "@/lib/wagmi"
import { useTheme } from "next-themes"
import { ExecutionModeProvider } from "@/lib/execution-mode-context"
import type { ReactNode } from "react"

const queryClient = new QueryClient()

function RainbowKitThemeProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme()

  return (
    <RainbowKitProvider
      theme={theme === "dark" ? darkTheme() : lightTheme()}
      appInfo={{
        appName: "CauciónBTC",
        learnMoreUrl: "https://caucionbtc.com",
      }}
    >
      {children}
    </RainbowKitProvider>
  )
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitThemeProvider>
          <ExecutionModeProvider>{children}</ExecutionModeProvider>
        </RainbowKitThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

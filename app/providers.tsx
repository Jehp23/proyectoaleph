"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// Mock wallet context to replace RainbowKit functionality
interface WalletContextType {
  address: string | null
  isConnected: boolean
  connect: () => void
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType | null>(null)

export function useAccount() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useAccount must be used within Providers")
  }
  return context
}

export function Providers({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const connect = () => {
    setAddress("0x742d35Cc6634C0532925a3b8D4C9db96590c6C87")
    setIsConnected(true)
  }

  const disconnect = () => {
    setAddress(null)
    setIsConnected(false)
  }

  return (
    <WalletContext.Provider value={{ address, isConnected, connect, disconnect }}>{children}</WalletContext.Provider>
  )
}

"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

// Mock wallet types
export interface MockWalletState {
  isConnected: boolean
  address?: string
  isConnecting: boolean
  error?: string
}

export interface MockWalletActions {
  connect: () => Promise<void>
  disconnect: () => void
}

// Mock wallet context
const MockWalletContext = createContext<(MockWalletState & MockWalletActions) | null>(null)

// Mock wallet provider
export function MockWalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MockWalletState>({
    isConnected: false,
    isConnecting: false,
  })

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: undefined }))

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock successful connection
    setState({
      isConnected: true,
      address: "0x1234567890123456789012345678901234567890",
      isConnecting: false,
    })
  }, [])

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      address: undefined,
      isConnecting: false,
    })
  }, [])

  return <MockWalletContext.Provider value={{ ...state, connect, disconnect }}>{children}</MockWalletContext.Provider>
}

// Mock wagmi hooks
export function useAccount() {
  const context = useContext(MockWalletContext)
  if (!context) {
    throw new Error("useAccount must be used within MockWalletProvider")
  }

  return {
    address: context.address,
    isConnected: context.isConnected,
    isConnecting: context.isConnecting,
  }
}

export function useConnect() {
  const context = useContext(MockWalletContext)
  if (!context) {
    throw new Error("useConnect must be used within MockWalletProvider")
  }

  return {
    connect: context.connect,
    isLoading: context.isConnecting,
    error: context.error,
  }
}

export function useDisconnect() {
  const context = useContext(MockWalletContext)
  if (!context) {
    throw new Error("useDisconnect must be used within MockWalletProvider")
  }

  return {
    disconnect: context.disconnect,
  }
}

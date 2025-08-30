"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// Mock wallet state
interface WalletState {
  isConnected: boolean
  address?: string
  chainId?: number
}

interface WalletContextType {
  isConnected: boolean
  address?: string
  chainId?: number
  connect: () => Promise<void>
  disconnect: () => void
  isConnecting: boolean
}

const WalletContext = createContext<WalletContextType | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: undefined,
    chainId: undefined,
  })
  const [isConnecting, setIsConnecting] = useState(false)

  const connect = async () => {
    setIsConnecting(true)
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock successful connection
    setWallet({
      isConnected: true,
      address: "0x1234567890123456789012345678901234567890",
      chainId: 11155111, // Sepolia
    })
    setIsConnecting(false)
  }

  const disconnect = () => {
    setWallet({
      isConnected: false,
      address: undefined,
      chainId: undefined,
    })
  }

  return (
    <WalletContext.Provider
      value={{
        ...wallet,
        connect,
        disconnect,
        isConnecting,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

// Mock hooks that match wagmi's interface
export function useAccount() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useAccount must be used within WalletProvider")
  }

  return {
    address: context.address,
    isConnected: context.isConnected,
    chainId: context.chainId,
  }
}

export function useConnect() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useConnect must be used within WalletProvider")
  }

  return {
    connect: context.connect,
    isConnecting: context.isConnecting,
  }
}

export function useDisconnect() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useDisconnect must be used within WalletProvider")
  }

  return {
    disconnect: context.disconnect,
  }
}

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

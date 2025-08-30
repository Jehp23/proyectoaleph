"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatAddress } from "@/lib/utils"
import { useState } from "react"

// Mock wallet hook to replace external import
function useAccount() {
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

  return { address, isConnected, connect, disconnect }
}

export function Header() {
  const { address, isConnected, connect, disconnect } = useAccount()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">CautioLink</h1>
          <Badge variant="outline" className="text-xs">
            Sepolia
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          {isConnected && address && (
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Conectado:</span>
              <code className="bg-muted px-2 py-1 rounded text-xs">{formatAddress(address)}</code>
            </div>
          )}
          {isConnected ? (
            <Button variant="outline" onClick={disconnect}>
              Desconectar
            </Button>
          ) : (
            <Button onClick={connect}>Conectar Wallet</Button>
          )}
        </div>
      </div>
    </header>
  )
}

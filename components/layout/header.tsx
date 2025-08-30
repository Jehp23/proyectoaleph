"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAccount, useConnect, useDisconnect } from "wagmi"

export function Header() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = () => {
    const metaMaskConnector = connectors.find((connector) => connector.name === "MetaMask")
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">CauciónBTC</h1>
          <Badge variant="outline" className="text-xs">
            Sepolia
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <Button variant="outline" size="sm" onClick={() => disconnect()}>
                Desconectar
              </Button>
            </div>
          ) : (
            <Button onClick={handleConnect}>Conectar Wallet</Button>
          )}
        </div>
      </div>
    </header>
  )
}

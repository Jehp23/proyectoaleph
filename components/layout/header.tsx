"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import Link from "next/link"

export function Header() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = () => {
    const connector = connectors[0]
    if (connector) {
      connect({ connector })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-bold hover:opacity-80">
              CauciónBTC
            </Link>
            <Badge variant="outline" className="text-xs">
              Sepolia
            </Badge>
          </div>

          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/new" className="hover:text-primary transition-colors">
              Abrir bóveda
            </Link>
            <Link href="/liquidations" className="hover:text-primary transition-colors">
              Liquidaciones
            </Link>
            <Link href="/addresses" className="hover:text-primary transition-colors">
              Contracts
            </Link>
            <Link href="/settings" className="hover:text-primary transition-colors">
              Settings
            </Link>
          </nav>
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

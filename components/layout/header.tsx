"use client"

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Badge } from "@/components/ui/badge"
import { useAccount } from 'wagmi'
import { formatAddress } from '@/lib/utils'

export function Header() {
  const { address, isConnected } = useAccount()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">CauciónBTC</h1>
          <Badge variant="outline" className="text-xs">
            Sepolia
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          {isConnected && address && (
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Conectado:</span>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                {formatAddress(address)}
              </code>
            </div>
          )}
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet } from "lucide-react"

export function Header() {
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
          <Button variant="outline" className="gap-2 bg-transparent">
            <Wallet className="h-4 w-4" />
            Conectar wallet
          </Button>
        </div>
      </div>
    </header>
  )
}

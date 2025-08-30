// components/Header.tsx (o donde lo tengas)
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAddress } from "@/lib/utils";
import { useWallet } from "@/hooks/useWallet";

export function Header() {
  const { hasProvider, address, isSepolia, connect, disconnect, ensureSepolia } = useWallet();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">CautioLink</h1>
          <Badge variant="outline" className="text-xs">
            {isSepolia ? "Sepolia" : "Red desconocida"}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {!hasProvider && (
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noreferrer"
              className="text-sm underline"
            >
              Instalar MetaMask
            </a>
          )}

          {address && (
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Conectado:</span>
              <code className="bg-muted px-2 py-1 rounded text-xs">{formatAddress(address)}</code>
            </div>
          )}

          {address ? (
            <>
              {!isSepolia && (
                <Button variant="outline" size="sm" onClick={ensureSepolia}>
                  Cambiar a Sepolia
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={disconnect}>
                Desconectar
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={connect} disabled={!hasProvider}>
              Conectar wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}


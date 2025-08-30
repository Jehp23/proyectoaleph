"use client"

import { loadAddresses, type Addresses } from "@/lib/addresses"
import { EXPLORER_BASE } from "@/lib/explorer"
import { AddressLink } from "@/components/ui/ExplorerLink"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { isAddress } from "viem"
import { ExternalLink } from "lucide-react"

export default function AddressesPage() {
  const [a, setA] = useState<Addresses | null>(null)

  useEffect(() => {
    setA(loadAddresses())
  }, [])

  const Row = ({ label, value }: { label: string; value?: string }) => (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="font-mono text-sm">
        {value && isAddress(value as `0x${string}`) ? (
          <AddressLink address={value as `0x${string}`} />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
    </div>
  )

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Direcciones de contratos</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contratos del protocolo</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enlaces al explorador ( <span className="font-mono text-xs">{EXPLORER_BASE}</span> ). Puedes configurar
              direcciones en{" "}
              <a href="/settings" className="underline hover:no-underline">
                Settings
              </a>
              .
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <Row label="VAULT_MANAGER" value={a?.VAULT_MANAGER} />
              <Row label="WBTC" value={a?.WBTC} />
              <Row label="MUSD" value={a?.MUSD} />
              <Row label="ORACLE" value={a?.ORACLE} />
            </div>
          </CardContent>
        </Card>

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Tip:</strong> Guarda estas direcciones en{" "}
              <code className="bg-background px-1 rounded">localStorage</code> desde{" "}
              <a href="/settings" className="underline hover:no-underline">
                /settings
              </a>{" "}
              o defínelas en variables de entorno <code className="bg-background px-1 rounded">NEXT_PUBLIC_…</code>.
            </p>
            <p>
              El explorador se resuelve automáticamente según la chain ID o puedes forzarlo con{" "}
              <code className="bg-background px-1 rounded">NEXT_PUBLIC_EXPLORER_BASE</code>.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RiskBadge } from "./risk-badge"
import { Money } from "./money"
import { Eye, TrendingUp } from "lucide-react"
import type { Loan } from "@/lib/store"
import Link from "next/link"

interface LoanCardProps {
  loan: Loan
  onInvest?: (loanId: string) => void
}

const statusConfig = {
  Requested: { label: "Solicitado", variant: "secondary" as const },
  Active: { label: "Activo", variant: "default" as const },
  Repaid: { label: "Pagado", variant: "outline" as const },
  Defaulted: { label: "En mora", variant: "destructive" as const },
  Settled: { label: "Cerrado", variant: "outline" as const },
}

export function LoanCard({ loan, onInvest }: LoanCardProps) {
  const aprPercent = loan.aprBps / 100
  const statusInfo = statusConfig[loan.status]

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              <Money amount={loan.principal} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">APR:</span>
              <span className="font-semibold text-green-500">{aprPercent}%</span>
            </div>
          </div>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Plazo:</span>
            <div className="font-medium">{loan.durationDays} días</div>
          </div>
          <div>
            <span className="text-muted-foreground">Score:</span>
            <div className="font-medium">{loan.score}/100</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <RiskBadge level={loan.riskLevel} />
          <div className="flex gap-2">
            <Link href={`/loans/${loan.id}`}>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Eye className="h-4 w-4" />
                Ver
              </Button>
            </Link>
            {loan.status === "Requested" && onInvest && (
              <Button size="sm" onClick={() => onInvest(loan.id)} className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Invertir
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

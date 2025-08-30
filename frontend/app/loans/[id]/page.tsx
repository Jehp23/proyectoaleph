"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { RiskBadge } from "@/components/ui/risk-badge"
import { Money } from "@/components/ui/money"
import { Timeline } from "@/components/ui/timeline"
import { ProgressBar } from "@/components/ui/progress-bar"
import { TxModal } from "@/components/ui/tx-modal"
import { useStore } from "@/lib/store"
import { ArrowLeft, Calendar, TrendingUp, CreditCard, X, Clock, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"

interface LoanDetailPageProps {
  params: { id: string }
}

const statusConfig = {
  Requested: { label: "Solicitado", variant: "secondary" as const, color: "text-yellow-500" },
  Active: { label: "Activo", variant: "default" as const, color: "text-blue-500" },
  Repaid: { label: "Pagado", variant: "outline" as const, color: "text-green-500" },
  Defaulted: { label: "En mora", variant: "destructive" as const, color: "text-red-500" },
  Settled: { label: "Cerrado", variant: "outline" as const, color: "text-gray-500" },
}

export default function LoanDetailPage({ params }: LoanDetailPageProps) {
  const { loans, mode, fundLoan, repayAll, closeIfRepaid } = useStore()
  const router = useRouter()
  const [showTxModal, setShowTxModal] = useState(false)
  const [txAction, setTxAction] = useState<"fund" | "repay" | "close" | null>(null)

  const loan = loans.find((l) => l.id === params.id)

  if (!loan) {
    notFound()
  }

  const statusInfo = statusConfig[loan.status]
  const aprPercent = loan.aprBps / 100
  const interestAmount = (Number(loan.principal) * aprPercent * loan.durationDays) / (365 * 100)
  const totalAmount = Number(loan.principal) + interestAmount
  const progressPercentage = (Number(loan.amountPaid) / Number(loan.principal)) * 100

  // Mock payment history
  const paymentHistory = [
    {
      date: "2024-01-16",
      type: "Financiamiento",
      amount: Number(loan.principal),
      status: "Completado",
    },
    ...(loan.status === "Active" || loan.status === "Repaid"
      ? [
          {
            date: "2024-01-20",
            type: "Pago parcial",
            amount: Number(loan.amountPaid),
            status: "Completado",
          },
        ]
      : []),
  ]

  // Mock upcoming payments
  const upcomingPayments =
    loan.status === "Active" && loan.nextPaymentDate
      ? [
          {
            date: loan.nextPaymentDate.toLocaleDateString("es-ES"),
            amount: Number(loan.principal) - Number(loan.amountPaid),
            type: "Pago final",
          },
        ]
      : []

  const handleAction = (action: "fund" | "repay" | "close") => {
    setTxAction(action)
    setShowTxModal(true)
  }

  const handleConfirmAction = async () => {
    if (!txAction) return

    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 1000))

    switch (txAction) {
      case "fund":
        fundLoan(loan.id, "0xYour...Address")
        break
      case "repay":
        repayAll(loan.id)
        break
      case "close":
        closeIfRepaid(loan.id)
        break
    }

    setTxAction(null)
  }

  const getActionTitle = () => {
    switch (txAction) {
      case "fund":
        return "Financiar préstamo"
      case "repay":
        return "Pagar préstamo completo"
      case "close":
        return "Cerrar préstamo"
      default:
        return ""
    }
  }

  const getActionDescription = () => {
    switch (txAction) {
      case "fund":
        return `Confirma el financiamiento de ${Number(loan.principal) / 1000000} mUSD`
      case "repay":
        return `Confirma el pago completo de ${(Number(loan.principal) - Number(loan.amountPaid)) / 1000000} mUSD`
      case "close":
        return "Confirma el cierre del préstamo completamente pagado"
      default:
        return ""
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                <Money amount={loan.principal} />
              </h1>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </div>
            <p className="text-muted-foreground">Préstamo #{loan.id}</p>
          </div>
        </div>

        {/* Main Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Resumen del préstamo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">APR</div>
                    <div className="text-lg font-semibold text-green-500">{aprPercent}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Plazo</div>
                    <div className="text-lg font-semibold">{loan.durationDays} días</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Score</div>
                    <div className="text-lg font-semibold">{loan.score}/100</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Riesgo</div>
                    <RiskBadge level={loan.riskLevel} />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Prestatario</div>
                    <div className="font-mono text-sm">{loan.borrower}</div>
                  </div>
                  {loan.lender && (
                    <div>
                      <div className="text-sm text-muted-foreground">Prestamista</div>
                      <div className="font-mono text-sm">{loan.lender}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Estado del préstamo</CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline currentStatus={loan.status} />
              </CardContent>
            </Card>

            {/* Progress */}
            {loan.status === "Active" && (
              <Card>
                <CardHeader>
                  <CardTitle>Progreso de pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressBar
                    value={Number(loan.amountPaid)}
                    max={Number(loan.principal)}
                    label="Monto pagado"
                    className="mb-4"
                  />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Pagado:</span>
                      <div className="font-semibold">
                        <Money amount={loan.amountPaid} />
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Restante:</span>
                      <div className="font-semibold">
                        <Money amount={Number(loan.principal) - Number(loan.amountPaid)} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pro Mode Advanced Parameters */}
            {mode === "pro" && (
              <Accordion type="single" collapsible>
                <AccordionItem value="advanced">
                  <AccordionTrigger>Parámetros avanzados</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Colateral %</div>
                          <div className="font-semibold">{loan.collateralPercent}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Colateral bloqueado</div>
                          <div className="font-semibold">
                            <Money amount={(Number(loan.principal) * loan.collateralPercent) / 100} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Tipo de amortización</div>
                        <div className="font-semibold">Pago único al vencimiento</div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loan.status === "Requested" && (
                  <Button onClick={() => handleAction("fund")} className="w-full gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Financiar
                  </Button>
                )}
                {loan.status === "Active" && (
                  <Button onClick={() => handleAction("repay")} className="w-full gap-2">
                    <CreditCard className="h-4 w-4" />
                    Pagar todo
                  </Button>
                )}
                {loan.status === "Repaid" && (
                  <Button
                    onClick={() => handleAction("close")}
                    variant="outline"
                    className="w-full gap-2 bg-transparent"
                  >
                    <X className="h-4 w-4" />
                    Cerrar
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Payments */}
            {upcomingPayments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Próximos vencimientos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingPayments.map((payment, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <div className="font-medium">{payment.type}</div>
                          <div className="text-sm text-muted-foreground">{payment.date}</div>
                        </div>
                        <div className="font-semibold">
                          <Money amount={payment.amount} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Historial de eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentHistory.map((event, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">{event.type}</div>
                        <div className="text-sm text-muted-foreground">{event.date}</div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {event.status}
                        </Badge>
                      </div>
                      <div className="font-semibold">
                        <Money amount={event.amount} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <TxModal
          open={showTxModal}
          onOpenChange={setShowTxModal}
          title={getActionTitle()}
          description={getActionDescription()}
          onConfirm={handleConfirmAction}
        />
      </div>
    </MainLayout>
  )
}

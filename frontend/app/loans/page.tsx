"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { LoanCard } from "@/components/ui/loan-card"
import { Toolbar } from "@/components/ui/toolbar"
import { EmptyState } from "@/components/ui/empty-state"
import { TxModal } from "@/components/ui/tx-modal"
import { useStore } from "@/lib/store"
import type { RiskLevel } from "@/lib/store"
import { Search } from "lucide-react"

export default function LoansPage() {
  const { loans, fundLoan } = useStore()
  const [aprRange, setAprRange] = useState<[number, number]>([5, 25])
  const [selectedDurations, setSelectedDurations] = useState<number[]>([])
  const [selectedRisks, setSelectedRisks] = useState<RiskLevel[]>([])
  const [showInvestModal, setShowInvestModal] = useState(false)
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null)

  // Filter loans
  const filteredLoans = loans.filter((loan) => {
    const aprPercent = loan.aprBps / 100
    const matchesApr = aprPercent >= aprRange[0] && aprPercent <= aprRange[1]
    const matchesDuration = selectedDurations.length === 0 || selectedDurations.includes(loan.durationDays)
    const matchesRisk = selectedRisks.length === 0 || selectedRisks.includes(loan.riskLevel)
    return matchesApr && matchesDuration && matchesRisk
  })

  const handleDurationToggle = (duration: number) => {
    setSelectedDurations((prev) => (prev.includes(duration) ? prev.filter((d) => d !== duration) : [...prev, duration]))
  }

  const handleRiskToggle = (risk: RiskLevel) => {
    setSelectedRisks((prev) => (prev.includes(risk) ? prev.filter((r) => r !== risk) : [...prev, risk]))
  }

  const handleClearFilters = () => {
    setAprRange([5, 25])
    setSelectedDurations([])
    setSelectedRisks([])
  }

  const handleInvest = (loanId: string) => {
    setSelectedLoanId(loanId)
    setShowInvestModal(true)
  }

  const handleConfirmInvestment = async () => {
    if (!selectedLoanId) return

    // Simulate investment transaction
    await new Promise((resolve) => setTimeout(resolve, 1000))

    fundLoan(selectedLoanId, "0xYour...Address")
    setSelectedLoanId(null)
  }

  const selectedLoan = selectedLoanId ? loans.find((l) => l.id === selectedLoanId) : null

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Explorar préstamos</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Toolbar
              aprRange={aprRange}
              onAprRangeChange={setAprRange}
              selectedDurations={selectedDurations}
              onDurationToggle={handleDurationToggle}
              selectedRisks={selectedRisks}
              onRiskToggle={handleRiskToggle}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Loans Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4">
              <p className="text-muted-foreground">
                {filteredLoans.length} préstamo{filteredLoans.length !== 1 ? "s" : ""} encontrado
                {filteredLoans.length !== 1 ? "s" : ""}
              </p>
            </div>

            {filteredLoans.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No se encontraron préstamos"
                description="Intenta ajustar los filtros para ver más opciones de inversión"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredLoans.map((loan) => (
                  <LoanCard key={loan.id} loan={loan} onInvest={handleInvest} />
                ))}
              </div>
            )}
          </div>
        </div>

        <TxModal
          open={showInvestModal}
          onOpenChange={setShowInvestModal}
          title="Invertir en préstamo"
          description={
            selectedLoan
              ? `Confirma tu inversión de ${Number(selectedLoan.principal) / 1000000} mUSD con ${selectedLoan.aprBps / 100}% APR`
              : ""
          }
          onConfirm={handleConfirmInvestment}
        />
      </div>
    </MainLayout>
  )
}

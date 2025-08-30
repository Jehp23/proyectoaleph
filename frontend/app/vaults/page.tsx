"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { VaultCard } from "@/components/ui/vault-card"
import { Toolbar } from "@/components/ui/toolbar"
import { EmptyState } from "@/components/ui/empty-state"
import { TxModal } from "@/components/ui/tx-modal"
import { useStore } from "@/lib/store"
import type { HealthLevel, VaultStatus } from "@/lib/store"
import { Search } from "lucide-react"

export default function VaultsPage() {
  const { vaults, addCollateral, borrowMore, repayDebt } = useStore()
  const [ltvRange, setLtvRange] = useState<[number, number]>([0, 100])
  const [selectedStatuses, setSelectedStatuses] = useState<VaultStatus[]>([])
  const [selectedHealthLevels, setSelectedHealthLevels] = useState<HealthLevel[]>([])
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<"addCollateral" | "borrowMore" | "repay" | null>(null)

  // Filter vaults
  const filteredVaults = vaults.filter((vault) => {
    const matchesLtv = vault.ltv >= ltvRange[0] && vault.ltv <= ltvRange[1]
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(vault.status)
    const matchesHealth = selectedHealthLevels.length === 0 || selectedHealthLevels.includes(vault.healthLevel)
    return matchesLtv && matchesStatus && matchesHealth
  })

  const handleStatusToggle = (status: VaultStatus) => {
    setSelectedStatuses((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const handleHealthLevelToggle = (level: HealthLevel) => {
    setSelectedHealthLevels((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]))
  }

  const handleClearFilters = () => {
    setLtvRange([0, 100])
    setSelectedStatuses([])
    setSelectedHealthLevels([])
  }

  const handleVaultAction = (vaultId: string, action: "addCollateral" | "borrowMore" | "repay") => {
    setSelectedVaultId(vaultId)
    setActionType(action)
    setShowActionModal(true)
  }

  const handleConfirmAction = async () => {
    if (!selectedVaultId || !actionType) return

    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    switch (actionType) {
      case "addCollateral":
        addCollateral(selectedVaultId, BigInt(10000000)) // Add 0.1 BTC
        break
      case "borrowMore":
        borrowMore(selectedVaultId, BigInt(5000000000)) // Borrow 5000 USDT
        break
      case "repay":
        repayDebt(selectedVaultId, BigInt(10000000000)) // Repay 10000 USDT
        break
    }

    setSelectedVaultId(null)
    setActionType(null)
  }

  const selectedVault = selectedVaultId ? vaults.find((v) => v.id === selectedVaultId) : null

  const getActionDescription = () => {
    if (!selectedVault || !actionType) return ""

    switch (actionType) {
      case "addCollateral":
        return "Agregar 0.1 BTC como colateral adicional"
      case "borrowMore":
        return "Tomar 5,000 USDT adicionales en préstamo"
      case "repay":
        return "Pagar 10,000 USDT de la deuda"
      default:
        return ""
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Explorar vaults</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Toolbar
              ltvRange={ltvRange}
              onLtvRangeChange={setLtvRange}
              selectedStatuses={selectedStatuses}
              onStatusToggle={handleStatusToggle}
              selectedHealthLevels={selectedHealthLevels}
              onHealthLevelToggle={handleHealthLevelToggle}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Vaults Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4">
              <p className="text-muted-foreground">
                {filteredVaults.length} vault{filteredVaults.length !== 1 ? "s" : ""} encontrado
                {filteredVaults.length !== 1 ? "s" : ""}
              </p>
            </div>

            {filteredVaults.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No se encontraron vaults"
                description="Intenta ajustar los filtros para ver más vaults del protocolo"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredVaults.map((vault) => (
                  <VaultCard
                    key={vault.id}
                    vault={vault}
                    onAddCollateral={(id) => handleVaultAction(id, "addCollateral")}
                    onBorrowMore={(id) => handleVaultAction(id, "borrowMore")}
                    onRepay={(id) => handleVaultAction(id, "repay")}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <TxModal
          open={showActionModal}
          onOpenChange={setShowActionModal}
          title="Gestionar vault"
          description={getActionDescription()}
          onConfirm={handleConfirmAction}
        />
      </div>
    </MainLayout>
  )
}

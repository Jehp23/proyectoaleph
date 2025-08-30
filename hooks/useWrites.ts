"use client"
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import type { Address } from "viem"
import { ABIS, loadAddresses } from "@/lib/contracts"
import { readAllowance } from "@/lib/erc20"
import { toWbtc, toUsd18 } from "@/lib/units"

export type TxState = { hash?: `0x${string}`; pending: boolean; mining: boolean; error?: string | null }

export function useTx() {
  const { writeContract, data: hash, isPending, error: writeErr } = useWriteContract()
  const { isLoading: isMining } = useWaitForTransactionReceipt({ hash })

  const state: TxState = { hash, pending: isPending, mining: isMining, error: writeErr?.message ?? null }

  return { writeContract, state }
}

/** Acciones del protocolo (WBTC=>collateral, mUSD=>debt) */
export function useProtocolWrites() {
  const addrs = loadAddresses()
  const { address, isConnected } = useAccount()
  const { writeContract, state } = useTx()

  if (!addrs) {
    return {
      state: { ...state, error: "Faltan direcciones en /settings" },
      approveWbtc: async (_amt: number) => {
        throw new Error("Direcciones no configuradas")
      },
      depositCollateral: async (_amt: number) => {
        throw new Error("Direcciones no configuradas")
      },
      borrow: async (_usd: number) => {
        throw new Error("Direcciones no configuradas")
      },
      repay: async (_usd: number) => {
        throw new Error("Direcciones no configuradas")
      },
      withdrawCollateral: async (_amt: number) => {
        throw new Error("Direcciones no configuradas")
      },
      liquidate: async (_owner: Address, _usd: number) => {
        throw new Error("Direcciones no configuradas")
      },
    }
  }

  const ensureConnected = () => {
    if (!isConnected || !address) throw new Error("Conecta tu wallet")
  }

  const approveWbtc = async (amountBtc: number) => {
    ensureConnected()
    const amt = toWbtc(amountBtc)
    await writeContract({
      address: addrs.WBTC,
      abi: ABIS.erc20,
      functionName: "approve",
      args: [addrs.VAULT_MANAGER, amt],
    })
  }

  const depositCollateral = async (amountBtc: number) => {
    ensureConnected()
    const amt = toWbtc(amountBtc)
    await writeContract({
      address: addrs.VAULT_MANAGER,
      abi: ABIS.vaultManager,
      functionName: "depositCollateral",
      args: [amt],
    })
  }

  const borrow = async (amountUsd: number) => {
    ensureConnected()
    const amt = toUsd18(amountUsd)
    await writeContract({
      address: addrs.VAULT_MANAGER,
      abi: ABIS.vaultManager,
      functionName: "borrow",
      args: [amt],
    })
  }

  /** Repago: aprobar mUSD si es necesario y luego repay */
  const repay = async (amountUsd: number) => {
    ensureConnected()
    const owner = address as Address
    const amt = toUsd18(amountUsd)
    const allowance = await readAllowance(addrs.MUSD, owner, addrs.VAULT_MANAGER)
    if (allowance < amt) {
      await writeContract({
        address: addrs.MUSD,
        abi: ABIS.erc20,
        functionName: "approve",
        args: [addrs.VAULT_MANAGER, amt],
      })
    }
    await writeContract({
      address: addrs.VAULT_MANAGER,
      abi: ABIS.vaultManager,
      functionName: "repay",
      args: [amt],
    })
  }

  const withdrawCollateral = async (amountBtc: number) => {
    ensureConnected()
    const amt = toWbtc(amountBtc)
    await writeContract({
      address: addrs.VAULT_MANAGER,
      abi: ABIS.vaultManager,
      functionName: "withdrawCollateral",
      args: [amt],
    })
  }

  /** Liquidación: paga deuda en mUSD y recibe WBTC + bonus; típicamente lo hace un tercero */
  const liquidate = async (vaultOwner: Address, repayUsd: number) => {
    ensureConnected()
    const owner = address as Address
    const amt = toUsd18(repayUsd)
    // aprobar mUSD para el manager si falta
    const allowance = await readAllowance(addrs.MUSD, owner, addrs.VAULT_MANAGER)
    if (allowance < amt) {
      await writeContract({
        address: addrs.MUSD,
        abi: ABIS.erc20,
        functionName: "approve",
        args: [addrs.VAULT_MANAGER, amt],
      })
    }
    await writeContract({
      address: addrs.VAULT_MANAGER,
      abi: ABIS.vaultManager,
      functionName: "liquidate",
      args: [vaultOwner, amt],
    })
  }

  return { state, approveWbtc, depositCollateral, borrow, repay, withdrawCollateral, liquidate }
}

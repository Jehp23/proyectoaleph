"use client"
import { useEffect, useMemo, useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { loadAddresses, ABIS } from "@/lib/contracts"
import { readOracleOwner, readPriceE8 } from "@/lib/onchain"
import { fromPriceE8 } from "@/lib/units"

const USE_SIMULATE_DROP = false // change to true if your MockOracle uses simulatePriceDrop(bps)

export function useOracleAdmin() {
  const { address, isConnected } = useAccount()
  const addrs = loadAddresses()
  const [oracleOwner, setOracleOwner] = useState<`0x${string}` | null>(null)
  const [currentPriceE8, setCurrentPriceE8] = useState<bigint | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()
  const { isLoading: isMining } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    ;(async () => {
      try {
        const owner = await readOracleOwner()
        setOracleOwner(owner)
      } catch (e: any) {
        setError(e?.message ?? "No se pudo leer owner del oráculo")
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const priceE8 = await readPriceE8()
        setCurrentPriceE8(priceE8)
      } catch (e: any) {
        setError(e?.message ?? "No se pudo leer precio del oráculo")
      }
    })()
  }, [hash]) // refresh when a tx is mined

  const isOwner = useMemo(() => {
    if (!address || !oracleOwner) return false
    return address.toLowerCase() === oracleOwner.toLowerCase()
  }, [address, oracleOwner])

  const priceUsd = currentPriceE8 ? fromPriceE8(currentPriceE8) : undefined

  const setPriceE8 = async (newPriceE8: bigint) => {
    if (!addrs) {
      setError("Faltan direcciones en /settings")
      return
    }
    try {
      if (USE_SIMULATE_DROP) {
        // simulatePriceDrop expects BPS (1000 = -10%, 2000 = -20%)
        const bps = (() => {
          if (!currentPriceE8) return 0n
          const old = Number(currentPriceE8)
          const nn = Number(newPriceE8)
          const frac = 1 - nn / old
          return BigInt(Math.round(frac * 10000))
        })()
        await writeContract({
          address: addrs.ORACLE,
          abi: ABIS.oracle,
          functionName: "simulatePriceDrop",
          args: [bps],
        })
      } else {
        await writeContract({
          address: addrs.ORACLE,
          abi: ABIS.oracle,
          functionName: "setPrice",
          args: [newPriceE8],
        })
      }
      setError(null)
    } catch (e: any) {
      setError(e?.shortMessage ?? e?.message ?? "Fallo al setear precio")
    }
  }

  const drop10 = async () => {
    if (!currentPriceE8) return
    const newE8 = BigInt(Math.floor(Number(currentPriceE8) * 0.9))
    await setPriceE8(newE8)
  }

  const drop20 = async () => {
    if (!currentPriceE8) return
    const newE8 = BigInt(Math.floor(Number(currentPriceE8) * 0.8))
    await setPriceE8(newE8)
  }

  const resetTo = async (usd: number) => {
    const newE8 = BigInt(Math.round(usd * 1e8))
    await setPriceE8(newE8)
  }

  return {
    isOwner,
    oracleOwner,
    priceUsd,
    hash,
    busy: isPending || isMining,
    error: writeError?.message ?? error ?? null,
    drop10,
    drop20,
    resetTo,
  }
}

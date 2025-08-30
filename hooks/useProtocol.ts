"use client"

import { useEffect, useState } from "react"
import { readProtocolData, readPriceUsd } from "@/lib/onchain"

export function useProtocol(pollMs = 6000) {
  const [data, setData] = useState<Awaited<ReturnType<typeof readProtocolData>>>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let timer: any
    const tick = async () => {
      try {
        const d = await readProtocolData()
        setData(d)
        setLoading(false)
        setError(null)
      } catch (e: any) {
        setError(e?.message ?? "readProtocol failed")
        setLoading(false)
      }
      timer = setTimeout(tick, pollMs)
    }
    tick()
    return () => clearTimeout(timer)
  }, [pollMs])

  // Optional: price refresh between polls
  const refreshPrice = async () => {
    if (data) {
      try {
        const newPrice = await readPriceUsd()
        if (newPrice) {
          setData((prev) => (prev ? { ...prev, priceUsd: newPrice } : prev))
        }
      } catch {}
    }
  }

  return { data, loading, error, refreshPrice }
}

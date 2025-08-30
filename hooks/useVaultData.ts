"use client"

import { useEffect, useState } from "react"
import { readVaultData } from "@/lib/onchain"

export function useVaultData(user: `0x${string}` | undefined, pollMs = 6000) {
  const [data, setData] = useState<Awaited<ReturnType<typeof readVaultData>>>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setData(null)
      setLoading(false)
      return
    }

    let timer: any
    const tick = async () => {
      try {
        const d = await readVaultData(user)
        setData(d)
        setLoading(false)
        setError(null)
      } catch (e: any) {
        setError(e?.message ?? "readVault failed")
        setLoading(false)
      }
      timer = setTimeout(tick, pollMs)
    }
    tick()
    return () => clearTimeout(timer)
  }, [user, pollMs])

  return { data, loading, error }
}

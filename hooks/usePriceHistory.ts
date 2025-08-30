"use client"

import { useEffect, useState } from "react"

export type PricePoint = {
  timestamp: number
  price: number
}

export type PriceHistoryPeriod = "1h" | "24h" | "7d" | "30d"

// Mock price history generator for demo - replace with real API
function generateMockHistory(period: PriceHistoryPeriod, currentPrice: number): PricePoint[] {
  const now = Date.now()
  const intervals = {
    "1h": { points: 60, intervalMs: 60 * 1000 }, // 1 minute intervals
    "24h": { points: 24, intervalMs: 60 * 60 * 1000 }, // 1 hour intervals
    "7d": { points: 7, intervalMs: 24 * 60 * 60 * 1000 }, // 1 day intervals
    "30d": { points: 30, intervalMs: 24 * 60 * 60 * 1000 }, // 1 day intervals
  }

  const config = intervals[period]
  const points: PricePoint[] = []

  for (let i = config.points - 1; i >= 0; i--) {
    const timestamp = now - i * config.intervalMs
    // Generate realistic price variation (±2% random walk)
    const variation = (Math.random() - 0.5) * 0.04 // ±2%
    const price = currentPrice * (1 + variation * (i / config.points))
    points.push({ timestamp, price })
  }

  return points
}

export function usePriceHistory(period: PriceHistoryPeriod = "24h", currentPrice?: number) {
  const [history, setHistory] = useState<PricePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)

        // TODO: Replace with real price history API
        // Examples: CoinGecko, CoinMarketCap, or your own price indexer
        if (currentPrice) {
          const mockHistory = generateMockHistory(period, currentPrice)
          setHistory(mockHistory)
        }

        setError(null)
      } catch (e: any) {
        setError(e?.message ?? "Failed to fetch price history")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [period, currentPrice])

  const priceChange = history.length >= 2 ? history[history.length - 1].price - history[0].price : 0

  const priceChangePercent = history.length >= 2 && history[0].price > 0 ? (priceChange / history[0].price) * 100 : 0

  return {
    history,
    loading,
    error,
    priceChange,
    priceChangePercent,
  }
}

"use client"

import { useState, useEffect } from "react"
import { useChainlinkPrice } from "./useChainlinkPrice"
import { usePriceWebSocket } from "./usePriceWebSocket"
import { readPriceUsd } from "@/lib/onchain"

export type PriceSource = "oracle" | "chainlink" | "websocket"

export function useRealTimePrice(source: PriceSource = "oracle", pollMs = 6000) {
  const [oraclePrice, setOraclePrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Chainlink integration
  const chainlink = useChainlinkPrice(30000) // Poll every 30s

  // WebSocket integration
  const websocket = usePriceWebSocket("binance")

  // Oracle polling for demo/testing
  useEffect(() => {
    if (source !== "oracle") return

    let timer: any
    const fetchOraclePrice = async () => {
      try {
        const price = await readPriceUsd()
        setOraclePrice(price)
        setError(null)
        setLoading(false)
      } catch (e: any) {
        setError(e?.message ?? "Failed to fetch oracle price")
        setLoading(false)
      }
      timer = setTimeout(fetchOraclePrice, pollMs)
    }

    fetchOraclePrice()
    return () => clearTimeout(timer)
  }, [source, pollMs])

  // Return appropriate price based on source
  const getPrice = () => {
    switch (source) {
      case "chainlink":
        return chainlink.price
      case "websocket":
        return websocket.price
      case "oracle":
      default:
        return oraclePrice
    }
  }

  const getError = () => {
    switch (source) {
      case "chainlink":
        return chainlink.error
      case "websocket":
        return websocket.error
      case "oracle":
      default:
        return error
    }
  }

  const getLoading = () => {
    switch (source) {
      case "chainlink":
        return chainlink.loading
      case "websocket":
        return !websocket.connected && websocket.price === null
      case "oracle":
      default:
        return loading
    }
  }

  return {
    price: getPrice(),
    loading: getLoading(),
    error: getError(),
    source,
    // Individual source data for debugging
    sources: {
      oracle: { price: oraclePrice, loading, error },
      chainlink,
      websocket,
    },
  }
}

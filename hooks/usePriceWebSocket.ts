"use client"

import { useEffect, useState, useRef } from "react"

export type PriceUpdate = {
  symbol: string
  price: number
  timestamp: number
  change24h?: number
}

// WebSocket price feed URLs - replace with your preferred provider
const WS_ENDPOINTS = {
  binance: "wss://stream.binance.com:9443/ws/btcusdt@ticker",
  coinbase: "wss://ws-feed.pro.coinbase.com",
  // Add more providers as needed
}

export function usePriceWebSocket(provider: keyof typeof WS_ENDPOINTS = "binance") {
  const [price, setPrice] = useState<number | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<any>(null)

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(WS_ENDPOINTS[provider])
        wsRef.current = ws

        ws.onopen = () => {
          setConnected(true)
          setError(null)

          // Subscribe to BTC/USDT ticker for Binance
          if (provider === "binance") {
            // Already subscribed via URL
          } else if (provider === "coinbase") {
            ws.send(
              JSON.stringify({
                type: "subscribe",
                product_ids: ["BTC-USD"],
                channels: ["ticker"],
              }),
            )
          }
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)

            if (provider === "binance" && data.c) {
              // Binance 24hr ticker format
              setPrice(Number.parseFloat(data.c))
              setLastUpdate(new Date())
            } else if (provider === "coinbase" && data.type === "ticker") {
              // Coinbase ticker format
              setPrice(Number.parseFloat(data.price))
              setLastUpdate(new Date())
            }
          } catch (e) {
            console.error("Failed to parse WebSocket message:", e)
          }
        }

        ws.onerror = (error) => {
          setError("WebSocket connection error")
          setConnected(false)
        }

        ws.onclose = () => {
          setConnected(false)
          // Auto-reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(connect, 5000)
        }
      } catch (e: any) {
        setError(e?.message ?? "Failed to connect to price feed")
      }
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [provider])

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
  }

  return {
    price,
    connected,
    error,
    lastUpdate,
    disconnect,
  }
}

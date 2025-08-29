"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useStore } from "@/lib/store"

export function BtcPriceTicker() {
  const { btcPrice, updateBtcPrice } = useStore()
  const [priceChange, setPriceChange] = useState(0)
  const [isPositive, setIsPositive] = useState(true)

  useEffect(() => {
    // Simulate price updates every 30 seconds
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 1000 // Random change up to ±$500
      const newPrice = Math.max(30000, btcPrice + change) // Minimum $30k
      const changePercent = ((newPrice - btcPrice) / btcPrice) * 100

      setPriceChange(changePercent)
      setIsPositive(changePercent >= 0)
      updateBtcPrice(newPrice)
    }, 30000)

    return () => clearInterval(interval)
  }, [btcPrice, updateBtcPrice])

  return (
    <Card className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">₿</span>
            </div>
            <div>
              <div className="font-mono text-lg font-bold">
                ${btcPrice.toLocaleString("es-ES", { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-muted-foreground">BTC/USD</div>
            </div>
          </div>

          {priceChange !== 0 && (
            <Badge
              variant="outline"
              className={`gap-1 ${
                isPositive
                  ? "text-green-500 border-green-500/20 bg-green-500/10"
                  : "text-red-500 border-red-500/20 bg-red-500/10"
              }`}
            >
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? "+" : ""}
              {priceChange.toFixed(2)}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

import { cn } from "@/lib/utils"

interface MoneyProps {
  amount: bigint | number
  currency: "BTC" | "USDT" | "USD"
  className?: string
  showCurrency?: boolean
  precision?: number
}

export function Money({ amount, currency, className, showCurrency = true, precision }: MoneyProps) {
  const value = typeof amount === "bigint" ? Number(amount) : amount

  let formatted: string
  let symbol: string

  switch (currency) {
    case "BTC":
      // Convert satoshis to BTC
      const btcValue = value / 100000000
      formatted = btcValue.toLocaleString("es-ES", {
        minimumFractionDigits: precision ?? (btcValue < 0.01 ? 6 : 4),
        maximumFractionDigits: precision ?? (btcValue < 0.01 ? 6 : 4),
      })
      symbol = "BTC"
      break
    case "USDT":
      // Convert wei to USDT
      const usdtValue = value / 1000000
      formatted = usdtValue.toLocaleString("es-ES", {
        minimumFractionDigits: precision ?? 0,
        maximumFractionDigits: precision ?? 2,
      })
      symbol = "USDT"
      break
    case "USD":
      formatted = value.toLocaleString("es-ES", {
        minimumFractionDigits: precision ?? 0,
        maximumFractionDigits: precision ?? 2,
      })
      symbol = "USD"
      break
    default:
      formatted = value.toString()
      symbol = ""
  }

  return (
    <span className={cn("font-mono", className)}>
      {formatted}
      {showCurrency && symbol && ` ${symbol}`}
    </span>
  )
}

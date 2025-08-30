import { cn } from "@/lib/utils"
import { formatCurrency, PRECISION_CONSTANTS } from "@/lib/precision-math"

interface MoneyProps {
  amount: bigint | number
  currency: "BTC" | "USDT" | "USD"
  className?: string
  showCurrency?: boolean
  precision?: number
}

export function Money({ amount, currency, className, showCurrency = true, precision }: MoneyProps) {
  // Convert number to BigInt if needed (for backward compatibility)
  let bigIntAmount: bigint

  if (typeof amount === "number") {
    // Convert number to BigInt based on currency
    let decimals: number
    switch (currency) {
      case "BTC":
        decimals = PRECISION_CONSTANTS.BTC_DECIMALS
        break
      case "USDT":
        decimals = PRECISION_CONSTANTS.USDT_DECIMALS
        break
      case "USD":
        decimals = PRECISION_CONSTANTS.PRICE_DECIMALS
        break
    }

    // Convert with exact precision
    bigIntAmount = BigInt(Math.round(amount * Number(BigInt(10) ** BigInt(decimals))))
  } else {
    bigIntAmount = amount
  }

  // Format with exact precision
  const formatted = formatCurrency(bigIntAmount, currency, precision)

  if (!showCurrency) {
    // Remove currency symbol for display
    return <span className={cn("font-mono", className)}>{formatted.replace(/ (BTC|USDT|USD)$/, "")}</span>
  }

  return <span className={cn("font-mono", className)}>{formatted}</span>
}

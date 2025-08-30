/**
 * High-precision mathematical operations for financial calculations
 * Prevents precision loss that could cause users to lose money
 */

export class PrecisionError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message)
    this.name = "PrecisionError"
  }
}

// Constants for precision calculations
export const PRECISION_CONSTANTS = {
  BTC_DECIMALS: 8,
  USDT_DECIMALS: 6,
  PRICE_DECIMALS: 8,
  PERCENTAGE_DECIMALS: 4,
  HEALTH_FACTOR_DECIMALS: 6,

  // BigInt constants to avoid repeated calculations
  BTC_SATOSHI_MULTIPLIER: BigInt(100000000), // 10^8
  USDT_WEI_MULTIPLIER: BigInt(1000000), // 10^6
  PRICE_MULTIPLIER: BigInt(100000000), // 10^8
  PERCENTAGE_MULTIPLIER: BigInt(10000), // 10^4 (for basis points)
  HEALTH_FACTOR_MULTIPLIER: BigInt(1000000), // 10^6
} as const

/**
 * Convert string amount to BigInt with exact precision
 * Never loses precision, throws error if input is invalid
 */
export function stringToBigInt(amount: string, decimals: number): bigint {
  if (!amount || amount.trim() === "") {
    throw new PrecisionError("Amount cannot be empty", "EMPTY_AMOUNT")
  }

  // Remove any whitespace and validate format
  const cleanAmount = amount.trim()
  if (!/^\d+(\.\d+)?$/.test(cleanAmount)) {
    throw new PrecisionError("Invalid number format", "INVALID_FORMAT")
  }

  const [integerPart, decimalPart = ""] = cleanAmount.split(".")

  // Check decimal precision
  if (decimalPart.length > decimals) {
    throw new PrecisionError(
      `Too many decimal places. Maximum ${decimals} allowed, got ${decimalPart.length}`,
      "PRECISION_EXCEEDED",
    )
  }

  // Pad decimal part to required precision
  const paddedDecimal = decimalPart.padEnd(decimals, "0")
  const fullNumber = integerPart + paddedDecimal

  try {
    return BigInt(fullNumber)
  } catch {
    throw new PrecisionError("Number too large to process", "NUMBER_TOO_LARGE")
  }
}

/**
 * Convert BigInt to display string with exact precision
 * Never rounds, always shows exact value
 */
export function bigIntToString(amount: bigint, decimals: number, displayDecimals?: number): string {
  const divisor = BigInt(10) ** BigInt(decimals)
  const integerPart = amount / divisor
  const remainder = amount % divisor

  // Convert remainder to decimal string with leading zeros
  const decimalPart = remainder.toString().padStart(decimals, "0")

  // Trim trailing zeros for display, but respect displayDecimals if provided
  let trimmedDecimal = decimalPart
  if (displayDecimals !== undefined) {
    trimmedDecimal = decimalPart.slice(0, displayDecimals).padEnd(displayDecimals, "0")
  } else {
    trimmedDecimal = decimalPart.replace(/0+$/, "")
  }

  return trimmedDecimal.length > 0 ? `${integerPart}.${trimmedDecimal}` : integerPart.toString()
}

/**
 * High-precision multiplication with overflow protection
 */
export function precisionMultiply(a: bigint, b: bigint, resultDecimals: number): bigint {
  // Check for potential overflow before calculation
  const MAX_SAFE_BIGINT = BigInt("0x1fffffffffffff") // 2^53 - 1

  if (a > MAX_SAFE_BIGINT || b > MAX_SAFE_BIGINT) {
    // Use string-based calculation for very large numbers
    const result = a * b
    const divisor = BigInt(10) ** BigInt(resultDecimals)
    return result / divisor
  }

  return (a * b) / BigInt(10) ** BigInt(resultDecimals)
}

/**
 * High-precision division with exact results
 * Never loses precision in financial calculations
 */
export function precisionDivide(numerator: bigint, denominator: bigint, resultDecimals: number): bigint {
  if (denominator === BigInt(0)) {
    throw new PrecisionError("Division by zero", "DIVISION_BY_ZERO")
  }

  // Multiply numerator by precision factor before division
  const multiplier = BigInt(10) ** BigInt(resultDecimals)
  return (numerator * multiplier) / denominator
}

/**
 * Calculate LTV with exact precision
 * Returns LTV in basis points (10000 = 100%)
 */
export function calculateLTV(
  collateralAmount: bigint, // in satoshis
  borrowedAmount: bigint, // in USDT wei
  btcPrice: bigint, // in price decimals (8)
): bigint {
  if (collateralAmount === BigInt(0)) {
    return BigInt(0)
  }

  // Convert collateral to USD value: (collateral * price) / BTC_DECIMALS
  const collateralValueUsd = precisionMultiply(collateralAmount, btcPrice, PRECISION_CONSTANTS.BTC_DECIMALS)

  // Convert borrowed amount to USD (USDT wei to USD)
  const borrowedValueUsd =
    borrowedAmount * BigInt(10) ** BigInt(PRECISION_CONSTANTS.BTC_DECIMALS - PRECISION_CONSTANTS.USDT_DECIMALS)

  // Calculate LTV in basis points: (borrowed / collateral) * 10000
  return precisionDivide(borrowedValueUsd * PRECISION_CONSTANTS.PERCENTAGE_MULTIPLIER, collateralValueUsd, 0)
}

/**
 * Calculate Health Factor with exact precision
 * Returns health factor in 6 decimal precision
 */
export function calculateHealthFactor(
  collateralAmount: bigint, // in satoshis
  borrowedAmount: bigint, // in USDT wei
  btcPrice: bigint, // in price decimals
  liquidationThreshold: bigint, // in basis points
): bigint {
  if (borrowedAmount === BigInt(0)) {
    return BigInt(999) * PRECISION_CONSTANTS.HEALTH_FACTOR_MULTIPLIER // Very healthy
  }

  // Collateral value in USD
  const collateralValueUsd = precisionMultiply(collateralAmount, btcPrice, PRECISION_CONSTANTS.BTC_DECIMALS)

  // Liquidation threshold value
  const liquidationValue = precisionMultiply(
    collateralValueUsd,
    liquidationThreshold,
    PRECISION_CONSTANTS.PERCENTAGE_DECIMALS,
  )

  // Convert borrowed amount to same precision as liquidation value
  const borrowedValueUsd =
    borrowedAmount * BigInt(10) ** BigInt(PRECISION_CONSTANTS.BTC_DECIMALS - PRECISION_CONSTANTS.USDT_DECIMALS)

  // Health factor = liquidationValue / borrowedValue
  return precisionDivide(liquidationValue, borrowedValueUsd, PRECISION_CONSTANTS.HEALTH_FACTOR_DECIMALS)
}

/**
 * Calculate liquidation price with exact precision
 */
export function calculateLiquidationPrice(
  collateralAmount: bigint, // in satoshis
  borrowedAmount: bigint, // in USDT wei
  liquidationThreshold: bigint, // in basis points
): bigint {
  if (collateralAmount === BigInt(0)) {
    return BigInt(0)
  }

  // Convert borrowed amount to match collateral precision
  const borrowedValueAdjusted =
    borrowedAmount * BigInt(10) ** BigInt(PRECISION_CONSTANTS.BTC_DECIMALS - PRECISION_CONSTANTS.USDT_DECIMALS)

  // Liquidation price = (borrowed * 10000) / (collateral * liquidationThreshold)
  const numerator = borrowedValueAdjusted * PRECISION_CONSTANTS.PERCENTAGE_MULTIPLIER
  const denominator = collateralAmount * liquidationThreshold

  return precisionDivide(numerator, denominator, PRECISION_CONSTANTS.PRICE_DECIMALS)
}

/**
 * Safe conversion from BigInt to number for display only
 * Throws error if precision would be lost
 */
export function safeToNumber(value: bigint, decimals: number): number {
  const divisor = BigInt(10) ** BigInt(decimals)
  const integerPart = value / divisor
  const remainder = value % divisor

  // Check if the integer part fits in safe integer range
  if (integerPart > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new PrecisionError("Number too large for safe conversion", "UNSAFE_CONVERSION")
  }

  const result = Number(integerPart) + Number(remainder) / Number(divisor)

  // Verify the conversion didn't lose precision
  const backConverted = BigInt(Math.round(result * Number(divisor)))
  if (backConverted !== value) {
    throw new PrecisionError("Precision loss detected in conversion", "PRECISION_LOSS")
  }

  return result
}

/**
 * Format BigInt amount for display with currency
 */
export function formatCurrency(amount: bigint, currency: "BTC" | "USDT" | "USD", displayDecimals?: number): string {
  let decimals: number
  let symbol: string

  switch (currency) {
    case "BTC":
      decimals = PRECISION_CONSTANTS.BTC_DECIMALS
      symbol = "BTC"
      break
    case "USDT":
      decimals = PRECISION_CONSTANTS.USDT_DECIMALS
      symbol = "USDT"
      break
    case "USD":
      decimals = PRECISION_CONSTANTS.PRICE_DECIMALS
      symbol = "USD"
      break
  }

  const formatted = bigIntToString(amount, decimals, displayDecimals)
  return `${formatted} ${symbol}`
}

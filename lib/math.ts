/**
 * Math helpers for CauciónBTC vault calculations
 * All calculations assume standard decimal precision and handle edge cases
 */

// Liquidation Threshold: 70% (when HF drops below 1.0, vault can be liquidated)
export const LIQUIDATION_THRESHOLD = 0.7

/**
 * Calculate Loan-to-Value ratio
 * @param debtUsd - Total debt in USD
 * @param collateralBtc - Collateral amount in BTC
 * @param priceUsd - BTC price in USD
 * @returns LTV as decimal (0.5 = 50%) or 0 if no collateral
 */
export function calcLtv(debtUsd: number, collateralBtc: number, priceUsd: number): number {
  if (collateralBtc === 0 || priceUsd === 0) return 0
  const collateralValue = collateralBtc * priceUsd
  return collateralValue === 0 ? 0 : debtUsd / collateralValue
}

/**
 * Calculate Health Factor
 * @param debtUsd - Total debt in USD
 * @param collateralBtc - Collateral amount in BTC
 * @param priceUsd - BTC price in USD
 * @returns Health Factor (>1.0 = safe, <1.0 = liquidatable) or Infinity if no debt
 */
export function calcHf(debtUsd: number, collateralBtc: number, priceUsd: number): number {
  if (debtUsd === 0) return Number.POSITIVE_INFINITY
  if (collateralBtc === 0 || priceUsd === 0) return 0

  const adjustedCollateralValue = collateralBtc * priceUsd * LIQUIDATION_THRESHOLD
  return adjustedCollateralValue / debtUsd
}

/**
 * Calculate liquidation price for BTC
 * @param debtUsd - Total debt in USD
 * @param collateralBtc - Collateral amount in BTC
 * @returns BTC price at which vault becomes liquidatable, or Infinity if no debt
 */
export function calcLiqPrice(debtUsd: number, collateralBtc: number): number {
  if (debtUsd === 0) return Number.POSITIVE_INFINITY
  if (collateralBtc === 0) return Number.POSITIVE_INFINITY

  return debtUsd / (collateralBtc * LIQUIDATION_THRESHOLD)
}

/**
 * Convert BigInt with decimals to number
 * @param value - BigInt value from contract
 * @param decimals - Token decimals (18 for WBTC/USDT)
 * @returns Converted number with proper decimal places
 */
export function bigIntToNumber(value: bigint, decimals = 18): number {
  return Number(value) / Math.pow(10, decimals)
}

/**
 * Convert number to BigInt with decimals
 * @param value - Number value
 * @param decimals - Token decimals (18 for WBTC/USDT)
 * @returns BigInt value for contract calls
 */
export function numberToBigInt(value: number, decimals = 18): bigint {
  return BigInt(Math.floor(value * Math.pow(10, decimals)))
}

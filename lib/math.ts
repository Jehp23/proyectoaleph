// lib/math.ts
const LT = 0.7 // Liquidation Threshold (70%)

export const calcLtv = (debtUsd: number, collBtc: number, priceUsd: number) => {
  const collUsd = collBtc * priceUsd
  return collUsd > 0 ? debtUsd / collUsd : 0
}

export const calcHf = (debtUsd: number, collBtc: number, priceUsd: number) => {
  if (debtUsd <= 0) return Number.POSITIVE_INFINITY
  return (collBtc * priceUsd * LT) / debtUsd
}

export const calcLiqPrice = (debtUsd: number, collBtc: number) =>
  collBtc > 0 ? debtUsd / (collBtc * LT) : Number.POSITIVE_INFINITY

export const LIQ_THRESHOLD = LT

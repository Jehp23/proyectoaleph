// lib/math.ts
// Fallbacks (se pueden sobrescribir con datos del protocolo)
export const LTV_MAX_DEFAULT = 0.6 // 60%
export const LIQ_THRESHOLD_DEFAULT = 0.7 // 70%
export const HF_WITHDRAW_MIN = 1.2 // bloqueo de retiro en UI

// Helpers para BPS → fracción
export const bpsToFrac = (bps?: number) => (typeof bps === "number" ? bps / 10_000 : undefined)

// Resolvedores con fallback
export const resolveLtvMax = (ltvMaxBps?: number) => bpsToFrac(ltvMaxBps) ?? LTV_MAX_DEFAULT

export const resolveLt = (liqThresholdBps?: number) => bpsToFrac(liqThresholdBps) ?? LIQ_THRESHOLD_DEFAULT

/**
 * debtUsd: number en USD (human)
 * collBtc: number en BTC (human)
 * priceUsd: number en USD/BTC (human)
 * lt: Liquidation Threshold (0..1)
 */
export const calcLtv = (debtUsd: number, collBtc: number, priceUsd: number) => {
  const collUsd = collBtc * priceUsd
  return collUsd > 0 ? debtUsd / collUsd : 0
}

export const calcHf = (debtUsd: number, collBtc: number, priceUsd: number, lt: number) => {
  if (debtUsd <= 0) return Number.POSITIVE_INFINITY
  return (collBtc * priceUsd * lt) / debtUsd
}

export const calcLiqPrice = (debtUsd: number, collBtc: number, lt: number) =>
  collBtc > 0 ? debtUsd / (collBtc * lt) : Number.POSITIVE_INFINITY

/** Proyección: HF después de retirar `withdrawBtc` */
export const projectHfAfterWithdraw = (
  debtUsd: number,
  collBtc: number,
  withdrawBtc: number,
  priceUsd: number,
  lt: number,
) => calcHf(debtUsd, Math.max(collBtc - withdrawBtc, 0), priceUsd, lt)

/** Proyección: HF después de pedir deuda adicional */
export const projectHfAfterBorrow = (
  debtUsd: number,
  extraDebtUsd: number,
  collBtc: number,
  priceUsd: number,
  lt: number,
) => calcHf(Math.max(debtUsd + extraDebtUsd, 0), collBtc, priceUsd, lt)

/** Interés simple (APR BPS) para display (no-compuesto, días) */
export const simpleInterest = (principalUsd: number, aprBps = 1200, days = 90) => {
  const apr = (aprBps ?? 1200) / 10_000
  return principalUsd * apr * (days / 365)
}

/** Formateos auxiliares */
export const pct = (x: number, digits = 0) => (x * 100).toFixed(digits) + "%"
export const hfBadge = (hf: number) => (hf >= 1.5 ? "safe" : hf >= 1.1 ? "warn" : "risk")

// Legacy export for backward compatibility
export const LIQ_THRESHOLD = LIQ_THRESHOLD_DEFAULT

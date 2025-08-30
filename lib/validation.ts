// lib/validation.ts
import { resolveLt, resolveLtvMax, HF_WITHDRAW_MIN, calcLtv, calcHf } from "@/lib/math"

export type UiGuardsInput = {
  // datos humanos (numbers)
  priceUsd?: number
  collateralBtc?: number
  debtUsd?: number

  // params protocolo (BPS) opcionales
  ltvMaxBps?: number
  liqThresholdBps?: number

  // entradas de usuario (opcionales)
  withdrawBtc?: number
  extraDebtUsd?: number

  // estados UI
  loading?: boolean
  connected?: boolean
}

export type GuardResult = { ok: boolean; reason?: string }

const isFinitePos = (x: any) => typeof x === "number" && isFinite(x) && x >= 0

export function canBorrow(in_: UiGuardsInput): GuardResult {
  const { priceUsd, collateralBtc, debtUsd, extraDebtUsd, ltvMaxBps, liqThresholdBps, loading, connected } = in_
  if (!connected) return { ok: false, reason: "Conecta tu wallet" }
  if (loading) return { ok: false, reason: "Cargando datos on-chain…" }
  if (!isFinitePos(priceUsd)) return { ok: false, reason: "Precio no disponible" }
  if (!isFinitePos(collateralBtc)) return { ok: false, reason: "Colateral inválido" }
  if (!isFinitePos(debtUsd)) return { ok: false, reason: "Deuda inválida" }
  if (!isFinitePos(extraDebtUsd) || (extraDebtUsd ?? 0) <= 0) return { ok: false, reason: "Ingresa un monto a pedir" }

  const lt = resolveLt(liqThresholdBps)
  const ltvMax = resolveLtvMax(ltvMaxBps)

  const newDebt = (debtUsd ?? 0) + (extraDebtUsd ?? 0)
  const ltv = calcLtv(newDebt, collateralBtc!, priceUsd!)
  if (ltv > ltvMax) return { ok: false, reason: `LTV excede ${Math.round(ltvMax * 100)}%` }

  const hf = calcHf(newDebt, collateralBtc!, priceUsd!, lt)
  if (hf <= 1.0) return { ok: false, reason: "HF ≤ 1: liquidable" }

  return { ok: true }
}

export function canWithdraw(in_: UiGuardsInput): GuardResult {
  const { priceUsd, collateralBtc, debtUsd, withdrawBtc, liqThresholdBps, loading, connected } = in_
  if (!connected) return { ok: false, reason: "Conecta tu wallet" }
  if (loading) return { ok: false, reason: "Cargando datos on-chain…" }
  if (!isFinitePos(withdrawBtc) || (withdrawBtc ?? 0) <= 0) return { ok: false, reason: "Ingresa monto a retirar" }
  if (!isFinitePos(priceUsd) || !isFinitePos(collateralBtc) || !isFinitePos(debtUsd))
    return { ok: false, reason: "Datos inválidos" }

  const lt = resolveLt(liqThresholdBps)
  const nextColl = Math.max((collateralBtc ?? 0) - (withdrawBtc ?? 0), 0)
  const hfAfter = calcHf(debtUsd ?? 0, nextColl, priceUsd ?? 0, lt)

  if (hfAfter < HF_WITHDRAW_MIN) return { ok: false, reason: `HF tras retiro < ${HF_WITHDRAW_MIN}` }
  if (hfAfter <= 1.0) return { ok: false, reason: "HF tras retiro ≤ 1: liquidable" }
  return { ok: true }
}

export function canClose(debtUsd?: number, loading?: boolean, connected?: boolean): GuardResult {
  if (!connected) return { ok: false, reason: "Conecta tu wallet" }
  if (loading) return { ok: false, reason: "Cargando datos on-chain…" }
  if (!isFinitePos(debtUsd)) return { ok: false, reason: "Deuda inválida" }
  if ((debtUsd ?? 0) > 0) return { ok: false, reason: "Debes repagar la deuda" }
  return { ok: true }
}

export function canLiquidate(hf?: number, loading?: boolean): GuardResult {
  if (loading) return { ok: false, reason: "Cargando…" }
  if (typeof hf !== "number" || !isFinite(hf)) return { ok: false, reason: "HF desconocido" }
  if (hf >= 1.0) return { ok: false, reason: "HF ≥ 1: no liquidable" }
  return { ok: true }
}

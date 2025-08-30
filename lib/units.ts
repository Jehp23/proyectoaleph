// lib/units.ts
// ===== Constantes de escala =====
export const DEC_WBTC = 8n // WBTC 8 dec
export const DEC_MUSD = 18n // mUSD 18 dec
export const DEC_PRICE = 8n // price E8 (BTC-USD)

// pow10 BigInt
const pow10 = (n: bigint) => {
  let r = 1n
  for (let i = 0n; i < n; i++) r *= 10n
  return r
}

// ===== Converters BigInt <-> number =====
// Nota: para inputs de usuario grandes, preferir string y validación, pero para el MVP usamos number.

export const toWbtc = (x: number): bigint => BigInt(Math.round(x * 1e8)) // 8 dec

export const fromWbtc = (b: bigint): number => Number(b) / 1e8

export const toUsd18 = (x: number): bigint => {
  // evita overflow de floats grandes en 1e18 con BigInt
  // para MVP, number->BigInt con redondeo
  // si necesitas exactitud extrema, pasar como string y parsear.
  return BigInt(Math.round(x * 1e6)) * BigInt(1e12) // 1e6 * 1e12 = 1e18
}

export const fromUsd18 = (b: bigint): number => Number(b) / 1e18

export const fromPriceE8 = (b: bigint): number => Number(b) / 1e8

// ===== Formatters (solo UI) =====
export const fmtBTC = (b: bigint, digits = 6) => fromWbtc(b).toFixed(digits)

export const fmtUSD = (b: bigint | number, digits = 2) =>
  (typeof b === "bigint" ? fromUsd18(b) : b).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

export const fmtPct = (x: number, digits = 0) => (x * 100).toFixed(digits) + "%"

"use client"

import { isAddress } from "viem"

export type Addresses = {
  VAULT_MANAGER: `0x${string}`
  WBTC: `0x${string}`
  MUSD: `0x${string}`
  ORACLE: `0x${string}`
}

const LS_KEY = "protocol.addresses"

function envAddress(name: string): `0x${string}` | null {
  if (typeof process === "undefined") return null
  const v = process.env[`NEXT_PUBLIC_${name}`] as string | undefined
  return v && isAddress(v as `0x${string}`) ? (v as `0x${string}`) : null
}

export function loadFromEnv(): Partial<Addresses> {
  const VAULT_MANAGER = envAddress("VAULT_MANAGER")
  const WBTC = envAddress("WBTC")
  const MUSD = envAddress("MUSD")
  const ORACLE = envAddress("ORACLE")
  const out: Partial<Addresses> = {}
  if (VAULT_MANAGER) out.VAULT_MANAGER = VAULT_MANAGER
  if (WBTC) out.WBTC = WBTC
  if (MUSD) out.MUSD = MUSD
  if (ORACLE) out.ORACLE = ORACLE
  return out
}

export function loadAddresses(): Addresses | null {
  // 1) localStorage
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(LS_KEY)
    if (raw) {
      try {
        const o = JSON.parse(raw) as Partial<Addresses>
        if (o && isValidAddresses(o)) {
          return o as Addresses
        }
      } catch {}
    }
  }
  // 2) env
  const env = loadFromEnv()
  if (isValidAddresses(env)) return env as Addresses
  return null
}

export function saveAddresses(a: Partial<Addresses>): { ok: boolean; error?: string } {
  if (!isValidAddresses(a)) {
    return { ok: false, error: "Direcciones inválidas. Revisa que todas sean 0x… válidas." }
  }
  if (typeof window === "undefined") return { ok: false, error: "window no disponible" }
  window.localStorage.setItem(LS_KEY, JSON.stringify(a))
  return { ok: true }
}

export function clearAddresses() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(LS_KEY)
}

export function isValidAddresses(a: Partial<Addresses>): a is Addresses {
  return Boolean(
    a &&
      a.VAULT_MANAGER &&
      isAddress(a.VAULT_MANAGER) &&
      a.WBTC &&
      isAddress(a.WBTC) &&
      a.MUSD &&
      isAddress(a.MUSD) &&
      a.ORACLE &&
      isAddress(a.ORACLE),
  )
}

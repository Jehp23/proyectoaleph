import { publicClient } from "./chain"
import { ABIS, loadAddresses } from "./contracts"
import { fromWbtc, fromUsd18, fromPriceE8 } from "./units"

export type ProtocolData = {
  ltvMaxBps?: number
  liqThresholdBps?: number
  liqBonusBps?: number
  aprBps?: number
  priceUsd?: number
}

export type VaultData = {
  owner: `0x${string}`
  collateralBtc: number
  debtUsd: number
  aprBps?: number
}

export async function readPriceUsd(): Promise<number | null> {
  const addrs = loadAddresses()
  if (!addrs) return null
  try {
    const res = (await publicClient.readContract({
      address: addrs.ORACLE,
      abi: ABIS.oracle,
      functionName: "getPrice",
      args: [addrs.WBTC],
    })) as bigint
    return fromPriceE8(res)
  } catch {
    return null
  }
}

export async function readProtocolData(): Promise<ProtocolData | null> {
  const addrs = loadAddresses()
  if (!addrs) return null

  // Try getProtocolData() first
  try {
    const data = (await publicClient.readContract({
      address: addrs.VAULT_MANAGER,
      abi: ABIS.vaultManager,
      functionName: "getProtocolData",
      args: [],
    })) as any

    const priceUsd = (data.wbtcPrice ? fromPriceE8(BigInt(data.wbtcPrice)) : await readPriceUsd()) ?? null

    return {
      ltvMaxBps: Number(data.ltvMaxBps ?? 6000),
      liqThresholdBps: Number(data.liqThresholdBps ?? 7000),
      liqBonusBps: Number(data.liqBonusBps ?? 1000),
      aprBps: Number(data.aprBps ?? 1200),
      priceUsd: priceUsd ?? undefined,
    }
  } catch {
    // Fallback to defaults + price
    const priceUsd = (await readPriceUsd()) ?? undefined
    return {
      ltvMaxBps: 6000,
      liqThresholdBps: 7000,
      liqBonusBps: 1000,
      aprBps: 1200,
      priceUsd,
    }
  }
}

export async function readVaultData(user: `0x${string}`): Promise<VaultData | null> {
  const addrs = loadAddresses()
  if (!addrs) return null

  // Try getVaultData(address) first
  try {
    const data = (await publicClient.readContract({
      address: addrs.VAULT_MANAGER,
      abi: ABIS.vaultManager,
      functionName: "getVaultData",
      args: [user],
    })) as any

    return {
      owner: data.owner || user,
      collateralBtc: fromWbtc(BigInt(data.collateralAmount ?? 0)),
      debtUsd: fromUsd18(BigInt(data.debtAmount ?? 0)),
      aprBps: Number(data.aprBps ?? 1200),
    }
  } catch {
    // Fallback to individual calls or return empty vault
    return {
      owner: user,
      collateralBtc: 0,
      debtUsd: 0,
      aprBps: 1200,
    }
  }
}

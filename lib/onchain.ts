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

async function readProtocolByVars(addr: `0x${string}`): Promise<Partial<ProtocolData>> {
  const calls = await publicClient.multicall({
    allowFailure: true,
    contracts: [
      { address: addr, abi: ABIS.vaultManager, functionName: "LTV_MAX_BPS" },
      { address: addr, abi: ABIS.vaultManager, functionName: "LIQ_THRESHOLD_BPS" },
      { address: addr, abi: ABIS.vaultManager, functionName: "LIQ_BONUS_BPS" },
      { address: addr, abi: ABIS.vaultManager, functionName: "APR_BPS" },
    ],
  })
  return {
    ltvMaxBps: Number(calls[0].status === "success" ? calls[0].result : 6000),
    liqThresholdBps: Number(calls[1].status === "success" ? calls[1].result : 7000),
    liqBonusBps: Number(calls[2].status === "success" ? calls[2].result : 1000),
    aprBps: Number(calls[3].status === "success" ? calls[3].result : 1200),
  }
}

export async function readProtocolData(): Promise<ProtocolData | null> {
  const addrs = loadAddresses()
  if (!addrs) return null

  let protocolParams: Partial<ProtocolData>

  try {
    const data = (await publicClient.readContract({
      address: addrs.VAULT_MANAGER,
      abi: ABIS.vaultManager,
      functionName: "getProtocolData",
      args: [],
    })) as any

    protocolParams = {
      ltvMaxBps: Number(data.ltvMaxBps ?? data.LTV_MAX_BPS),
      liqThresholdBps: Number(data.liqThresholdBps ?? data.LIQ_THRESHOLD_BPS),
      liqBonusBps: Number(data.liqBonusBps ?? data.LIQ_BONUS_BPS),
      aprBps: Number(data.aprBps ?? data.APR_BPS),
    }
  } catch {
    // Fallback to individual variable reads
    protocolParams = await readProtocolByVars(addrs.VAULT_MANAGER)
  }

  // Read price separately
  const priceUsd = (await readPriceUsd()) ?? undefined

  return {
    ltvMaxBps: protocolParams.ltvMaxBps ?? 6000,
    liqThresholdBps: protocolParams.liqThresholdBps ?? 7000,
    liqBonusBps: protocolParams.liqBonusBps ?? 1000,
    aprBps: protocolParams.aprBps ?? 1200,
    priceUsd,
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

export async function readOracleOwner(): Promise<`0x${string}` | null> {
  const addrs = loadAddresses()
  if (!addrs) return null
  try {
    const owner = (await publicClient.readContract({
      address: addrs.ORACLE,
      abi: ABIS.oracle,
      functionName: "owner", // Ownable.owner()
      args: [],
    })) as `0x${string}`
    return owner
  } catch {
    return null
  }
}

export async function readPriceE8(): Promise<bigint | null> {
  const addrs = loadAddresses()
  if (!addrs) return null
  try {
    const res = (await publicClient.readContract({
      address: addrs.ORACLE,
      abi: ABIS.oracle,
      functionName: "getPrice",
      args: [addrs.WBTC],
    })) as bigint
    return res
  } catch {
    return null
  }
}

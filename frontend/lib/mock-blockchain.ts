export interface MockVaultData {
  collateralAmount: bigint
  debtAmount: bigint
  accruedInterest: bigint
  ltv: number
  healthFactor: number
  liquidationPrice: number
  isActive: boolean
}

export interface MockProtocolData {
  totalCollateral: bigint
  totalDebt: bigint
  vaultCount: number
  wbtcPrice: number
}

// Mock wallet connection
export const mockWallet = {
  address: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87" as `0x${string}`,
  isConnected: true,
}

// Mock balances
export const mockBalances = {
  wbtc: BigInt("500000000"), // 5 WBTC
  musd: BigInt("50000000000000000000000"), // 50,000 mUSD
}

// Mock vault data
export const mockVault: MockVaultData = {
  collateralAmount: BigInt("100000000"), // 1 WBTC
  debtAmount: BigInt("20000000000000000000000"), // 20,000 mUSD
  accruedInterest: BigInt("500000000000000000000"), // 500 mUSD
  ltv: 45,
  healthFactor: 1.33,
  liquidationPrice: 30750,
  isActive: true,
}

// Mock protocol data
export const mockProtocol: MockProtocolData = {
  totalCollateral: BigInt("10000000000"), // 100 WBTC
  totalDebt: BigInt("2000000000000000000000000"), // 2M mUSD
  vaultCount: 156,
  wbtcPrice: 45000,
}

// Utility functions
export function formatUnits(value: bigint, decimals: number): string {
  const divisor = BigInt(10) ** BigInt(decimals)
  const quotient = value / divisor
  const remainder = value % divisor

  if (remainder === BigInt(0)) {
    return quotient.toString()
  }

  const remainderStr = remainder.toString().padStart(decimals, "0")
  const trimmedRemainder = remainderStr.replace(/0+$/, "")

  return trimmedRemainder ? `${quotient}.${trimmedRemainder}` : quotient.toString()
}

export function parseUnits(value: string, decimals: number): bigint {
  const [integer, decimal = ""] = value.split(".")
  const paddedDecimal = decimal.padEnd(decimals, "0").slice(0, decimals)
  return BigInt(integer + paddedDecimal)
}

export function isAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function getAddress(address: string): string {
  return address.toLowerCase()
}

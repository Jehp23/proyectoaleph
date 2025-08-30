// Centralized query keys for cache management and invalidation
export const queryKeys = {
  // Protocol data
  protocol: ["protocol"] as const,
  protocolData: () => [...queryKeys.protocol, "data"] as const,
  btcPrice: () => [...queryKeys.protocol, "btc-price"] as const,

  // Vault data
  vaults: ["vaults"] as const,
  vaultList: () => [...queryKeys.vaults, "list"] as const,
  userVaults: (address?: string) => [...queryKeys.vaults, "user", address] as const,
  vaultDetails: (address: string) => [...queryKeys.vaults, "details", address] as const,
  liquidatableVaults: () => [...queryKeys.vaults, "liquidatable"] as const,

  // Price data
  prices: ["prices"] as const,
  priceHistory: (period: string) => [...queryKeys.prices, "history", period] as const,
  realTimePrice: () => [...queryKeys.prices, "realtime"] as const,

  // User data
  user: (address?: string) => ["user", address] as const,
  userBalance: (address?: string, token?: string) => [...queryKeys.user(address), "balance", token] as const,
  userAllowance: (address?: string, token?: string, spender?: string) =>
    [...queryKeys.user(address), "allowance", token, spender] as const,
} as const

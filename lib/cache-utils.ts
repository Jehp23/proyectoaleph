import { queryClient } from "./query-client"
import { queryKeys } from "./query-keys"

// Cache invalidation utilities
export const invalidateQueries = {
  // Invalidate all protocol data after parameter changes
  protocol: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.protocol })
  },

  // Invalidate vault data after transactions
  vaults: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.vaults })
  },

  // Invalidate specific user's vault data
  userVaults: (address: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.userVaults(address) })
    queryClient.invalidateQueries({ queryKey: queryKeys.vaultDetails(address) })
  },

  // Invalidate user balances after transactions
  userBalances: (address: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user(address) })
  },

  // Invalidate all data after major state changes
  all: () => {
    queryClient.invalidateQueries()
  },
}

// Optimistic update utilities
export const optimisticUpdates = {
  // Optimistically update vault data during transactions
  updateVault: (address: string, updater: (oldData: any) => any) => {
    queryClient.setQueryData(queryKeys.vaultDetails(address), updater)
    queryClient.setQueryData(queryKeys.userVaults(address), (oldData: any) => {
      if (!oldData) return oldData
      return updater(oldData)
    })
  },

  // Optimistically update user balance
  updateBalance: (address: string, token: string, newBalance: bigint) => {
    queryClient.setQueryData(queryKeys.userBalance(address, token), newBalance)
  },

  // Optimistically update BTC price
  updateBtcPrice: (newPrice: number) => {
    queryClient.setQueryData(queryKeys.btcPrice(), newPrice)
  },
}

// Prefetch utilities for better UX
export const prefetchQueries = {
  // Prefetch user data when wallet connects
  userData: async (address: string) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.userVaults(address),
        staleTime: 10 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.userBalance(address, "WBTC"),
        staleTime: 10 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.userBalance(address, "mUSD"),
        staleTime: 10 * 1000,
      }),
    ])
  },

  // Prefetch protocol data on app load
  protocolData: async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.protocolData(),
        staleTime: 30 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.btcPrice(),
        staleTime: 5 * 1000,
      }),
    ])
  },
}

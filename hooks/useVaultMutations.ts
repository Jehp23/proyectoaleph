import { useMutation } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { useProtocolWrites } from "./useWrites"
import { invalidateQueries, optimisticUpdates } from "@/lib/cache-utils"
import { calculateHealthFactor, calculateLTV } from "@/lib/math"
import { queryClient, queryKeys } from "@/lib/react-query-client" // Declare queryClient and queryKeys

// Vault creation mutation with optimistic updates
export function useCreateVault() {
  const { address } = useAccount()
  const { depositCollateralAndBorrow } = useProtocolWrites()

  return useMutation({
    mutationFn: async ({
      btcAmount,
      borrowAmount,
    }: {
      btcAmount: number
      borrowAmount: number
    }) => {
      if (!address) throw new Error("Wallet not connected")

      // Execute the actual transaction
      const result = await depositCollateralAndBorrow(btcAmount, borrowAmount)
      return result
    },

    onMutate: async ({ btcAmount, borrowAmount }) => {
      if (!address) return

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.userVaults(address) })

      // Optimistically update the cache
      const optimisticVault = {
        owner: address,
        btcCollateral: btcAmount,
        usdtBorrowed: borrowAmount,
        status: "Active",
        createdAt: new Date(),
        // Calculate optimistic values
        healthFactor: calculateHealthFactor(btcAmount, borrowAmount, 45000, 0.7),
        ltv: calculateLTV(btcAmount, borrowAmount, 45000),
      }

      optimisticUpdates.updateVault(address, () => optimisticVault)

      return { optimisticVault }
    },

    onError: (err, variables, context) => {
      // Revert optimistic update on error
      if (context?.optimisticVault && address) {
        invalidateQueries.userVaults(address)
      }
    },

    onSuccess: () => {
      // Invalidate and refetch after successful transaction
      if (address) {
        invalidateQueries.userVaults(address)
        invalidateQueries.protocol()
      }
    },
  })
}

// Add collateral mutation
export function useAddCollateral() {
  const { address } = useAccount()
  const { depositCollateral } = useProtocolWrites()

  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      if (!address) throw new Error("Wallet not connected")
      return await depositCollateral(amount)
    },

    onMutate: async ({ amount }) => {
      if (!address) return

      // Optimistically update vault data
      optimisticUpdates.updateVault(address, (oldVault: any) => {
        if (!oldVault) return oldVault
        const newCollateral = oldVault.btcCollateral + amount
        return {
          ...oldVault,
          btcCollateral: newCollateral,
          healthFactor: calculateHealthFactor(newCollateral, oldVault.usdtBorrowed, 45000, 0.7),
          ltv: calculateLTV(newCollateral, oldVault.usdtBorrowed, 45000),
        }
      })
    },

    onError: () => {
      if (address) invalidateQueries.userVaults(address)
    },

    onSuccess: () => {
      if (address) invalidateQueries.userVaults(address)
    },
  })
}

// Borrow more mutation
export function useBorrowMore() {
  const { address } = useAccount()
  const { borrow } = useProtocolWrites()

  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      if (!address) throw new Error("Wallet not connected")
      return await borrow(amount)
    },

    onMutate: async ({ amount }) => {
      if (!address) return

      optimisticUpdates.updateVault(address, (oldVault: any) => {
        if (!oldVault) return oldVault
        const newBorrowed = oldVault.usdtBorrowed + amount
        return {
          ...oldVault,
          usdtBorrowed: newBorrowed,
          healthFactor: calculateHealthFactor(oldVault.btcCollateral, newBorrowed, 45000, 0.7),
          ltv: calculateLTV(oldVault.btcCollateral, newBorrowed, 45000),
        }
      })
    },

    onError: () => {
      if (address) invalidateQueries.userVaults(address)
    },

    onSuccess: () => {
      if (address) invalidateQueries.userVaults(address)
    },
  })
}

// Repay debt mutation
export function useRepayDebt() {
  const { address } = useAccount()
  const { repay } = useProtocolWrites()

  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      if (!address) throw new Error("Wallet not connected")
      return await repay(amount)
    },

    onMutate: async ({ amount }) => {
      if (!address) return

      optimisticUpdates.updateVault(address, (oldVault: any) => {
        if (!oldVault) return oldVault
        const newBorrowed = Math.max(0, oldVault.usdtBorrowed - amount)
        return {
          ...oldVault,
          usdtBorrowed: newBorrowed,
          healthFactor: newBorrowed > 0 ? calculateHealthFactor(oldVault.btcCollateral, newBorrowed, 45000, 0.7) : 999,
          ltv: newBorrowed > 0 ? calculateLTV(oldVault.btcCollateral, newBorrowed, 45000) : 0,
        }
      })
    },

    onError: () => {
      if (address) invalidateQueries.userVaults(address)
    },

    onSuccess: () => {
      if (address) invalidateQueries.userVaults(address)
    },
  })
}

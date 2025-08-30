"use client"

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { CONTRACTS, VAULT_MANAGER_ABI, ERC20_ABI } from '@/lib/contracts'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

export interface VaultData {
  collateralAmount: bigint
  debtAmount: bigint
  accruedInterest: bigint
  ltv: number
  healthFactor: number
  liquidationPrice: number
  isActive: boolean
}

export interface ProtocolData {
  totalCollateral: bigint
  totalDebt: bigint
  vaultCount: number
  wbtcPrice: number
}

export function useVault() {
  const { address } = useAccount()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // Read vault data
  const { data: vaultData, refetch: refetchVault } = useReadContract({
    address: CONTRACTS.VAULT_MANAGER,
    abi: VAULT_MANAGER_ABI,
    functionName: 'getVaultData',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  })

  // Read protocol data
  const { data: protocolData, refetch: refetchProtocol } = useReadContract({
    address: CONTRACTS.VAULT_MANAGER,
    abi: VAULT_MANAGER_ABI,
    functionName: 'getProtocolData',
    query: {
      refetchInterval: 15000, // Refetch every 15 seconds
    }
  })

  // Read WBTC balance and allowance
  const { data: wbtcBalance } = useReadContract({
    address: CONTRACTS.WBTC,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  })

  const { data: wbtcAllowance, refetch: refetchWbtcAllowance } = useReadContract({
    address: CONTRACTS.WBTC,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.VAULT_MANAGER] : undefined,
    query: {
      enabled: !!address,
    }
  })

  // Read mUSD balance and allowance
  const { data: musdBalance } = useReadContract({
    address: CONTRACTS.MUSD,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  })

  const { data: musdAllowance, refetch: refetchMusdAllowance } = useReadContract({
    address: CONTRACTS.MUSD,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.VAULT_MANAGER] : undefined,
    query: {
      enabled: !!address,
    }
  })

  // Write contracts
  const { writeContract, data: hash } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  })

  // Helper to format vault data
  const formatVaultData = (data: any): VaultData | null => {
    if (!data) return null
    
    return {
      collateralAmount: data[0],
      debtAmount: data[1],
      accruedInterest: data[2],
      ltv: Number(data[3]),
      healthFactor: Number(data[4]) / 100, // Convert from basis points
      liquidationPrice: Number(formatUnits(data[5], 8)),
      isActive: data[6]
    }
  }

  // Helper to format protocol data
  const formatProtocolData = (data: any): ProtocolData | null => {
    if (!data) return null
    
    return {
      totalCollateral: data[0],
      totalDebt: data[1],
      vaultCount: Number(data[2]),
      wbtcPrice: Number(formatUnits(data[3], 8))
    }
  }

  // Approve WBTC spending
  const approveWbtc = async (amount: bigint) => {
    try {
      setIsLoading(true)
      writeContract({
        address: CONTRACTS.WBTC,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACTS.VAULT_MANAGER, amount],
      })
      
      toast({
        title: "Aprobación enviada",
        description: "Confirma la transacción en tu wallet",
      })
    } catch (error) {
      console.error('Error approving WBTC:', error)
      toast({
        title: "Error",
        description: "No se pudo aprobar el gasto de WBTC",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Approve mUSD spending
  const approveMusd = async (amount: bigint) => {
    try {
      setIsLoading(true)
      writeContract({
        address: CONTRACTS.MUSD,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACTS.VAULT_MANAGER, amount],
      })
      
      toast({
        title: "Aprobación enviada",
        description: "Confirma la transacción en tu wallet",
      })
    } catch (error) {
      console.error('Error approving mUSD:', error)
      toast({
        title: "Error",
        description: "No se pudo aprobar el gasto de mUSD",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Deposit collateral
  const depositCollateral = async (amount: string) => {
    try {
      setIsLoading(true)
      const amountWei = parseUnits(amount, 8) // WBTC has 8 decimals
      
      // Check allowance
      if (!wbtcAllowance || wbtcAllowance < amountWei) {
        await approveWbtc(amountWei)
        return
      }
      
      writeContract({
        address: CONTRACTS.VAULT_MANAGER,
        abi: VAULT_MANAGER_ABI,
        functionName: 'depositCollateral',
        args: [amountWei],
      })
      
      toast({
        title: "Depósito enviado",
        description: `Depositando ${amount} WBTC como colateral`,
      })
    } catch (error) {
      console.error('Error depositing collateral:', error)
      toast({
        title: "Error",
        description: "No se pudo depositar el colateral",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Withdraw collateral
  const withdrawCollateral = async (amount: string) => {
    try {
      setIsLoading(true)
      const amountWei = parseUnits(amount, 8)
      
      writeContract({
        address: CONTRACTS.VAULT_MANAGER,
        abi: VAULT_MANAGER_ABI,
        functionName: 'withdrawCollateral',
        args: [amountWei],
      })
      
      toast({
        title: "Retiro enviado",
        description: `Retirando ${amount} WBTC de colateral`,
      })
    } catch (error) {
      console.error('Error withdrawing collateral:', error)
      toast({
        title: "Error",
        description: "No se pudo retirar el colateral",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Borrow mUSD
  const borrow = async (amount: string) => {
    try {
      setIsLoading(true)
      const amountWei = parseUnits(amount, 18) // mUSD has 18 decimals
      
      writeContract({
        address: CONTRACTS.VAULT_MANAGER,
        abi: VAULT_MANAGER_ABI,
        functionName: 'borrow',
        args: [amountWei],
      })
      
      toast({
        title: "Préstamo enviado",
        description: `Solicitando ${amount} mUSD`,
      })
    } catch (error) {
      console.error('Error borrowing:', error)
      toast({
        title: "Error",
        description: "No se pudo solicitar el préstamo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Repay debt
  const repay = async (amount: string) => {
    try {
      setIsLoading(true)
      const amountWei = parseUnits(amount, 18)
      
      // Check allowance
      if (!musdAllowance || musdAllowance < amountWei) {
        await approveMusd(amountWei)
        return
      }
      
      writeContract({
        address: CONTRACTS.VAULT_MANAGER,
        abi: VAULT_MANAGER_ABI,
        functionName: 'repay',
        args: [amountWei],
      })
      
      toast({
        title: "Pago enviado",
        description: `Pagando ${amount} mUSD de deuda`,
      })
    } catch (error) {
      console.error('Error repaying:', error)
      toast({
        title: "Error",
        description: "No se pudo pagar la deuda",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Close vault
  const closeVault = async () => {
    try {
      setIsLoading(true)
      
      writeContract({
        address: CONTRACTS.VAULT_MANAGER,
        abi: VAULT_MANAGER_ABI,
        functionName: 'closeVault',
        args: [],
      })
      
      toast({
        title: "Cierre de vault enviado",
        description: "Cerrando vault y recuperando colateral",
      })
    } catch (error) {
      console.error('Error closing vault:', error)
      toast({
        title: "Error",
        description: "No se pudo cerrar el vault",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Liquidate vault
  const liquidate = async (userAddress: string, repayAmount: string) => {
    try {
      setIsLoading(true)
      const amountWei = parseUnits(repayAmount, 18)
      
      // Check allowance
      if (!musdAllowance || musdAllowance < amountWei) {
        await approveMusd(amountWei)
        return
      }
      
      writeContract({
        address: CONTRACTS.VAULT_MANAGER,
        abi: VAULT_MANAGER_ABI,
        functionName: 'liquidate',
        args: [userAddress as `0x${string}`, amountWei],
      })
      
      toast({
        title: "Liquidación enviada",
        description: `Liquidando vault con ${repayAmount} mUSD`,
      })
    } catch (error) {
      console.error('Error liquidating:', error)
      toast({
        title: "Error",
        description: "No se pudo liquidar el vault",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh all data
  const refreshData = () => {
    refetchVault()
    refetchProtocol()
    refetchWbtcAllowance()
    refetchMusdAllowance()
  }

  return {
    // Data
    vault: formatVaultData(vaultData),
    protocol: formatProtocolData(protocolData),
    balances: {
      wbtc: wbtcBalance || 0n,
      musd: musdBalance || 0n,
    },
    allowances: {
      wbtc: wbtcAllowance || 0n,
      musd: musdAllowance || 0n,
    },
    
    // Actions
    depositCollateral,
    withdrawCollateral,
    borrow,
    repay,
    closeVault,
    liquidate,
    approveWbtc,
    approveMusd,
    refreshData,
    
    // States
    isLoading: isLoading || isConfirming,
    isConnected: !!address,
  }
}

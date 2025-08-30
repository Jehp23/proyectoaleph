import { createPublicClient, createWalletClient, http } from "viem"
import { sepolia } from "viem/chains"
import { privateKeyToAccount } from "viem/accounts"
import { ORACLE_ABI, VAULT_MANAGER_ABI, ERC20_ABI } from "./abi"

// Environment validation
const RPC_URL = process.env.RPC_URL
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY

if (!RPC_URL) {
  throw new Error("RPC_URL environment variable is required")
}

// Public client for read operations
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
})

// Wallet client for admin operations (oracle price setting)
export const walletClient = ADMIN_PRIVATE_KEY
  ? createWalletClient({
      chain: sepolia,
      transport: http(RPC_URL),
      account: privateKeyToAccount(ADMIN_PRIVATE_KEY as `0x${string}`),
    })
  : null

// Contract configurations with typed ABIs
export const oracle = {
  address: process.env.ORACLE_ADDRESS as `0x${string}`,
  abi: ORACLE_ABI,
}

export const vaultManager = {
  address: process.env.VAULT_MANAGER_ADDRESS as `0x${string}`,
  abi: VAULT_MANAGER_ABI,
}

export const wbtc = {
  address: process.env.WBTC_ADDRESS as `0x${string}`,
  abi: ERC20_ABI,
}

export const usdt = {
  address: process.env.USDT_ADDRESS as `0x${string}`,
  abi: ERC20_ABI,
}

// Chain configuration
export const CHAIN_ID = Number.parseInt(process.env.CHAIN_ID || "11155111")

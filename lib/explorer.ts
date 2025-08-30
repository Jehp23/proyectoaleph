import { mainnet, sepolia } from "viem/chains"

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111)
const ENV_EXPLORER = process.env.NEXT_PUBLIC_EXPLORER_BASE // opcional override (p. ej. Lisk)

function chainExplorerBase(): string {
  if (ENV_EXPLORER) return ENV_EXPLORER
  // Fallbacks conocidos (puedes ampliar si usas otras chains):
  if (CHAIN_ID === mainnet.id) return mainnet.blockExplorers?.default.url ?? "https://etherscan.io"
  if (CHAIN_ID === sepolia.id) return sepolia.blockExplorers?.default.url ?? "https://sepolia.etherscan.io"
  // fallback genérico
  return "https://etherscan.io"
}

export const EXPLORER_BASE = chainExplorerBase()

export const addressUrl = (addr: `0x${string}`) => `${EXPLORER_BASE}/address/${addr}`
export const txUrl = (hash: `0x${string}`) => `${EXPLORER_BASE}/tx/${hash}`

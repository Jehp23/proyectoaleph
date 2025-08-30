import { createPublicClient, http } from "viem"
import { mainnet, sepolia } from "viem/chains"

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111)
const CHAIN = CHAIN_ID === 1 ? mainnet : sepolia

export const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL!),
})

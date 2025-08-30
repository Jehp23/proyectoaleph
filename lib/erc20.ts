import { ABIS } from "@/lib/contracts"
import { publicClient } from "@/lib/chain"
import type { Address } from "viem"

export async function readAllowance(token: Address, owner: Address, spender: Address): Promise<bigint> {
  return (await publicClient.readContract({
    address: token,
    abi: ABIS.erc20,
    functionName: "allowance",
    args: [owner, spender],
  })) as bigint
}

import VAULT_MANAGER_ABI from "@/abi/VaultManager.json"
import ORACLE_ABI from "@/abi/MockOracle.json"
import ERC20_ABI from "@/abi/ERC20.json"

export type Addresses = {
  VAULT_MANAGER: `0x${string}`
  WBTC: `0x${string}`
  MUSD: `0x${string}`
  ORACLE: `0x${string}`
}

function loadFromEnv(): Partial<Addresses> {
  return {
    VAULT_MANAGER: process.env.NEXT_PUBLIC_VAULT_MANAGER_ADDRESS as any,
    WBTC: process.env.NEXT_PUBLIC_WBTC_ADDRESS as any,
    MUSD: process.env.NEXT_PUBLIC_MUSD_ADDRESS as any,
    ORACLE: process.env.NEXT_PUBLIC_ORACLE_ADDRESS as any,
  }
}

export function loadAddresses(): Addresses | null {
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem("protocol.addresses")
    if (raw) {
      try {
        return JSON.parse(raw) as Addresses
      } catch {}
    }
  }
  const env = loadFromEnv()
  if (env.VAULT_MANAGER && env.WBTC && env.MUSD && env.ORACLE) return env as Addresses
  return null
}

export const ABIS = {
  vaultManager:
    VAULT_MANAGER_ABI ||
    ([
      // Read functions
      {
        inputs: [{ name: "user", type: "address" }],
        name: "getVaultData",
        outputs: [
          { name: "collateralAmount", type: "uint256" },
          { name: "debtAmount", type: "uint256" },
          { name: "accruedInterest", type: "uint256" },
          { name: "ltv", type: "uint256" },
          { name: "healthFactor", type: "uint256" },
          { name: "liquidationPrice", type: "uint256" },
          { name: "isActive", type: "bool" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getProtocolData",
        outputs: [
          { name: "_totalCollateral", type: "uint256" },
          { name: "_totalDebt", type: "uint256" },
          { name: "_vaultCount", type: "uint256" },
          { name: "wbtcPrice", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
      },
    ] as const),
  oracle:
    ORACLE_ABI ||
    ([
      {
        inputs: [{ name: "token", type: "address" }],
        name: "getPrice",
        outputs: [{ name: "price", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ] as const),
  erc20:
    ERC20_ABI ||
    ([
      {
        inputs: [{ name: "owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "decimals",
        outputs: [{ name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function",
      },
    ] as const),
}

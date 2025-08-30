import VAULT_MANAGER_ABI from "@/abi/VaultManager.json"
import ORACLE_ABI from "@/abi/MockOracle.json"
import ERC20_ABI from "@/abi/ERC20.json"
import { loadAddresses, type Addresses } from "@/lib/addresses"

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

// Reexport para quienes lo necesiten
export { loadAddresses }
export type { Addresses }

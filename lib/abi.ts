// ABI definitions for CauciónBTC smart contracts
// TODO: Replace these placeholders with actual contract ABIs after deployment

export const ORACLE_ABI = [] as const
// TODO: Paste Oracle contract ABI here
// Expected functions: getPrice() -> uint256, setPrice(uint256) -> void

export const VAULT_MANAGER_ABI = [] as const
// TODO: Paste VaultManager contract ABI here
// Expected functions: vaults(uint256) -> (address owner, uint256 collateralWBTC, uint256 debtUSDT, uint256 aprBps, uint256 lastAccrualTs)

export const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
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
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const
// Standard ERC20 ABI - ready to use

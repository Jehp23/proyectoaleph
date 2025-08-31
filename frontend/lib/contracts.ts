// lib/contracts.ts
import { BrowserProvider, Contract } from "ethers";
import P2P_ABI from "../onchain/abi/P2PSecuredLoan.json";
import ERC20_ABI from "../onchain/abi/MockERC20.json";
import { loadConfig } from "./config-api";

// Obtener provider + signer de MetaMask
export async function getSigner() {
  if (!(window as any).ethereum) throw new Error("MetaMask no detectado");
  const provider = new BrowserProvider((window as any).ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const net = await provider.getNetwork();
  return { provider, signer, chainId: Number(net.chainId) };
}

// Armar instancias de contratos desde el backend/config.json
export async function getContracts() {
  const cfg = await loadConfig();
  const { signer, chainId } = await getSigner();

  const expected = cfg.network === "localhost" ? 31337 : 11155111;
  if (chainId !== expected) {
    throw new Error(`Conectá MetaMask a ${cfg.network} (chainId ${expected})`);
  }

  const p2p = new Contract(cfg.loan, P2P_ABI as any, signer);
  const stable = new Contract(cfg.usdtToken, ERC20_ABI as any, signer);
  const collateral = new Contract(cfg.wethToken, ERC20_ABI as any, signer);

  return { p2p, stable, collateral, cfg };
}

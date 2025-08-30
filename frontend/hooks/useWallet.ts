// frontend/hooks/useWallet.ts
"use client";

import { useEffect, useState } from "react";

type Ethereum = {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
};

const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7"; // 11155111

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [hasProvider, setHasProvider] = useState<boolean>(false);

  // detectar provider y estado inicial
  useEffect(() => {
    const eth = (window as any).ethereum as Ethereum | undefined;
    if (!eth) return;
    setHasProvider(true);

    const handleAccounts = (accs: string[]) => setAddress(accs?.[0] ?? null);
    const handleChain = (cid: string) => setChainId(cid);

    // estado actual
    eth.request({ method: "eth_accounts" }).then(handleAccounts).catch(() => {});
    eth.request({ method: "eth_chainId" }).then(handleChain).catch(() => {});

    // listeners
    eth.on("accountsChanged", handleAccounts);
    eth.on("chainChanged", handleChain);
    return () => {
      eth.removeListener("accountsChanged", handleAccounts);
      eth.removeListener("chainChanged", handleChain);
    };
  }, []);

  const connect = async () => {
    const eth = (window as any).ethereum as Ethereum | undefined;
    if (!eth) throw new Error("No hay wallet inyectada (MetaMask).");
    const accs = await eth.request({ method: "eth_requestAccounts" });
    setAddress(accs?.[0] ?? null);
  };

  const ensureSepolia = async () => {
    const eth = (window as any).ethereum as Ethereum | undefined;
    if (!eth) return;
    if (chainId?.toLowerCase() === SEPOLIA_CHAIN_ID_HEX) return;
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
      });
    } catch (e) {
      // si la red no existe en la wallet, se podría hacer wallet_addEthereumChain
    }
  };

  const disconnect = () => {
    // MetaMask no expone "disconnect"; borramos estado local.
    setAddress(null);
  };

  return {
    hasProvider,
    address,
    chainId,
    connect,
    disconnect,
    ensureSepolia,
    isSepolia: chainId?.toLowerCase() === SEPOLIA_CHAIN_ID_HEX,
  };
}

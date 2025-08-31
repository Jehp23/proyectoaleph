// frontend/src/lib/config-api.ts
export type P2PConfig = {
  network: "sepolia" | "localhost";
  loan: string;        // P2PSecuredLoan
  usdtToken: string;   // stable (MockUSDC en localhost)
  wethToken: string;   // collateral (MockBTC en localhost)
  priceOracle?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function loadConfig(): Promise<P2PConfig> {
  const r = await fetch(`${API}/config`);
  if (!r.ok) throw new Error("Load config failed");
  return r.json();
}

export async function saveConfig(cfg: P2PConfig, adminToken?: string): Promise<P2PConfig> {
  const r = await fetch(`${API}/config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
    },
    body: JSON.stringify(cfg),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getPrice(): Promise<{ description?: string; price?: string }> {
  const r = await fetch(`${API}/oracle/price`);
  if (!r.ok) throw new Error("Oracle price failed");
  return r.json();
}

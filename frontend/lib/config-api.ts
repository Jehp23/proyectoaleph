export type P2PConfig = {
  loan?: string;
  usdtToken?: string;
  wethToken?: string;
  priceOracle?: string;            
  network?: "sepolia" | "localhost";
};

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export async function loadConfig(): Promise<P2PConfig> {
  const r = await fetch(`${API_BASE}/config`, { cache: "no-store" });
  if (!r.ok) throw new Error("No se pudo leer la configuración");
  return r.json();
}

export async function saveConfig(
  form: P2PConfig,
  adminToken?: string
): Promise<P2PConfig> {
  const r = await fetch(`${API_BASE}/config`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(adminToken ? { "x-admin-token": adminToken } : {}),
    },
    body: JSON.stringify(form),
  });
  if (!r.ok) throw new Error("No se pudo guardar la configuración");
  return r.json();
}

export async function getPrice(): Promise<{
  description?: string; decimals?: number; price?: number; updatedAt?: number;
}> {
  const r = await fetch(`${API_BASE}/price`, { cache: "no-store" });
  if (!r.ok) throw new Error("No se pudo leer el precio del oracle");
  return r.json();
}

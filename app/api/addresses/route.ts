/**
 * Contract Addresses Endpoint
 *
 * Returns all configured smart contract addresses from environment
 *
 * Example usage:
 * curl -s http://localhost:3000/api/addresses
 *
 * Expected response:
 * {
 *   "ok": true,
 *   "data": {
 *     "vaultManager": "0x...",
 *     "wbtc": "0x...",
 *     "usdt": "0x...",
 *     "oracle": "0x..."
 *   },
 *   "warnings": []
 * }
 */

import type { NextRequest } from "next/server"
import { createCorsResponse } from "@/lib/cors"

export async function GET(request: NextRequest) {
  const addresses = {
    vaultManager: process.env.VAULT_MANAGER_ADDRESS,
    wbtc: process.env.WBTC_ADDRESS,
    usdt: process.env.USDT_ADDRESS,
    oracle: process.env.ORACLE_ADDRESS,
  }

  const warnings: string[] = []

  // Check for missing addresses
  Object.entries(addresses).forEach(([key, value]) => {
    if (!value) {
      warnings.push(`Missing ${key.toUpperCase()}_ADDRESS in environment`)
    }
  })

  return createCorsResponse({
    ok: true,
    data: addresses,
    chainId: Number.parseInt(process.env.CHAIN_ID || "11155111"),
    ...(warnings.length > 0 && { warnings }),
  })
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "same-origin",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

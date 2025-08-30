/**
 * BTC Price Oracle Endpoint
 *
 * Reads current BTC price from on-chain oracle contract
 *
 * Example usage:
 * curl -s http://localhost:3000/api/price
 *
 * Expected response:
 * {
 *   "ok": true,
 *   "data": {
 *     "priceE8": 6000000000000,
 *     "priceUsd": 60000.00
 *   }
 * }
 */

import type { NextRequest } from "next/server"
import { oracle } from "@/lib/chain"
import { createCorsResponse } from "@/lib/cors"

export async function GET(request: NextRequest) {
  try {
    // Validate oracle configuration
    if (!oracle.address) {
      return createCorsResponse(
        {
          ok: false,
          error: {
            code: "ORACLE_NOT_CONFIGURED",
            message: "Oracle address not configured in environment",
          },
        },
        500,
      )
    }

    // TODO: Uncomment when Oracle ABI is available
    // Read price from oracle contract (assumes price is stored as E8: $60,000 = 6000000000000)
    /*
    const priceE8 = await readContract(publicClient, {
      ...oracle,
      functionName: "getPrice",
      args: [],
    }) as bigint

    const priceUsd = Number(priceE8) / 1e8
    */

    // Mock response until Oracle ABI is available
    const mockPriceE8 = 6000000000000n // $60,000 in E8 format
    const priceUsd = Number(mockPriceE8) / 1e8

    return createCorsResponse({
      ok: true,
      data: {
        priceE8: Number(mockPriceE8),
        priceUsd: priceUsd,
        timestamp: new Date().toISOString(),
        // TODO: Remove mock flag when real oracle is connected
        mock: true,
      },
    })
  } catch (error) {
    console.error("[CauciónBTC] Oracle price read failed:", error)

    return createCorsResponse(
      {
        ok: false,
        error: {
          code: "ORACLE_READ_FAILED",
          message: error instanceof Error ? error.message : "Failed to read price from oracle",
        },
      },
      500,
    )
  }
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

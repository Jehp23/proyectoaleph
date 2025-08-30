/**
 * Health Check Endpoint
 *
 * Verifies RPC connectivity and returns basic system status
 *
 * Example usage:
 * curl -s http://localhost:3000/api/health
 *
 * Expected response:
 * { "ok": true, "chainId": 11155111, "rpcOk": true }
 */

import type { NextRequest } from "next/server"
import { publicClient } from "@/lib/chain"
import { createCorsResponse } from "@/lib/cors"

export async function GET(request: NextRequest) {
  try {
    // Test RPC connectivity by fetching chain ID
    const chainId = await publicClient.getChainId()

    return createCorsResponse({
      ok: true,
      chainId: Number(chainId),
      rpcOk: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[CauciónBTC] Health check failed:", error)

    return createCorsResponse(
      {
        ok: false,
        error: {
          code: "RPC_UNAVAILABLE",
          message: error instanceof Error ? error.message : "RPC connection failed",
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

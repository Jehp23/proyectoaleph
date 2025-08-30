/**
 * ⚠️  DANGER: DEMO-ONLY ADMIN ENDPOINT ⚠️
 *
 * This endpoint allows setting BTC price on the oracle contract.
 * This is ONLY for demonstration purposes and should be REMOVED in production.
 *
 * SECURITY WARNINGS:
 * - Uses ADMIN_PRIVATE_KEY from environment (never use for user funds)
 * - No authentication beyond private key possession
 * - Can manipulate oracle prices (affects all vaults)
 * - Remove this endpoint before production deployment
 *
 * Example usage:
 * curl -s -X POST http://localhost:3000/api/oracle/set-price \
 *   -H "Content-Type: application/json" \
 *   -d '{"priceE8": 5800000000000}'
 *
 * Expected response:
 * { "ok": true, "data": { "txHash": "0x..." } }
 */

import type { NextRequest } from "next/server"
import { z } from "zod"
import { walletClient, oracle } from "@/lib/chain"
import { createCorsResponse } from "@/lib/cors"

// Validation schema for price setting
const setPriceSchema = z.object({
  priceE8: z
    .number()
    .int()
    .positive()
    .min(1000000000) // Minimum $10 (1000000000 in E8)
    .max(10000000000000), // Maximum $100,000 (10000000000000 in E8)
})

export async function POST(request: NextRequest) {
  try {
    // Check if admin functionality is enabled
    if (!walletClient) {
      return createCorsResponse(
        {
          ok: false,
          error: {
            code: "ADMIN_DISABLED",
            message: "Admin functionality disabled - ADMIN_PRIVATE_KEY not configured",
          },
        },
        403,
      )
    }

    // Validate oracle configuration
    if (!oracle.address) {
      return createCorsResponse(
        {
          ok: false,
          error: {
            code: "ORACLE_NOT_CONFIGURED",
            message: "Oracle contract address not configured",
          },
        },
        500,
      )
    }

    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return createCorsResponse(
        {
          ok: false,
          error: {
            code: "INVALID_JSON",
            message: "Request body must be valid JSON",
          },
        },
        400,
      )
    }

    const validation = setPriceSchema.safeParse(body)
    if (!validation.success) {
      return createCorsResponse(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: validation.error.errors,
          },
        },
        400,
      )
    }

    const { priceE8 } = validation.data

    // TODO: Uncomment when Oracle ABI is available
    /*
    // Call oracle.setPrice() with the new price
    const txHash = await writeContract(walletClient, {
      ...oracle,
      functionName: "setPrice",
      args: [BigInt(priceE8)],
    })
    */

    // Mock transaction hash until Oracle ABI is available
    const mockTxHash = `0x${Math.random().toString(16).slice(2).padStart(64, "0")}`

    console.log(`[CauciónBTC] DEMO: Setting oracle price to ${priceE8} (${priceE8 / 1e8} USD)`)

    return createCorsResponse({
      ok: true,
      data: {
        txHash: mockTxHash,
        priceE8,
        priceUsd: priceE8 / 1e8,
        timestamp: new Date().toISOString(),
        // TODO: Remove mock flag when real oracle is connected
        mock: true,
        warning: "This is a demo endpoint - remove in production",
      },
    })
  } catch (error) {
    console.error("[CauciónBTC] Oracle setPrice failed:", error)

    // Handle specific viem errors
    if (error instanceof Error) {
      if (error.message.includes("insufficient funds")) {
        return createCorsResponse(
          {
            ok: false,
            error: {
              code: "INSUFFICIENT_FUNDS",
              message: "Admin account has insufficient funds for transaction",
            },
          },
          500,
        )
      }

      if (error.message.includes("nonce")) {
        return createCorsResponse(
          {
            ok: false,
            error: {
              code: "NONCE_ERROR",
              message: "Transaction nonce error - try again",
            },
          },
          500,
        )
      }
    }

    return createCorsResponse(
      {
        ok: false,
        error: {
          code: "TRANSACTION_FAILED",
          message: error instanceof Error ? error.message : "Failed to set oracle price",
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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

// Explicitly disable other HTTP methods
export async function GET() {
  return createCorsResponse(
    {
      ok: false,
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "Only POST requests are allowed for this endpoint",
      },
    },
    405,
  )
}

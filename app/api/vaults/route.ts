/**
 * Vaults Listing Endpoint
 *
 * Returns list of vaults (MVP implementation with mock data)
 * TODO: Implement proper indexer for production
 *
 * Example usage:
 * curl -s http://localhost:3000/api/vaults
 * curl -s "http://localhost:3000/api/vaults?limit=10&offset=0"
 *
 * Expected response:
 * {
 *   "ok": true,
 *   "data": [...],
 *   "pagination": { "total": 100, "limit": 20, "offset": 0 }
 * }
 */

import type { NextRequest } from "next/server"
import { z } from "zod"
import { createCorsResponse } from "@/lib/cors"
import { calcLtv, calcHf, calcLiqPrice } from "@/lib/math"

// Validation schema for query parameters
const querySchema = z.object({
  limit: z.string().optional().default("20").transform(Number),
  offset: z.string().optional().default("0").transform(Number),
  status: z.enum(["healthy", "warning", "danger", "liquidatable"]).optional(),
  minHf: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  maxLtv: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
})

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    const validation = querySchema.safeParse(queryParams)
    if (!validation.success) {
      return createCorsResponse(
        {
          ok: false,
          error: {
            code: "INVALID_QUERY_PARAMS",
            message: "Invalid query parameters",
            details: validation.error.errors,
          },
        },
        400,
      )
    }

    const { limit, offset, status, minHf, maxLtv } = validation.data

    // TODO: Replace with actual indexer implementation
    // For MVP, return mock data with realistic vault scenarios

    const mockBtcPrice = 60000
    const mockVaults = [
      {
        id: 0,
        owner: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
        collateralBtc: 1.5,
        debtUsdt: 45000,
        aprBps: 800,
        lastAccrualTs: Math.floor(Date.now() / 1000) - 86400,
      },
      {
        id: 1,
        owner: "0x8ba1f109551bD432803012645Hac136c22C57592",
        collateralBtc: 0.8,
        debtUsdt: 35000,
        aprBps: 750,
        lastAccrualTs: Math.floor(Date.now() / 1000) - 3600,
      },
      {
        id: 2,
        owner: "0x1234567890123456789012345678901234567890",
        collateralBtc: 2.0,
        debtUsdt: 80000,
        aprBps: 900,
        lastAccrualTs: Math.floor(Date.now() / 1000) - 7200,
      },
    ]

    // Calculate metrics for each vault
    const vaultsWithMetrics = mockVaults.map((vault) => {
      const ltv = calcLtv(vault.debtUsdt, vault.collateralBtc, mockBtcPrice)
      const hf = calcHf(vault.debtUsdt, vault.collateralBtc, mockBtcPrice)
      const liquidationPrice = calcLiqPrice(vault.debtUsdt, vault.collateralBtc)

      let vaultStatus: "healthy" | "warning" | "danger" | "liquidatable"
      if (hf >= 1.5) vaultStatus = "healthy"
      else if (hf >= 1.2) vaultStatus = "warning"
      else if (hf >= 1.0) vaultStatus = "danger"
      else vaultStatus = "liquidatable"

      return {
        ...vault,
        ltv: Number(ltv.toFixed(4)),
        hf: Number(hf.toFixed(4)),
        liquidationPrice: Number(liquidationPrice.toFixed(2)),
        status: vaultStatus,
        currentBtcPrice: mockBtcPrice,
      }
    })

    // Apply filters
    let filteredVaults = vaultsWithMetrics

    if (status) {
      filteredVaults = filteredVaults.filter((vault) => vault.status === status)
    }

    if (minHf !== undefined) {
      filteredVaults = filteredVaults.filter((vault) => vault.hf >= minHf)
    }

    if (maxLtv !== undefined) {
      filteredVaults = filteredVaults.filter((vault) => vault.ltv <= maxLtv)
    }

    // Apply pagination
    const total = filteredVaults.length
    const paginatedVaults = filteredVaults.slice(offset, offset + limit)

    return createCorsResponse({
      ok: true,
      data: paginatedVaults,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      // TODO: Remove when real indexer is implemented
      note: "MVP implementation with mock data - implement indexer for production",
      mock: true,
    })
  } catch (error) {
    console.error("[CauciónBTC] Failed to list vaults:", error)

    return createCorsResponse(
      {
        ok: false,
        error: {
          code: "VAULTS_LIST_FAILED",
          message: error instanceof Error ? error.message : "Failed to list vaults",
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

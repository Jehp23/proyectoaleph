/**
 * Individual Vault Data Endpoint
 *
 * Reads vault data from blockchain and computes risk metrics
 *
 * Example usage:
 * curl -s http://localhost:3000/api/vaults/0
 *
 * Expected response:
 * {
 *   "ok": true,
 *   "data": {
 *     "id": 0,
 *     "owner": "0x...",
 *     "collateralBtc": 1.5,
 *     "debtUsdt": 45000,
 *     "aprBps": 800,
 *     "ltv": 0.5,
 *     "hf": 1.4,
 *     "liquidationPrice": 42857.14
 *   }
 * }
 */

import type { NextRequest } from "next/server"
import { z } from "zod"
import { vaultManager, oracle } from "@/lib/chain"
import { createCorsResponse } from "@/lib/cors"
import { calcLtv, calcHf, calcLiqPrice, bigIntToNumber } from "@/lib/math"

// Validation schema for vault ID parameter
const vaultIdSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Validate vault ID parameter
    const validation = vaultIdSchema.safeParse(params)
    if (!validation.success) {
      return createCorsResponse(
        {
          ok: false,
          error: {
            code: "INVALID_VAULT_ID",
            message: "Vault ID must be a non-negative integer",
          },
        },
        400,
      )
    }

    const { id: vaultId } = validation.data

    // Validate contract configuration
    if (!vaultManager.address || !oracle.address) {
      return createCorsResponse(
        {
          ok: false,
          error: {
            code: "CONTRACTS_NOT_CONFIGURED",
            message: "VaultManager or Oracle contract not configured",
          },
        },
        500,
      )
    }

    // TODO: Uncomment when VaultManager ABI is available
    /*
    // Read vault data from contract
    const vaultData = await readContract(publicClient, {
      ...vaultManager,
      functionName: "vaults",
      args: [BigInt(vaultId)],
    }) as [string, bigint, bigint, bigint, bigint] // [owner, collateralWBTC, debtUSDT, aprBps, lastAccrualTs]

    const [owner, collateralWBTC, debtUSDT, aprBps, lastAccrualTs] = vaultData

    // Check if vault exists (owner should not be zero address)
    if (owner === "0x0000000000000000000000000000000000000000") {
      return createCorsResponse(
        {
          ok: false,
          error: {
            code: "VAULT_NOT_FOUND",
            message: `Vault ${vaultId} does not exist`,
          },
        },
        404,
      )
    }

    // Read current BTC price from oracle
    const priceE8 = await readContract(publicClient, {
      ...oracle,
      functionName: "getPrice",
      args: [],
    }) as bigint

    const priceUsd = Number(priceE8) / 1e8
    */

    // Mock data until contracts are available
    const mockVaultData = {
      owner: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
      collateralWBTC: BigInt("1500000000000000000"), // 1.5 WBTC (18 decimals)
      debtUSDT: BigInt("45000000000000000000000"), // 45,000 USDT (18 decimals)
      aprBps: BigInt("800"), // 8% APR
      lastAccrualTs: BigInt(Math.floor(Date.now() / 1000)),
    }

    const mockPriceE8 = 6000000000000n // $60,000
    const priceUsd = Number(mockPriceE8) / 1e8

    // Convert BigInt values to numbers with proper decimals
    const collateralBtc = bigIntToNumber(mockVaultData.collateralWBTC, 18)
    const debtUsdt = bigIntToNumber(mockVaultData.debtUSDT, 18)
    const aprBps = Number(mockVaultData.aprBps)

    // Calculate risk metrics
    const ltv = calcLtv(debtUsdt, collateralBtc, priceUsd)
    const hf = calcHf(debtUsdt, collateralBtc, priceUsd)
    const liquidationPrice = calcLiqPrice(debtUsdt, collateralBtc)

    // Determine vault status based on health factor
    let status: "healthy" | "warning" | "danger" | "liquidatable"
    if (hf >= 1.5) status = "healthy"
    else if (hf >= 1.2) status = "warning"
    else if (hf >= 1.0) status = "danger"
    else status = "liquidatable"

    return createCorsResponse({
      ok: true,
      data: {
        id: vaultId,
        owner: mockVaultData.owner,
        collateralBtc: Number(collateralBtc.toFixed(8)),
        debtUsdt: Number(debtUsdt.toFixed(2)),
        aprBps,
        ltv: Number(ltv.toFixed(4)),
        hf: Number(hf.toFixed(4)),
        liquidationPrice: Number(liquidationPrice.toFixed(2)),
        status,
        currentBtcPrice: priceUsd,
        lastAccrualTs: Number(mockVaultData.lastAccrualTs),
        // TODO: Remove mock flag when real contracts are connected
        mock: true,
      },
    })
  } catch (error) {
    console.error(`[CauciónBTC] Failed to read vault ${params.id}:`, error)

    // Handle specific contract errors
    if (error instanceof Error) {
      if (error.message.includes("execution reverted")) {
        return createCorsResponse(
          {
            ok: false,
            error: {
              code: "CONTRACT_ERROR",
              message: "Contract execution failed - vault may not exist",
            },
          },
          404,
        )
      }

      if (error.message.includes("call revert exception")) {
        return createCorsResponse(
          {
            ok: false,
            error: {
              code: "VAULT_NOT_FOUND",
              message: `Vault ${params.id} does not exist`,
            },
          },
          404,
        )
      }
    }

    return createCorsResponse(
      {
        ok: false,
        error: {
          code: "VAULT_READ_FAILED",
          message: error instanceof Error ? error.message : "Failed to read vault data",
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

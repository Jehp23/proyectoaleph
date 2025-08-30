"use client"

import { useEffect, useState } from "react"
import { publicClient } from "@/lib/chain"

// Chainlink BTC/USD Price Feed addresses by chain
const CHAINLINK_FEEDS = {
  1: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c", // Mainnet BTC/USD
  11155111: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43", // Sepolia BTC/USD
} as const

const CHAINLINK_ABI = [
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const

export function useChainlinkPrice(pollMs = 30000) {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    let timer: any

    const fetchPrice = async () => {
      try {
        const chainId = await publicClient.getChainId()
        const feedAddress = CHAINLINK_FEEDS[chainId as keyof typeof CHAINLINK_FEEDS]

        if (!feedAddress) {
          throw new Error(`Chainlink feed not available for chain ${chainId}`)
        }

        const result = await publicClient.readContract({
          address: feedAddress,
          abi: CHAINLINK_ABI,
          functionName: "latestRoundData",
        })

        // Chainlink BTC/USD returns price with 8 decimals
        const priceUsd = Number(result[1]) / 1e8
        setPrice(priceUsd)
        setLastUpdated(new Date(Number(result[3]) * 1000))
        setError(null)
        setLoading(false)
      } catch (e: any) {
        setError(e?.message ?? "Failed to fetch Chainlink price")
        setLoading(false)
      }

      timer = setTimeout(fetchPrice, pollMs)
    }

    fetchPrice()
    return () => clearTimeout(timer)
  }, [pollMs])

  return { price, loading, error, lastUpdated }
}

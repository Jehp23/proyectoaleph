"use client"
import { addressUrl, txUrl } from "@/lib/explorer"

export function AddressLink({ address }: { address: `0x${string}` }) {
  return (
    <a
      href={addressUrl(address)}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:no-underline text-blue-600 dark:text-blue-400"
    >
      {address}
    </a>
  )
}

export function TxLink({ hash }: { hash: `0x${string}` }) {
  return (
    <a
      href={txUrl(hash)}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:no-underline text-blue-600 dark:text-blue-400"
    >
      {hash}
    </a>
  )
}

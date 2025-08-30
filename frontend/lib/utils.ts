import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatNumber(value: number | bigint, decimals: number = 2): string {
  const num = typeof value === 'bigint' ? Number(value) : value
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatCurrency(value: number | bigint, currency: string = 'USD'): string {
  const num = typeof value === 'bigint' ? Number(value) : value
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'ARS',
    minimumFractionDigits: 2,
  }).format(num)
}

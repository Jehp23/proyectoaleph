import { stringToBigInt, PrecisionError } from "@/lib/precision-math"

export class SecurityError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message)
    this.name = "SecurityError"
  }
}

export function validateAddress(address: string): `0x${string}` {
  if (!address || !address.startsWith("0x") || address.length !== 42) {
    throw new SecurityError("Dirección inválida", "INVALID_ADDRESS")
  }
  return address as `0x${string}`
}

// Amount validation with exact precision - no rounding
export function validateAmount(
  amount: string,
  decimals: number,
  maxAmount?: bigint,
  minAmount: bigint = BigInt(0),
): bigint {
  if (!amount || amount.trim() === "") {
    throw new SecurityError("Cantidad requerida", "AMOUNT_REQUIRED")
  }

  try {
    // Use high-precision conversion - never loses precision
    const amountWei = stringToBigInt(amount, decimals)

    if (amountWei <= minAmount) {
      throw new SecurityError("Cantidad muy pequeña", "AMOUNT_TOO_SMALL")
    }

    if (maxAmount && amountWei > maxAmount) {
      throw new SecurityError("Cantidad excede el límite", "AMOUNT_TOO_LARGE")
    }

    return amountWei
  } catch (error) {
    if (error instanceof SecurityError) throw error
    if (error instanceof PrecisionError) {
      throw new SecurityError(`Error de precisión: ${error.message}`, "PRECISION_ERROR")
    }
    throw new SecurityError("Error al procesar cantidad", "AMOUNT_PROCESSING_ERROR")
  }
}

// Safe mathematical operations using BigInt only
export function safeDivide(numerator: bigint, denominator: bigint, resultDecimals: number): bigint {
  if (denominator === BigInt(0)) {
    throw new SecurityError("División por cero", "DIVISION_BY_ZERO")
  }

  const multiplier = BigInt(10) ** BigInt(resultDecimals)
  return (numerator * multiplier) / denominator
}

export function safeMultiply(a: bigint, b: bigint, resultDecimals: number): bigint {
  // Check for overflow potential
  const MAX_SAFE_BIGINT = BigInt("0x1fffffffffffff")
  if (a > MAX_SAFE_BIGINT || b > MAX_SAFE_BIGINT) {
    throw new SecurityError("Overflow detectado", "ARITHMETIC_OVERFLOW")
  }

  const result = a * b
  const divisor = BigInt(10) ** BigInt(resultDecimals)
  return result / divisor
}

// Allowance optimization
export function calculateOptimalAllowance(
  currentAllowance: bigint,
  requiredAmount: bigint,
  buffer = 1.1, // 10% buffer
): { needsApproval: boolean; approvalAmount: bigint } {
  if (currentAllowance >= requiredAmount) {
    return { needsApproval: false, approvalAmount: BigInt(0) }
  }

  // Approve with buffer to reduce future approvals
  const bufferAmount = BigInt(Math.floor(Number(requiredAmount) * buffer))
  return { needsApproval: true, approvalAmount: bufferAmount }
}

// Transaction timeout protection
export function withTimeout<T>(promise: Promise<T>, timeoutMs = 30000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new SecurityError("Transacción expiró", "TRANSACTION_TIMEOUT")), timeoutMs),
    ),
  ])
}

/**
 * Risk Parameters for CauciónBTC Protocol
 *
 * These constants define the core risk parameters for the protocol.
 * They should match the values in the smart contracts.
 */

// Core Protocol Parameters
export const LTV_MAX = 0.6 // 60% maximum LTV
export const LIQ_THRESHOLD = 0.7 // 70% liquidation threshold
export const LIQ_BONUS = 0.1 // 10% liquidation bonus

// LTV Thresholds for UI (percentages)
export const LTV_MAX_PERCENT = 60 // 60% max LTV
export const LTV_DEFAULT = 50 // 50% default LTV
export const LTV_CONSERVATIVE = 50 // 50% conservative threshold
export const LTV_MODERATE = 65 // 65% moderate threshold

// Liquidation Parameters (percentages)
export const LIQUIDATION_THRESHOLD_PERCENT = 70 // 70% liquidation threshold
export const LIQUIDATION_BONUS_PERCENT = 10 // 10% liquidation bonus

// Health Factor Thresholds
export const HEALTH_FACTOR_MIN = 1.2 // 1.2 minimum health factor
export const HEALTH_FACTOR_HEALTHY = 1.5 // 1.5+ considered healthy
export const HEALTH_FACTOR_WARNING = 1.1 // 1.1-1.5 warning zone
export const HEALTH_FACTOR_INFINITE = 999 // Display value for infinite health factor

// Interest Rate (annual percentage)
export const ANNUAL_INTEREST_RATE = 8.5 // 8.5% annual interest rate

// UI Color Thresholds for LTV Slider
export const LTV_COLOR_THRESHOLDS = {
  GREEN_MAX: 50, // 0-50% green (conservative)
  YELLOW_MAX: 65, // 51-65% yellow (moderate)
  RED_MIN: 66, // 66%+ red (risky)
} as const

// Contract Constants (basis points for precision)
export const CONTRACT_CONSTANTS = {
  LTV_MAX_BP: 6000, // 60% in basis points
  LIQUIDATION_THRESHOLD_BP: 7000, // 70% in basis points
  LIQUIDATION_BONUS_BP: 1000, // 10% in basis points
  INTEREST_RATE_BP: 850, // 8.5% in basis points
} as const

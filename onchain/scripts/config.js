// scripts/config.js
export const DECIMALS = 18;

// Montos para demo local
export const SEED = {
  lender:   { loanAsset: "100000" }, // tokens del prestamista
  borrower: { collateral: "1000"   }, // colateral inicial del prestatario
};

export const FLOW = {
  collateralToDeposit: "500",
  principalToBorrow:   "200",
  repayAfterDays:      30,
  offchainInterestPct: 5, // sólo si tu contrato no calcula interés on-chain
};

export const SYNC_PATHS = {
  frontend: "../frontend/src/contracts",
  backend:  "../backend/contracts",
};

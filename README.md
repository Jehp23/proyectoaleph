# P2P Secured Loan dApp

## Overview

P2P Secured Loan is a decentralized application (dApp) that allows users to create peer-to-peer collateralized loans using smart contracts on Ethereum. The system is designed for educational and demo purposes, simulating a real loan flow with mock assets (stable and collateral) and running entirely in a local environment.

### Project Goals
- Simulate a P2P lending protocol with collateral, liquidations, and risk management.
- Integrate a modern fullstack stack: Solidity (onchain), FastAPI (backend), Next.js/React (frontend).
- Allow users to experience the full cycle: deposit collateral, take loans, monitor vault health, and simulate liquidations.

---

## Architecture

- **Onchain (Smart Contracts):**
  - Solidity contracts for mock tokens (ERC20), price oracle, and the main P2P loan contract.
  - Deployed and tested with Hardhat on a local blockchain.

- **Backend (API):**
  - FastAPI in Python exposes REST endpoints for configuration and price queries (mock or Chainlink).
  - Allows managing contract addresses and simulating oracle responses.

- **Frontend (UI):**
  - Next.js + React 18, with ethers.js v6 integration.
  - Intuitive interface to create vaults, take loans, monitor risks, and manage configuration.
  - Direct connection with MetaMask and the local Hardhat network.

---

## Main Modules

- `onchain/`  → Smart contracts and deployment scripts.
- `backend/`  → REST API for configuration and oracles.
- `frontend/` → User interface, hooks, and contract interaction logic.

---

## Usage Flow
1. The user connects their wallet (MetaMask) to the local network.
2. They can create a vault by depositing collateral (mock BTC).
3. Request a loan in a stablecoin (mock USDT), the contract manages LTV and vault health.
4. The user can monitor status, add collateral, repay debt, or simulate liquidations.
5. All price logic can be mock or integrated with Chainlink on testnet.

---

## Local Execution
For detailed installation, deployment, and usage instructions in a local environment, see [`README_LOCAL.md`](./README_LOCAL.md).

---

## Main Technologies
- Solidity 0.8.x (contracts)
- Hardhat 3.x (onchain dev environment)
- Python 3.10+ and FastAPI (backend)
- Next.js 13+/React 18, TypeScript, ethers.js v6 (frontend)

---

## Project Status
- Project in beta version, intended for testing and learning.
- Do not use on mainnet or with real funds.

---

**Developed in 2025. ALEPH HACKATHON**




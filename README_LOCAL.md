# P2P Secured Loan dApp (Web3 Fullstack)

This project is a fullstack decentralized application (dApp) that allows users to create P2P collateralized loans using Solidity smart contracts, a Next.js/React frontend, and a FastAPI (Python) backend. The entire environment is designed to run locally and simulate a real loan flow with mock assets (stable and collateral).

## What does this dApp do?
- Allows users to create vaults by depositing collateral (mock BTC) and take loans in a stablecoin (mock USDT).
- Smart contracts manage collateral, loans, and liquidation logic.
- The frontend lets you interact with contracts and view vault status.
- The backend exposes endpoints for configuration and price queries (mock or Chainlink).

---

## Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- MetaMask (to interact with the local blockchain)

---

## 1. Clone the repository
```bash
git clone <repo-url>
cd proyectoaleph-restructured
```

## 2. Install dependencies
### Onchain (contracts)
```bash
cd onchain
npm install
```
### Frontend (Next.js)
```bash
cd ../frontend
npm install
```
### Backend (FastAPI)
```bash
cd ../backend
python -m venv .venv
.venv/Scripts/activate  # Windows
pip install -r requirements.txt
```

---

## 3. Set up environment variables
### Backend (`backend/.env`)
Copy `.env.example` to `.env` and fill in the values if needed:
```
FRONT_ORIGIN=http://localhost:3000
LOCAL_RPC=http://127.0.0.1:8545
SEPOLIA_RPC=   # (optional, only if using testnet)
ADMIN_TOKEN=   # (optional)
```

### Frontend (`frontend/.env.local`)
Make sure it points to the local network:
```
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_P2P_ADDRESS=<P2PSecuredLoan address>
NEXT_PUBLIC_STABLE_ADDRESS=<MockUSDC address>
NEXT_PUBLIC_COLLATERAL_ADDRESS=<MockBTC address>
```

---

## 4. Start the local blockchain
From the `onchain` folder:
```bash
npm run node
```
This starts a Hardhat node at `http://127.0.0.1:8545` with test accounts.

---

## 5. Deploy the contracts
You can use Hardhat scripts or Remix. Example with Hardhat:
```bash
npm run compile
# Optionally: review and edit the deploy scripts if needed
node scripts/deploy.js
```
Save the addresses of the deployed contracts.

---

## 6. Start the backend
From the `backend` folder:
```bash
.venv/Scripts/activate  # Windows
uvicorn main:app --reload --port 4000
```

---

## 7. Start the frontend
From the `frontend` folder:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`

---

## 8. Connect MetaMask
- Add the Localhost 8545 network (chainId 31337) in MetaMask.
- Import one of the private keys that Hardhat prints when starting the node.

---

## 9. Done!
You can now create vaults, take loans, and simulate liquidations from the UI.

---

### Notes
- The entire flow is intended for local testing. Do not use real funds.
- You can modify the contracts, backend, or frontend as needed.
- The backend exposes useful endpoints at `http://localhost:4000`.

---

**Developed in 2025. ALEPH HACKATHON**

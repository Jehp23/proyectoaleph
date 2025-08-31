📌 Proyecto P2P Secured Loan (Web3 Fullstack)

Este proyecto es una dApp fullstack en Web3 que permite crear préstamos P2P colateralizados usando contratos inteligentes en Solidity, un frontend en Next.js, y un backend en Node.js/Express.

📂 Estructura del proyecto
.
├── frontend/         # Next.js app (UI de la dApp)
│   ├── app/          # Rutas Next 13+
│   ├── components/   # Componentes React
│   ├── hooks/        # Hooks personalizados (ej. useP2P)
│   ├── lib/          # Configuración ethers.js
│   └── onchain/abis/ # ABIs de contratos
│
├── backend/          # API en Node.js/Express
│   ├── src/          # Código fuente
│   ├── abis/         # ABIs de contratos para backend
│   └── .env          # Variables de entorno
│
└── onchain/          # Smart contracts (Hardhat)
    ├── contracts/    # Solidity
    ├── scripts/      # Scripts de deploy/test
    ├── artifacts/    # Compilados (ignorado en git)
    └── cache/        # Caché (ignorado en git)

🚀 Inicialización del proyecto
1) Clonar repo e instalar dependencias
git clone <repo-url>
cd <repo>

Frontend
cd frontend
npm install

Backend
cd backend
npm install

Onchain (Hardhat)
cd onchain
npm install

2) Variables de entorno
Frontend (frontend/.env.local)
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_P2P_ADDRESS=0x...        # Address del contrato P2PSecuredLoan
NEXT_PUBLIC_STABLE_ADDRESS=0x...     # Address del MockUSDC
NEXT_PUBLIC_COLLATERAL_ADDRESS=0x... # Address del MockBTC

Backend (backend/.env)
RPC_URL=http://127.0.0.1:8545
P2P_ADDRESS=0x...
STABLE_ADDRESS=0x...
COLLATERAL_ADDRESS=0x...
PRIVATE_KEY=0x...      # PK de una cuenta de testing del nodo Hardhat
PORT=4000

3) Levantar la blockchain local

Desde /onchain:

npm run node


Esto inicia un nodo Hardhat en http://127.0.0.1:8545 con 20 cuentas preconfiguradas con 10,000 ETH falsos.

Importar una de esas private keys en MetaMask → red Localhost 8545 (chainId 31337).

4) Deployar contratos

Podés usar Remix IDE o scripts de Hardhat.

Ejemplo con Remix:

Deployar MockERC20 (stable) → guardar address.

Deployar MockERC20 (collateral) → guardar address.

Deployar P2PSecuredLoan con:

stable = address del MockUSDC

collateral = address del MockBTC

borrower = dirección de MetaMask

loanAmount, interestAmount, collateralAmount en wei

fundingDeadline, repayDate en timestamps futuros

Actualizar addresses en .env.local y .env.

5) Levantar servicios
Backend
cd backend
npm run dev


API disponible en: http://localhost:4000

Frontend
cd frontend
npm run dev


App disponible en: http://localhost:3000

🔑 Scripts útiles
Frontend

npm run dev → arranca la app Next.js

npm run build → compila para producción

Backend

npm run dev → arranca servidor Express

Onchain

npm run node → arranca blockchain local (Hardhat)

npm run compile → compila contratos

npm run test → corre tests

📖 Requisitos previos

Node.js
 (v18+)

MetaMask

Hardhat

Remix IDE
 (opcional, para deploy manual)

🛠️ Tech Stack

Solidity (Smart contracts)

Hardhat (testing, deploy, blockchain local)

Next.js 13+ (frontend React)

Ethers.js v6 (interacción con contratos)

Express.js (backend API)

MetaMask (wallet)
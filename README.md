# Proyecto Aleph – Monorepo

## Estructura
```
frontend/   -> Next.js (v0). UI y conexión wallet.
onchain/    -> Hardhat. Contratos y deploy scripts.
backend/    -> FastAPI (opcional). API de lectura.
```

## Cómo correr
### Frontend
```bash
cd frontend
npm install
npm run dev
```

### On-chain
```bash
cd onchain
npm install
npm run compile
# deploy (editar .env / hardhat.config si hace falta)
npm run deploy:sepolia
# exporta ABIs y crea frontend/onchain/addresses.json
npm run export-abi
```

### Backend (opcional)
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # completar direcciones
uvicorn main:app --reload --port 8000
```

## Notas
- `frontend/onchain/addresses.json` trae placeholders: reemplazá con tus direcciones reales de Sepolia.
- Podés usar `P2PSecuredLoan` (1 prestamista ↔ 1 prestatario) o mantener `SecuredCrowdLoan` si preferís multi-lender.
- Los tokens faucet (`FaucetERC20`) permiten mintear en testnet para probar sin dinero real.

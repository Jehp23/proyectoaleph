# CauciónBTC Backend API

A minimal backend API for the CauciónBTC crypto collateralized loans dApp, built with Next.js App Router and TypeScript.

## 🏗️ Architecture

- **Framework**: Next.js 14 with App Router
- **Blockchain**: Ethereum (Sepolia testnet) via viem
- **Validation**: Zod for request/response validation
- **Storage**: Stateless (no database for MVP)
- **Security**: Same-origin CORS, admin-only endpoints

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment template:
\`\`\`bash
cp .env.example .env
\`\`\`

Fill in your configuration:
\`\`\`env
# Ethereum RPC Configuration
RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
CHAIN_ID=11155111

# Smart Contract Addresses (replace with deployed contracts)
VAULT_MANAGER_ADDRESS=0x1234567890123456789012345678901234567890
WBTC_ADDRESS=0x1234567890123456789012345678901234567890
USDT_ADDRESS=0x1234567890123456789012345678901234567890
ORACLE_ADDRESS=0x1234567890123456789012345678901234567890

# Admin Configuration (DEMO ONLY)
ADMIN_PRIVATE_KEY=0x1234567890123456789012345678901234567890123456789012345678901234
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Add Contract ABIs

Update the ABI files in `/lib/abi.ts`:
- Replace `ORACLE_ABI = []` with your Oracle contract ABI
- Replace `VAULT_MANAGER_ABI = []` with your VaultManager contract ABI

### 4. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

The API will be available at `http://localhost:3000/api/`

## 📡 API Endpoints

### Health Check
\`\`\`bash
# Check API and RPC connectivity
curl -s http://localhost:3000/api/health
\`\`\`

### Contract Addresses
\`\`\`bash
# Get configured contract addresses
curl -s http://localhost:3000/api/addresses
\`\`\`

### BTC Price Oracle
\`\`\`bash
# Get current BTC price from oracle
curl -s http://localhost:3000/api/price
\`\`\`

### Set Oracle Price (Admin Only)
\`\`\`bash
# Set BTC price (demo endpoint)
curl -s -X POST http://localhost:3000/api/oracle/set-price \
  -H "Content-Type: application/json" \
  -d '{"priceE8": 5800000000000}'
\`\`\`

### Individual Vault Data
\`\`\`bash
# Get vault details with risk metrics
curl -s http://localhost:3000/api/vaults/0
\`\`\`

### List Vaults
\`\`\`bash
# List all vaults with pagination
curl -s "http://localhost:3000/api/vaults?limit=10&offset=0"

# Filter by status
curl -s "http://localhost:3000/api/vaults?status=healthy"

# Filter by risk metrics
curl -s "http://localhost:3000/api/vaults?minHf=1.2&maxLtv=0.7"
\`\`\`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `RPC_URL` | Ethereum RPC endpoint | ✅ |
| `CHAIN_ID` | Network chain ID (11155111 for Sepolia) | ✅ |
| `VAULT_MANAGER_ADDRESS` | VaultManager contract address | ✅ |
| `WBTC_ADDRESS` | WBTC token contract address | ✅ |
| `USDT_ADDRESS` | USDT token contract address | ✅ |
| `ORACLE_ADDRESS` | Price oracle contract address | ✅ |
| `ADMIN_PRIVATE_KEY` | Admin private key (demo only) | ⚠️ |

### Risk Parameters

- **Liquidation Threshold**: 70% (configurable in `/lib/math.ts`)
- **Health Factor**: `(collateral * price * LT) / debt`
- **LTV**: `debt / (collateral * price)`

## 🧮 Math Calculations

The API automatically calculates key risk metrics:

- **LTV (Loan-to-Value)**: Ratio of debt to collateral value
- **Health Factor**: Liquidation safety margin (>1.0 = safe)
- **Liquidation Price**: BTC price at which vault becomes liquidatable

## 🔒 Security Notes

### ⚠️ Important Warnings

1. **Admin Endpoint**: The `/api/oracle/set-price` endpoint is for demo purposes only
2. **Private Keys**: Never use `ADMIN_PRIVATE_KEY` for user funds
3. **Production**: Remove admin endpoints before production deployment
4. **CORS**: Currently configured for same-origin only

### Best Practices

- Use environment variables for all sensitive configuration
- Validate all inputs with Zod schemas
- Handle blockchain errors gracefully
- Log security-relevant events

## 🧪 Testing

### Manual Testing Checklist

1. **Health Check**:
   \`\`\`bash
   curl -s localhost:3000/api/health
   # Expected: { "ok": true, "chainId": 11155111, "rpcOk": true }
   \`\`\`

2. **Contract Addresses**:
   \`\`\`bash
   curl -s localhost:3000/api/addresses
   # Expected: Contract addresses from environment
   \`\`\`

3. **Price Oracle**:
   \`\`\`bash
   curl -s localhost:3000/api/price
   # Expected: { "ok": true, "data": { "priceE8": ..., "priceUsd": ... } }
   \`\`\`

4. **Vault Data**:
   \`\`\`bash
   curl -s localhost:3000/api/vaults/0
   # Expected: Vault details with calculated metrics
   \`\`\`

### Error Scenarios

- Invalid vault ID → 400 Bad Request
- Non-existent vault → 404 Not Found
- RPC connection failure → 500 Internal Server Error
- Missing environment variables → Configuration warnings

## 📁 File Structure

\`\`\`
/app/api/
├── health/route.ts          # Health check endpoint
├── addresses/route.ts       # Contract addresses
├── price/route.ts          # BTC price oracle
├── oracle/
│   └── set-price/route.ts  # Admin price setting
└── vaults/
    ├── route.ts            # List vaults
    └── [id]/route.ts       # Individual vault data

/lib/
├── abi.ts                  # Contract ABI definitions
├── chain.ts               # Viem client configuration
├── cors.ts                # CORS helper functions
└── math.ts                # Risk calculation helpers
\`\`\`

## 🚧 TODO for Production

- [ ] Replace mock data with real contract calls
- [ ] Implement proper indexer for vault listing
- [ ] Add authentication for admin endpoints
- [ ] Set up monitoring and logging
- [ ] Add rate limiting
- [ ] Implement caching for price data
- [ ] Add comprehensive error tracking
- [ ] Remove demo/admin endpoints

## 🤝 Contributing

1. Ensure all TypeScript compiles: `npm run build`
2. Test all endpoints manually
3. Update documentation for new features
4. Follow security best practices

## 📄 License

This project is for demonstration purposes. Review security implications before production use.

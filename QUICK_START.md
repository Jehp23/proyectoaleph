# ⚡ CauciónBTC - Quick Start

## 🎯 Demo en 5 Minutos

### Pre-requisitos
- Node.js 18+
- Wallet con Sepolia ETH
- Infura/Alchemy API key

### 1. Setup (2 min)
```bash
# Clonar e instalar
git clone <repo>
cd proyectoaleph
npm install

# Configurar environment
cp env.example .env
# Editar .env con tus keys
```

### 2. Deploy (2 min)
```bash
# Compilar y deployar
npm run compile
npm run deploy:sepolia
npm run seed:sepolia

# Actualizar .env con contract addresses
```

### 3. Demo (1 min)
```bash
# Iniciar app
npm run dev

# Abrir http://localhost:3000/demo
# Conectar wallet → Crear vault → Simular crisis
```

## 🔧 Variables de Entorno Mínimas

```env
# Obligatorias
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=tu_project_id
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/TU_KEY
PRIVATE_KEY=tu_private_key

# Se completan automáticamente después del deploy
NEXT_PUBLIC_WBTC_ADDRESS=
NEXT_PUBLIC_MUSD_ADDRESS=
NEXT_PUBLIC_ORACLE_ADDRESS=
NEXT_PUBLIC_VAULT_MANAGER_ADDRESS=
```

## 🎬 Script de Demo

### Flujo Principal (3 min)
1. **Conectar** → MetaMask en Sepolia
2. **Dashboard** → Ver métricas del protocolo
3. **Crear Vault** → 0.05 WBTC, LTV 50%
4. **Simular Crisis** → Botón "-20%" precio BTC
5. **Liquidar** → Ejecutar liquidación parcial
6. **Recovery** → Reset precio y mostrar vault recuperado

### Puntos Clave para Destacar
- **Health Factor** cambia en tiempo real
- **Liquidación parcial** (50% máximo)
- **Bonificación** del 10% para liquidadores
- **UX simple** para operaciones complejas

## 🚨 Troubleshooting Rápido

**Error: "Network not detected"**
→ Verificar RPC URL en `.env`

**Error: "Insufficient funds"**
→ Obtener ETH de Sepolia faucet

**Error: "Contract not found"**
→ Verificar addresses en `.env`

**UI no actualiza****
→ Verificar conexión de wallet

## 📱 URLs Importantes

- **App**: http://localhost:3000
- **Demo**: http://localhost:3000/demo
- **Crear**: http://localhost:3000/new
- **Gestión**: http://localhost:3000/me

## 🎯 Métricas de Éxito

- ✅ Vault creado sin errores
- ✅ Health Factor < 1.0 después de simulación
- ✅ Liquidación ejecutada correctamente
- ✅ UI responsive y clara
- ✅ Demo completa en < 3 minutos

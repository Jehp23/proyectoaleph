# 🏦 CauciónBTC - MVP

**Caución cripto no-custodial: depositá BTC, tomá USDT**

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Powered by wagmi](https://img.shields.io/badge/Powered%20by-wagmi-purple?style=for-the-badge)](https://wagmi.sh/)
[![Deployed on Sepolia](https://img.shields.io/badge/Deployed%20on-Sepolia-blue?style=for-the-badge)](https://sepolia.etherscan.io/)

## 🎯 TL;DR

CauciónBTC es una dApp de cauciones cripto donde usuarios depositan WBTC como colateral y toman USDT para operar. MVP en Sepolia con oráculo mock para demo, mostrando LTV, Health Factor y precio de liquidación en tiempo real.

## ✨ Características

- **🔒 No-custodial**: Tu colateral, tus llaves
- **⚡ UX Simplificada**: Mono-producto BTC→USDT
- **📊 Tiempo Real**: Health Factor, LTV y precio de liquidación
- **🎮 Demo Interactiva**: Simulación de liquidaciones
- **🛡️ Seguridad**: ReentrancyGuard, SafeERC20, validaciones

## 🏗️ Arquitectura

### Smart Contracts
- **VaultManager.sol**: Lógica principal de vaults
- **MockOracle.sol**: Oráculo con simulación de precios
- **MockERC20.sol**: Tokens de prueba (WBTC, mUSD)

### Frontend
- **Next.js 15** + **React 19** + **TypeScript**
- **wagmi** + **viem** + **RainbowKit**
- **Tailwind CSS** + **Radix UI**
- **Zustand** para estado global

### Parámetros del Protocolo
```
Max LTV: 60%
Liquidation Threshold: 70%
APR: 12%
Liquidation Bonus: 10%
```

## 🚀 Quick Start

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Environment
```bash
cp env.example .env
# Editar .env con tus keys
```

### 3. Deploy Contratos
```bash
npm run deploy:sepolia
npm run seed:sepolia
```

### 4. Iniciar Aplicación
```bash
npm run dev
```

## 🎬 Demo Script (3-4 min)

1. **Conectar wallet** → Sepolia testnet
2. **Crear vault** → 0.05 WBTC, LTV 50%
3. **Simular crisis** → Botón "-20%" precio
4. **Liquidar** → Demostrar liquidación parcial
5. **Recovery** → Reset precio y cierre

## 📁 Estructura del Proyecto

```
├── contracts/           # Smart contracts
│   ├── VaultManager.sol
│   ├── MockOracle.sol
│   └── MockERC20.sol
├── scripts/            # Deploy y utilidades
├── test/              # Tests de contratos
├── app/               # Next.js App Router
├── components/        # Componentes React
├── hooks/             # Hooks wagmi personalizados
└── lib/               # Utilidades y configuración
```

## 🔧 Comandos Disponibles

### Desarrollo
```bash
npm run dev          # Desarrollo local
npm run build        # Build producción
npm run lint         # Linter
```

### Blockchain
```bash
npm run compile      # Compilar contratos
npm run test         # Tests
npm run deploy:sepolia    # Deploy Sepolia
npm run seed:sepolia      # Datos demo
npm run simulate-drop     # Simular caída precio
```

## 🛡️ Seguridad

### ✅ Implementado
- ReentrancyGuard en todas las funciones críticas
- SafeERC20 para transferencias seguras
- Validaciones de Health Factor y LTV
- Liquidación limitada al 50% por transacción
- Input validation completa

### ⚠️ Riesgos Conocidos (MVP)
- Oracle centralizado (solo demo)
- Sin keeper bots automáticos
- Código no auditado

## 📊 Métricas de Demo

- **Flujo end-to-end** sin errores
- **HF/LTV** actualizan en vivo
- **Simulación de crisis** dispara liquidaciones
- **Pitch < 3 min** con UX clara

## 🤝 Contribuir

1. Fork el repo
2. Crear branch feature
3. Commit cambios
4. Push y crear PR

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 🔗 Links Útiles

- **Demo Live**: http://localhost:3000/demo
- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Security Checklist**: [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)

---

**⚠️ Disclaimer**: MVP para demostración. NO usar en mainnet sin auditoría completa.

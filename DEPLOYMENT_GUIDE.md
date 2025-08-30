# 🚀 CauciónBTC - Guía de Deployment

## **Configuración Inicial**

### 1. **Instalar Dependencias**
\`\`\`bash
npm install
\`\`\`

### 2. **Configurar Variables de Entorno**
Copia `env.example` a `.env` y configura:

\`\`\`env
# Blockchain Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Contract Addresses (se completarán después del deploy)
NEXT_PUBLIC_WBTC_ADDRESS=
NEXT_PUBLIC_MUSD_ADDRESS=
NEXT_PUBLIC_ORACLE_ADDRESS=
NEXT_PUBLIC_VAULT_MANAGER_ADDRESS=

# Hardhat Configuration
PRIVATE_KEY=your_private_key_for_deployment
ETHERSCAN_API_KEY=your_etherscan_api_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
\`\`\`

## **Deployment en Sepolia**

### 3. **Compilar Contratos**
\`\`\`bash
npm run compile
\`\`\`

### 4. **Ejecutar Tests**
\`\`\`bash
npm run test
\`\`\`

### 5. **Deploy en Sepolia**
\`\`\`bash
npm run deploy:sepolia
\`\`\`

Este comando:
- Deploya MockERC20 (WBTC y mUSD)
- Deploya MockOracle
- Deploya VaultManager
- Configura precio inicial de BTC ($45,000)
- Guarda addresses en `deployments/sepolia.json`

### 6. **Actualizar Variables de Entorno**
Después del deploy, actualiza `.env` con las addresses de los contratos:

\`\`\`bash
# Ejemplo de output del deploy
NEXT_PUBLIC_WBTC_ADDRESS=0x1234...
NEXT_PUBLIC_MUSD_ADDRESS=0x5678...
NEXT_PUBLIC_ORACLE_ADDRESS=0x9abc...
NEXT_PUBLIC_VAULT_MANAGER_ADDRESS=0xdef0...
\`\`\`

### 7. **Seed con Datos de Demo**
\`\`\`bash
npm run seed:sepolia
\`\`\`

Esto crea:
- 2 vaults de demo con diferentes niveles de riesgo
- Tokens de prueba para usuarios
- Configuración inicial del protocolo

## **Desarrollo Local**

### 8. **Iniciar Aplicación**
\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en `http://localhost:3000`

## **Demo Script**

### 9. **Preparación de Demo (5 min)**

1. **Verificar Deployment**
   \`\`\`bash
   # Verificar que los contratos estén deployados
   cat deployments/sepolia.json
   \`\`\`

2. **Configurar Wallets de Demo**
   - Wallet Principal: Para crear vaults
   - Wallet Liquidador: Para ejecutar liquidaciones
   - Ambas con ETH de Sepolia y tokens de prueba

3. **Verificar Estado Inicial**
   - Abrir `/demo` en la aplicación
   - Conectar wallet principal
   - Verificar balances de WBTC y mUSD

### 10. **Flujo de Demo (3-4 min)**

**Paso 1: Mostrar Estado Inicial**
- Dashboard con métricas del protocolo
- Vaults existentes (saludables)
- Precio BTC actual: $45,000

**Paso 2: Crear Vault (30 seg)**
- Ir a `/new`
- Depositar 0.05 WBTC
- Configurar LTV al 50%
- Confirmar creación

**Paso 3: Simular Crisis (1 min)**
- Ir a `/demo`
- Mostrar vault saludable (HF ~1.4)
- Simular caída -20% con botón
- Observar HF crítico (< 1.0)

**Paso 4: Liquidación (1 min)**
- Cambiar a wallet liquidador
- Ejecutar liquidación parcial
- Mostrar colateral recuperado
- Explicar bonificación del 10%

**Paso 5: Recovery (30 seg)**
- Reset precio con botón
- Mostrar vault recuperado
- Demostrar repago y cierre

## **Comandos Útiles**

### Desarrollo
\`\`\`bash
npm run dev          # Iniciar desarrollo
npm run build        # Build para producción
npm run lint         # Linter
\`\`\`

### Blockchain
\`\`\`bash
npm run compile      # Compilar contratos
npm run test         # Ejecutar tests
npm run deploy:sepolia    # Deploy en Sepolia
npm run seed:sepolia      # Seed datos demo
npm run simulate-drop     # Simular caída precio
\`\`\`

### Simulación de Precios
\`\`\`bash
# Simular caída específica
npx hardhat run scripts/simulate-drop.js --network sepolia 15
# (15 = 15% de caída)
\`\`\`

## **Troubleshooting**

### Problemas Comunes

**1. Error de RPC**
\`\`\`
Error: could not detect network
\`\`\`
**Solución:** Verificar SEPOLIA_RPC_URL en `.env`

**2. Error de Gas**
\`\`\`
Error: insufficient funds for intrinsic transaction cost
\`\`\`
**Solución:** Obtener ETH de Sepolia faucet

**3. Error de Allowance**
\`\`\`
Error: ERC20: insufficient allowance
\`\`\`
**Solución:** La UI maneja esto automáticamente, verificar conexión de wallet

**4. Contratos no encontrados**
\`\`\`
Error: call revert exception
\`\`\`
**Solución:** Verificar addresses en `.env` y que los contratos estén deployados

### Reset Completo
\`\`\`bash
# Limpiar y re-deployar todo
rm -rf deployments/
npm run deploy:sepolia
npm run seed:sepolia
# Actualizar .env con nuevas addresses
\`\`\`

## **Verificación Final**

### Checklist Pre-Demo ✅

- [ ] Contratos deployados en Sepolia
- [ ] Variables de entorno configuradas
- [ ] Datos de demo cargados
- [ ] Aplicación corriendo en localhost:3000
- [ ] Wallets con fondos de prueba
- [ ] Conexión a Sepolia funcionando
- [ ] Simulación de precios operativa

### URLs Importantes

- **Aplicación:** http://localhost:3000
- **Demo:** http://localhost:3000/demo
- **Crear Vault:** http://localhost:3000/new
- **Gestionar:** http://localhost:3000/me

### Recursos Externos

- **Sepolia Faucet:** https://sepoliafaucet.com/
- **Infura:** https://infura.io/
- **WalletConnect:** https://cloud.walletconnect.com/

---

**🎯 ¡Tu MVP de CauciónBTC está listo para la demo!**

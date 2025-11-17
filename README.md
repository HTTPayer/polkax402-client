# Polkax402

**Polkax402** es un servidor Express que expone endpoints protegidos con el protocolo **X402 Payment Required**, combinando:

- 🔐 **X402 Middleware** - Sistema de pagos HTTP 402 con verificación on-chain
- 🔍 **Firecrawl** - Búsqueda y scraping de noticias vía HTTPayer relay usando x402-fetch
- 🤖 **OpenAI LLM** - Procesamiento de contenido y generación de resúmenes en Markdown
- 📊 **API RESTful** - Endpoints documentados con Swagger/OpenAPI

## 🚀 Características Principales

### X402 Payment Protocol
- ✅ Middleware funcional con validación de pagos
- ✅ Soporte para precios fijos y dinámicos
- ✅ Verificación con facilitador on-chain
- ✅ Validación de firma, timestamp y amount
- ✅ Modo demo para testing sin pagos reales

### Endpoints
- `/api/polka-news` - Agregación de noticias Polkadot (X402 protegido)
- `/api/polka-news/demo` - Modo demo sin pago real
- `/api/example/protected` - Ejemplo con precios dinámicos
- `/health` - Health check
- `/docs` - Documentación interactiva Swagger

## 📋 Requisitos

### Variables de Entorno

Crea `.env` a partir de `.env.example`:

```bash
# Servidor
PORT=3000

# Para Firecrawl Client (x402-fetch - paga vía HTTPayer)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY    # Wallet en Base con USDC
FIRECRAWL_TOKEN=your_firecrawl_token
HTTPAYER_RELAY_URL=https://api.httpayer.com/relay

# Para OpenAI LLM
OPENAI_API_KEY=sk-...

# Para X402 Middleware (recibe pagos)
polkax402polkax402
RECIPIENT_ADDRESS=5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
PRICE_PER_REQUEST=10000000000
CONTRACT_ADDRESS=5CR7oWebzRjmYrACqiYhh4G7vX4yZnCxT4ZaucYU9mCNvXGM
FACILITATOR_URL=https://facilitator.polkax402.dpdns.org/settle
```

### Dependencias

```bash
npm install
```

## 🛠️ Uso

### Desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000` con salida:

```
🚀 Polkax402 Server - LIVE

📡 Listening:     http://localhost:3000
👤 Recipient:     5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
💰 Price/request: 10000000000 (smallest unit)
🔄 Facilitator:   https://facilitator.polkax402.dpdns.org/settle

💡 Endpoints:
   GET  /health                        - Health check (free)
   GET  /docs                          - API documentation (free)
   GET  /api/polka-news                - Polkadot news (X402 protected)
   GET  /api/polka-news/demo           - Polkadot news (demo mode)
   GET  /api/example/protected         - Example (X402 protected)
```

### Producción

```bash
npm run build
npm start
```

## 📝 Ejemplos de Uso

### 1. Health Check (Gratis)

```bash
curl http://localhost:3000/health
```

### 2. Polka News - Modo Demo (Testing sin pago)

```bash
curl "http://localhost:3000/api/polka-news/demo?query=governance&paid=true"
```

### 3. Polka News - X402 Protegido (Requiere pago)

```bash
# Sin pago - Obtener instrucciones de pago
curl -i http://localhost:3000/api/polka-news?query=parachains

# Con pago válido
curl -i \
  -H 'x-payment: {"from":"...","to":"...","amount":"10000000000",...}' \
  -H "x-payment-signature: 0x..." \
  "http://localhost:3000/api/polka-news?query=parachains"
```

### 4. Cliente JavaScript con x402-fetch

```typescript
import { createX402Fetch } from 'x402-fetch';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount('0xYOUR_PRIVATE_KEY');
const x402fetch = createX402Fetch({
  wallet: account,
  network: 'polkax402',
});

// Pago automático si es necesario
const response = await x402fetch(
  'http://localhost:3000/api/polka-news?query=governance'
);
const data = await response.json();
console.log(data);
```

## 📚 Documentación

- **[X402_MIDDLEWARE_GUIDE.md](./X402_MIDDLEWARE_GUIDE.md)** - Guía completa del middleware X402
- **[EXAMPLES.md](./EXAMPLES.md)** - Ejemplos detallados de uso de todos los endpoints
- **http://localhost:3000/docs** - Documentación interactiva Swagger/OpenAPI

## 🏗️ Arquitectura

### Flujo de Pago X402

```
Cliente → Request sin pago
       ← 402 Payment Required + Instrucciones
       
Cliente → Request con headers de pago
          x-payment: {...}
          x-payment-signature: 0x...
       
Servidor → Valida pago
        → Verifica con facilitador (on-chain)
        → Procesa request
        ← 200 OK + Data + Payment info
```

### Estructura del Proyecto

```
src/
├── index.ts                    # Servidor principal
├── middleware/
│   └── x402Middleware.ts      # Middleware X402 funcional
├── routes/
│   └── polkaNewsRoute.ts      # Rutas de Polka News
├── services/
│   ├── firecrawlClient.ts     # Cliente Firecrawl + x402-fetch
│   └── llmProcessor.ts        # Procesador OpenAI
└── utils/
    └── types.ts               # Tipos TypeScript
```

## 🔑 Conceptos Clave

### Dos Wallets Diferentes

1. **PRIVATE_KEY** (Cliente - Paga)
   - Wallet que paga a Firecrawl vía HTTPayer
   - Requiere USDC en Base
   - Usado por `firecrawlClient.ts`

2. **RECIPIENT_ADDRESS** (Servidor - Recibe)
   - Wallet que recibe pagos de clientes del API
   - Configurado en X402 middleware
   - Red configurable (polkax402, base, etc.)

### Precios

- **Firecrawl**: ~0.01 USD por request (via HTTPayer wallet endpoint)
- **Tu API**: Configurable via `PRICE_PER_REQUEST` (default: 10000000000 = 0.01 tokens)

### Modos de Operación

1. **Demo Mode** (`/api/polka-news/demo`)
   - Testing sin pagos reales
   - Usar `?paid=true` o header `x402-paid: true`

2. **Production Mode** (`/api/polka-news`)
   - X402 middleware completo
   - Requiere pagos válidos
   - Verificación on-chain con facilitador

## 🛡️ Seguridad

- ✅ Validación de firma de pagos
- ✅ Verificación de timestamp (max 5 min)
- ✅ Confirmación on-chain vía facilitador
- ✅ Validación de recipient, network y asset
- ✅ Validación de monto mínimo

## 🐛 Troubleshooting

### Errores Comunes

**402 Payment Required**
- Falta header de pago o es inválido
- Usa modo demo para testing

**503 Service Unavailable**
- Facilitador no está disponible
- Verifica `FACILITATOR_URL`

**Payment validation failed**
- Verifica recipient, network, asset y amount
- Asegúrate que el timestamp no esté expirado

Ver [EXAMPLES.md](./EXAMPLES.md) para más detalles sobre errores.

## 📦 Scripts NPM

```bash
npm run dev     # Desarrollo con hot reload
npm run build   # Compilar TypeScript
npm start       # Producción (requiere build)
```

## 🤝 Contribuir

Este es un proyecto de ejemplo que demuestra:
- Implementación completa del protocolo X402
- Integración de múltiples servicios de pago (HTTPayer, facilitador)
- Arquitectura de microservicios con Express + TypeScript

## 📄 Licencia

MIT

## 🔗 Enlaces Útiles

- [X402 Protocol](https://github.com/polkadot-api/x402)
- [HTTPayer](https://httpayer.com)
- [Firecrawl](https://firecrawl.dev)
- [x402-fetch](https://www.npmjs.com/package/x402-fetch)

# Polkax402 - Ejemplos de Uso

## Endpoints Disponibles

### 1. Health Check (Gratis)

```bash
curl http://localhost:3000/health
```

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-16T21:34:32.000Z",
  "service": "Polkax402 API",
  "version": "0.1.0",
  "network": "dotx402"
}
```

---

### 2. Root Endpoint (Gratis)

```bash
curl http://localhost:3000/
```

**Respuesta:**
```json
{
  "ok": true,
  "service": "polkax402",
  "version": "0.1.0",
  "endpoints": {
    "health": "GET /health",
    "docs": "GET /docs",
    "polkaNews": "GET /api/polka-news (X402 protected)",
    "polkaNewsDemo": "GET /api/polka-news/demo (demo mode)",
    "exampleProtected": "GET /api/example/protected (X402 protected)"
  }
}
```

---

### 3. Polka News Demo (Modo Demo - Sin Pago Real)

Para testing rápido sin configurar pagos:

```bash
# Opción 1: Query parameter
curl "http://localhost:3000/api/polka-news/demo?query=governance&paid=true"

# Opción 2: Header
curl -H "x402-paid: true" \
  "http://localhost:3000/api/polka-news/demo?query=governance"
```

**Respuesta:**
```json
{
  "provider": "polkax402",
  "version": "v0.1.0",
  "note": "Demo endpoint - use /polka-news for production with real X402 payments",
  "data": {
    "as_of": "2025-11-16T21:35:00Z",
    "query_used": "governance",
    "summary_markdown": "...",
    "bullets": ["...", "..."],
    "sources": [
      {
        "title": "Example Article",
        "url": "https://example.com",
        "note": "Recent governance proposal"
      }
    ]
  }
}
```

---

### 4. Polka News (X402 Protegido - Requiere Pago)

#### Sin pago - Obtener instrucciones

```bash
curl -i http://localhost:3000/api/polka-news?query=parachains
```

**Respuesta 402:**
```http
HTTP/1.1 402 Payment Required
Content-Type: application/json

{
  "x402Version": 1,
  "accepts": [
    {
      "scheme": "exact",
      "network": "dotx402",
      "payTo": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      "asset": "5CR7oWebzRjmYrACqiYhh4G7vX4yZnCxT4ZaucYU9mCNvXGM",
      "maxAmountRequired": "10000000000",
      "resource": "/api/polka-news?query=parachains",
      "description": "Polkadot News aggregation and AI-powered summary service",
      "mimeType": "application/json",
      "maxTimeoutSeconds": 300
    }
  ]
}
```

#### Con pago válido

```bash
curl -i \
  -H "Content-Type: application/json" \
  -H 'x-payment: {"from":"5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY","to":"5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY","amount":"10000000000","asset":"5CR7oWebzRjmYrACqiYhh4G7vX4yZnCxT4ZaucYU9mCNvXGM","network":"dotx402","nonce":"unique-nonce-123","timestamp":1700000000000,"signature":"0xdeadbeef"}' \
  -H "x-payment-signature: 0xsignature_here" \
  "http://localhost:3000/api/polka-news?query=parachains"
```

**Respuesta 200:**
```json
{
  "provider": "polkax402",
  "version": "v0.1.0",
  "data": {
    "as_of": "2025-11-16T21:35:00Z",
    "query_used": "parachains",
    "summary_markdown": "...",
    "bullets": ["...", "..."],
    "sources": [...]
  },
  "payment": {
    "from": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    "to": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    "amount": "10000000000",
    "asset": "5CR7oWebzRjmYrACqiYhh4G7vX4yZnCxT4ZaucYU9mCNvXGM",
    "confirmed": true,
    "blockHash": "0x...",
    "extrinsicHash": "0x...",
    "verifiedAt": 1700000000000
  }
}
```

---

### 5. Ejemplo con Precios Dinámicos

```bash
# Sin pago - Verificar precio para complexity=3
curl -i "http://localhost:3000/api/example/protected?complexity=3"
```

**Respuesta 402:**
```json
{
  "x402Version": 1,
  "accepts": [
    {
      "scheme": "exact",
      "network": "dotx402",
      "payTo": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      "asset": "5CR7oWebzRjmYrACqiYhh4G7vX4yZnCxT4ZaucYU9mCNvXGM",
      "maxAmountRequired": "30000000000",
      "resource": "/api/example/protected?complexity=3",
      "description": "Example protected endpoint with dynamic pricing",
      "mimeType": "application/json",
      "maxTimeoutSeconds": 300
    }
  ]
}
```

Nota: El precio es `3 × 10000000000 = 30000000000`

---

## Uso con x402-fetch (Cliente JavaScript/TypeScript)

### Instalación

```bash
npm install x402-fetch viem
```

### Ejemplo Básico

```typescript
import { createX402Fetch } from 'x402-fetch';
import { privateKeyToAccount } from 'viem/accounts';

// Tu wallet que pagará
const account = privateKeyToAccount('0xYOUR_PRIVATE_KEY');

// Crear fetch con soporte X402
const x402fetch = createX402Fetch({
  wallet: account,
  network: 'dotx402',
});

// Hacer request - pago automático si es necesario
async function fetchPolkaNews() {
  try {
    const response = await x402fetch(
      'http://localhost:3000/api/polka-news?query=governance'
    );
    
    const data = await response.json();
    console.log('News:', data);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchPolkaNews();
```

### Ejemplo con Precios Dinámicos

```typescript
async function fetchWithComplexity(complexity: number) {
  const response = await x402fetch(
    `http://localhost:3000/api/example/protected?complexity=${complexity}`
  );
  
  const data = await response.json();
  console.log(`Data (complexity ${complexity}):`, data);
  console.log(`Paid: ${data.payment.amount}`);
}

// Diferentes niveles de complejidad = diferentes precios
await fetchWithComplexity(1); // Precio base
await fetchWithComplexity(5); // 5x precio base
```

---

## Errores Comunes

### 402 Payment Required
```json
{
  "x402Version": 1,
  "accepts": [...]
}
```
**Solución:** Incluir headers de pago válidos o usar modo demo.

### 400 Bad Request
```json
{
  "error": "Invalid payment header format",
  "message": "Payment header must be valid JSON"
}
```
**Solución:** Verificar que el header `x-payment` sea JSON válido.

### 402 Payment Validation Failed
```json
{
  "error": "Payment validation failed",
  "message": "Payment sent to wrong recipient. Expected: 5Grw..., Got: 5Abc...",
  "paymentReceived": {...}
}
```
**Solución:** Verificar que el pago tenga:
- Recipient correcto (`to`)
- Network correcto (`network`)
- Asset correcto (`asset`)
- Monto suficiente (`amount`)

### 402 Payment Expired
```json
{
  "error": "Payment expired",
  "message": "Payment is too old. Max age: 300000ms, actual: 400000ms"
}
```
**Solución:** Generar un nuevo pago con timestamp reciente.

### 503 Service Unavailable
```json
{
  "error": "Facilitator unavailable",
  "message": "Unable to verify payment with facilitator"
}
```
**Solución:** 
1. Verificar que el facilitador esté corriendo
2. Verificar `FACILITATOR_URL` en `.env`
3. Para testing, usar endpoints demo

---

## Query Parameters

### `/api/polka-news` y `/api/polka-news/demo`

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `query` o `q` | string | "Latest Polkadot, Kusama and parachain ecosystem news" | Query de búsqueda |
| `limit` | number | 5 | Número de resultados (max: 10) |
| `paid` | string | - | Solo para demo: "true" para bypass de pago |

**Ejemplos:**
```bash
# Búsqueda personalizada
curl "http://localhost:3000/api/polka-news/demo?query=staking&limit=3&paid=true"

# Usando 'q' en lugar de 'query'
curl "http://localhost:3000/api/polka-news/demo?q=governance&paid=true"
```

### `/api/example/protected`

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `complexity` | number | 1 | Multiplicador de precio |

**Ejemplo:**
```bash
curl "http://localhost:3000/api/example/protected?complexity=2"
# Precio = 2 × PRICE_PER_REQUEST
```

---

## Testing Local

### 1. Iniciar el servidor

```bash
npm run dev
```

### 2. Verificar salud

```bash
curl http://localhost:3000/health
```

### 3. Probar endpoint demo

```bash
curl "http://localhost:3000/api/polka-news/demo?query=validators&paid=true"
```

### 4. Ver documentación

Abre en tu navegador: http://localhost:3000/docs

---

## Variables de Entorno Requeridas

```bash
# Servidor
PORT=3000

# Para Firecrawl Client (x402-fetch)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
FIRECRAWL_TOKEN=your_firecrawl_token

# Para OpenAI LLM
OPENAI_API_KEY=sk-...

# Para X402 Middleware
NETWORK=dotx402
RECIPIENT_ADDRESS=5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
PRICE_PER_REQUEST=10000000000
CONTRACT_ADDRESS=5CR7oWebzRjmYrACqiYhh4G7vX4yZnCxT4ZaucYU9mCNvXGM
FACILITATOR_URL=http://localhost:4000/settle
```

---

## Scripts NPM

```bash
# Desarrollo (con hot reload)
npm run dev

# Compilar TypeScript
npm run build

# Producción
npm start
```

---

## Más Información

- [X402 Middleware Guide](./X402_MIDDLEWARE_GUIDE.md)
- [API Documentation](http://localhost:3000/docs)
- [README](./README.md)

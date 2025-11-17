# X402 Middleware Guide

## Overview

El middleware X402 implementa el protocolo de pago HTTP 402 (Payment Required) para proteger endpoints de tu API. Los clientes deben incluir información de pago válida en los headers para acceder a los recursos protegidos.

## Características

- ✅ Validación de pagos en tiempo real
- ✅ Verificación con facilitador on-chain
- ✅ Soporte para precios dinámicos
- ✅ Validación de firma y timestamp
- ✅ Configuración flexible por endpoint
- ✅ Información detallada de pago en respuesta

## Configuración Rápida

### 1. Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
# Network (polkax402, base, ethereum, polygon, etc.)
polkax402polkax402

# Tu dirección de recepción de pagos
RECIPIENT_ADDRESS=5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY

# Precio por request en unidades mínimas
PRICE_PER_REQUEST=10000000000

# Dirección del contrato del asset/token
CONTRACT_ADDRESS=5CR7oWebzRjmYrACqiYhh4G7vX4yZnCxT4ZaucYU9mCNvXGM

# URL del facilitador para settlement on-chain
FACILITATOR_URL=https://facilitator.polkax402.dpdns.org/settle
```

### 2. Uso Básico

```typescript
import { createX402Middleware } from './middleware/x402Middleware';

// Crear middleware con precio fijo
const x402 = createX402Middleware({
  network: process.env.NETWORK || 'polkax402',
  recipientAddress: process.env.RECIPIENT_ADDRESS!,
  pricePerRequest: '10000000000', // Precio fijo
  asset: process.env.CONTRACT_ADDRESS!,
  facilitatorUrl: process.env.FACILITATOR_URL!,
  requireFacilitatorConfirmation: true,
  maxPaymentAge: 300000, // 5 minutos
  resourceDescription: 'Premium API access',
  responseMimeType: 'application/json',
});

// Aplicar a un endpoint
app.get('/api/premium', x402, (req, res) => {
  const x402Req = req as X402Request;
  
  res.json({
    data: 'Premium content',
    payment: x402Req.x402Payment,
  });
});
```

### 3. Precios Dinámicos

```typescript
// Precio basado en parámetros de query
const dynamicX402 = createX402Middleware({
  network: process.env.NETWORK || 'polkax402',
  recipientAddress: process.env.RECIPIENT_ADDRESS!,
  pricePerRequest: (req) => {
    const complexity = parseInt(req.query.complexity as string) || 1;
    const basePrice = parseInt(process.env.PRICE_PER_REQUEST || '10000000000');
    return String(basePrice * complexity);
  },
  asset: process.env.CONTRACT_ADDRESS!,
  facilitatorUrl: process.env.FACILITATOR_URL!,
  requireFacilitatorConfirmation: true,
  resourceDescription: 'Compute service with dynamic pricing',
});

app.get('/api/compute', dynamicX402, (req, res) => {
  // Tu lógica aquí
});
```

## Flujo de Pago

### Request del Cliente

El cliente debe incluir estos headers:

```
x-payment: <JSON del payload de pago>
x-payment-signature: <Firma del pago>
```

**Ejemplo de payload:**

```json
{
  "from": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "to": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
  "amount": "10000000000",
  "asset": "5CR7oWebzRjmYrACqiYhh4G7vX4yZnCxT4ZaucYU9mCNvXGM",
  "network": "polkax402",
  "nonce": "unique-nonce-here",
  "timestamp": 1700000000000,
  "signature": "0x..."
}
```

### Respuesta 402 (Sin Pago)

Si no hay pago o es inválido, el servidor responde con 402:

```json
{
  "x402Version": 1,
  "accepts": [
    {
      "scheme": "exact",
      "network": "polkax402",
      "payTo": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      "asset": "5CR7oWebzRjmYrACqiYhh4G7vX4yZnCxT4ZaucYU9mCNvXGM",
      "maxAmountRequired": "10000000000",
      "resource": "/api/polka-news",
      "description": "Polkadot News aggregation service",
      "mimeType": "application/json",
      "maxTimeoutSeconds": 300
    }
  ]
}
```

### Respuesta 200 (Pago Exitoso)

```json
{
  "data": { ... },
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

## Validaciones del Middleware

El middleware valida:

1. **Headers requeridos**: `x-payment` y `x-payment-signature`
2. **Formato JSON**: El payload debe ser JSON válido
3. **Recipient address**: El pago debe ir a la dirección correcta
4. **Network**: Debe coincidir con la red configurada
5. **Asset**: Debe ser el token/asset correcto
6. **Amount**: Debe ser >= al precio requerido
7. **Timestamp**: No debe ser muy antiguo (max 5 min por default)
8. **Facilitator**: Verifica on-chain si está configurado

## Configuración Avanzada

### X402MiddlewareConfig

```typescript
interface X402MiddlewareConfig {
  // Red blockchain (polkax402, base, ethereum, etc.)
  network: string;
  
  // Tu dirección para recibir pagos
  recipientAddress: string;
  
  // Precio: fijo (string) o dinámico (función)
  pricePerRequest: string | ((req: Request) => string);
  
  // Dirección del contrato del asset
  asset: string;
  
  // URL del facilitador para verificación on-chain
  facilitatorUrl: string;
  
  // Requerir confirmación del facilitador
  requireFacilitatorConfirmation: boolean;
  
  // Edad máxima del pago en ms (default: 300000 = 5 min)
  maxPaymentAge?: number;
  
  // Descripción del recurso
  resourceDescription?: string;
  
  // MIME type de la respuesta
  responseMimeType?: string;
}
```

### Información de Pago en Request

Después de validar el pago, el middleware agrega la info al request:

```typescript
import { X402Request } from './utils/types';

app.get('/api/protected', x402, (req, res) => {
  const x402Req = req as X402Request;
  
  console.log(x402Req.x402Payment);
  // {
  //   payload: { from, to, amount, asset, ... },
  //   confirmedOnChain: true,
  //   facilitatorResponse: { blockHash, extrinsicHash, ... },
  //   verifiedAt: 1700000000000
  // }
});
```

## Endpoints de Ejemplo

El proyecto incluye varios ejemplos:

### 1. Health Check (Gratis)
```
GET /health
```

### 2. Polka News (X402 Protegido)
```
GET /api/polka-news?query=governance
Headers:
  x-payment: {...}
  x-payment-signature: 0x...
```

### 3. Polka News Demo (Sin pago)
```
GET /api/polka-news/demo?query=governance&paid=true
```

### 4. Ejemplo con Precios Dinámicos
```
GET /api/example/protected?complexity=3
Headers:
  x-payment: {...}
  x-payment-signature: 0x...
```

## Testing

### Sin Facilitador (Development)

Para testing sin facilitador, usa el placeholder middleware:

```typescript
import { placeholderX402Middleware } from './middleware/x402Middleware';

app.get('/api/test', placeholderX402Middleware, (req, res) => {
  res.json({ message: 'Test endpoint' });
});
```

Accede con:
```
GET /api/test?paid=true
// o
GET /api/test
Headers: x402-paid: true
```

### Con Facilitador (Production)

1. Ejecuta el facilitador:
```bash
# En otro terminal
cd facilitator
npm start
```

2. Configura `FACILITATOR_URL` en `.env`
3. Usa `createX402Middleware` con `requireFacilitatorConfirmation: true`

## Errores Comunes

### 402 - Payment Required
No se proporcionó pago o el pago es inválido.

### 400 - Bad Request
El formato del header `x-payment` no es JSON válido.

### 503 - Service Unavailable
El facilitador no está disponible.

### Payment Validation Failed
- Dirección de recipient incorrecta
- Red incorrecta
- Asset incorrecto
- Monto insuficiente
- Pago expirado

## Integración con x402-fetch

Para clientes que usan `x402-fetch`:

```typescript
import { createX402Fetch } from 'x402-fetch';

const x402fetch = createX402Fetch({
  wallet: yourWallet,
  network: 'polkax402',
});

const response = await x402fetch('http://localhost:3000/api/polka-news?query=governance');
const data = await response.json();
console.log(data);
```

## Recursos

- [X402 Protocol Spec](https://github.com/polkadot-api/x402)
- [Facilitator Setup](./FACILITATOR_SETUP.md)
- [API Documentation](http://localhost:3000/docs)

## Soporte

Para problemas o preguntas, revisa:
1. Logs del servidor
2. Configuración de `.env`
3. Estado del facilitador
4. Validez de los pagos del cliente

    body: JSON.stringify({
        ...payment,
        signature,
      }),
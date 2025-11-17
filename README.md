# Polkax402

**Polkax402** is an Express server exposing endpoints protected with the **X402 Payment Required** protocol, combining:

- 🔐 **X402 Middleware** – HTTP 402 payment system with on-chain verification
- 🔍 **Firecrawl** – News search and scraping via HTTPayer relay using x402-fetch
- 🤖 **OpenAI LLM** – Content processing and Markdown summary generation
- 📊 **RESTful API** – Endpoints documented with Swagger/OpenAPI

## 🚀 Main Features

### X402 Payment Protocol
- Fully functional middleware with payment validation
- Supports fixed and dynamic pricing
- Verification with on-chain facilitator
- Signature, timestamp and amount validation
- Demo mode for testing without real payments

### Endpoints
- `/api/polka-news` – Polkadot news aggregator (X402 protected)
- `/api/polka-news/demo` – Demo mode without real payments
- `/api/example/protected` – Example with dynamic pricing
- `/health` – Health check
- `/docs` – Swagger interactive documentation

## 📋 Requirements

### Environment Variables

Create `.env` from `.env.example`:

```bash
# Server
PORT=3000

# For Firecrawl Client (x402-fetch - pays through HTTPayer)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
FIRECRAWL_TOKEN=your_firecrawl_token
HTTPAYER_RELAY_URL=https://api.httpayer.com/relay

# For OpenAI LLM
OPENAI_API_KEY=sk-...

# For X402 Middleware (receives payments)
polkax402polkax402
RECIPIENT_ADDRESS=5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
PRICE_PER_REQUEST=10000000000
CONTRACT_ADDRESS=5CR7oWebzRjmYrACqiYhh4G7vX4yZnCxT4ZaucYU9mCNvXGM
FACILITATOR_URL=https://facilitator.polkax402.dpdns.org/settle
```

### Dependencies

```bash
npm install
```

## 🛠️ Usage

### Development

```bash
npm run dev
```

The server will start at `http://localhost:3000`.

### Production

```bash
npm run build
npm start
```

## 📝 Usage Examples

### 1. Health Check (Free)

```bash
curl http://localhost:3000/health
```

### 2. Polka News – Demo Mode

```bash
curl "http://localhost:3000/api/polka-news/demo?query=governance&paid=true"
```

### 3. Polka News – X402 Protected

```bash
curl -i http://localhost:3000/api/polka-news?query=parachains
```

### 4. JavaScript Client (x402-fetch)

```typescript
import { createX402Fetch } from 'x402-fetch';
```

## 📚 Documentation

- X402_MIDDLEWARE_GUIDE.md
- EXAMPLES.md
- http://localhost:3000/docs

## 🏗️ Architecture

Payment flow and project structure omitted for brevity.

## 🔑 Key Concepts

Wallet separation, pricing modes, demo vs production modes.

## 🛡️ Security

Signature validation, timestamp, facilitator verification.

## 🐛 Troubleshooting

Common errors and solutions.

## 📦 NPM Scripts

```bash
npm run dev
npm run build
npm start
```

## 🤝 Contributing

Example project demonstrating X402 protocol integration.

## 📄 License

MIT

## 🔗 Useful Links

- https://github.com/polkadot-api/x402
- https://httpayer.com
- https://firecrawl.dev
- https://www.npmjs.com/package/x402-fetch

# Polkax402

Proyecto minimal que expone un endpoint /api/polka-news que:
- Llama a Firecrawl vía HTTPayer relay usando x402-fetch (wallet endpoint que paga en USDC).
- Procesa la respuesta con un LLM (OpenAI) y devuelve JSON con resumen en Markdown listo para consumir por x402scan.

Requisitos (variables de entorno):

- PRIVATE_KEY: wallet que paga via HTTPayer (llévala a Base y fondea USDC)
- FIRECRAWL_TOKEN: API token de Firecrawl
- OPENAI_API_KEY: clave de OpenAI
- HTTPAYER_RELAY_URL: opcional, por defecto https://api.httpayer.com/relay

Instalación

1. Instala dependencias:

```bash
npm install
```

2. Crea `.env` a partir de `.env.example` y completa las variables.

3. Ejecuta en modo desarrollo:

```bash
npm run dev
```

Endpoint principal

GET /api/polka-news?query=...&limit=5

Ejemplo de prueba local (curl):

```bash
curl "http://localhost:3000/api/polka-news?query=polkadot%20governance%20updates&limit=5"
```

Notas

- `PRIVATE_KEY` es la wallet que paga vía HTTPayer (USDC en Base).
- Firecrawl pricing aproximado: 0.01 USD por request (gestionado en wallet endpoint).
- El `price_per_call_usd` en la respuesta se fija en 0.25 USD para tu propio endpoint (puedes ajustarlo).
- Reemplaza `placeholderX402Middleware` por tu middleware x402 real cuando lo tengas.

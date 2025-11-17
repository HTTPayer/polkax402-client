import express from "express";
import dotenv from "dotenv";
import polkaNewsRoute from "./routes/polkaNewsRoute";
import swaggerUi from "swagger-ui-express";
import openapiSpec from "../docs/openapi.json";
import { createX402Middleware } from "dotx402/server";
import type { X402Request } from "dotx402/server";

dotenv.config();

const app = express();
app.use(express.json());

// Health check endpoint (free - no X402 protection)
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Polkax402 API',
    version: '0.1.0',
    network: process.env.NETWORK || 'polkax402',
  });
});

// Root endpoint (free)
app.get("/", (req, res) => {
  res.json({ 
    ok: true, 
    service: "polkax402",
    version: "0.1.0",
    endpoints: {
      health: "GET /health",
      docs: "GET /docs",
      polkaNews: "GET /api/polka-news (X402 protected)",
      polkaNewsDemo: "GET /api/polka-news/demo (demo mode)",
      exampleProtected: "GET /api/example/protected (X402 protected)",
    }
  });
});

// Example X402 protected endpoint with dynamic pricing
app.get('/api/example/protected',
  createX402Middleware({
    network: (process.env.NETWORK || 'polkax402') as any,
    recipientAddress: process.env.RECIPIENT_ADDRESS || '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    pricePerRequest: (req) => {
      // Dynamic pricing based on query parameter
      const complexity = parseInt((req.query.complexity as string) || '1');
      const basePrice = parseInt(process.env.PRICE_PER_REQUEST || '10000000000');
      return String(basePrice * complexity);
    },
    asset: process.env.CONTRACT_ADDRESS || '5CR7oWebzRjmYrACqiYhh4G7vX4yZnCxT4ZaucYU9mCNvXGM',
    facilitatorUrl: process.env.FACILITATOR_URL || 'https://facilitator.polkax402.dpdns.org/settle',
    requireFacilitatorConfirmation: true,
    resourceDescription: 'Example protected endpoint with dynamic pricing',
    responseMimeType: 'application/json',
  }),
  (req, res) => {
    const x402Req = req as X402Request;
    const complexity = parseInt((req.query.complexity as string) || '1');

    res.json({
      message: 'Success! You accessed a protected resource.',
      complexity,
      timestamp: new Date().toISOString(),
      payment: {
        from: x402Req.x402Payment?.payload.from,
        amount: x402Req.x402Payment?.payload.amount,
        confirmed: x402Req.x402Payment?.confirmedOnChain,
        blockHash: x402Req.x402Payment?.facilitatorResponse?.blockHash,
        extrinsicHash: x402Req.x402Payment?.facilitatorResponse?.extrinsicHash,
      },
    });
  }
);

// Mount API routes
app.use("/api", polkaNewsRoute);

// Swagger UI at /docs
const swaggerOptions = {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Polkax402 API Docs",
};
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec as any, swaggerOptions));

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(port, () => {
  console.log('\n🚀 Polkax402 Server - LIVE\n');
  console.log(`📡 Listening:     http://localhost:${port}`);
  console.log(`👤 Recipient:     ${process.env.RECIPIENT_ADDRESS || '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'}`);
  console.log(`💰 Price/request: ${process.env.PRICE_PER_REQUEST || '10000000000'} (smallest unit)`);
  console.log(`🔄 Facilitator:   ${process.env.FACILITATOR_URL || 'https://facilitator.polkax402.dpdns.org/settle'}\n`);
  console.log('💡 Endpoints:');
  console.log('   GET  /health                        - Health check (free)');
  console.log('   GET  /docs                          - API documentation (free)');
  console.log('   GET  /api/polka-news                - Polkadot news (X402 protected)');
  console.log('   GET  /api/polka-news/demo           - Polkadot news (demo mode)');
  console.log('   GET  /api/example/protected         - Example (X402 protected)\n');
});

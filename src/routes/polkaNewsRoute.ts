import { Router, Request, Response, NextFunction } from "express";
import { FirecrawlClient } from "../services/firecrawlClient";
import { LlmProcessor } from "../services/llmProcessor";
import { createX402Middleware } from "dotx402/server";
import type { X402Request } from "dotx402/server";

// Placeholder middleware for demo endpoint (bypasses payment)
const placeholderX402Middleware = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

const router = Router();
const firecrawlClient = new FirecrawlClient();

// Create X402 middleware with configuration from environment
const x402Protected = createX402Middleware({
   network: (process.env.NETWORK || 'polkax402') as any,
  recipientAddress: process.env.RECIPIENT_ADDRESS || '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  pricePerRequest: process.env.PRICE_PER_REQUEST || '10000000000', // 0.01 tokens
  asset: process.env.CONTRACT_ADDRESS || '5CR7oWebzRjmYrACqiYhh4G7vX4yZnCxT4ZaucYU9mCNvXGM',
  facilitatorUrl: process.env.FACILITATOR_URL || 'https://facilitator.polkax402.dpdns.org/settle',
  requireFacilitatorConfirmation: process.env.REQUIRE_FACILITATOR !== 'false', // Can disable with REQUIRE_FACILITATOR=false
  maxPaymentAge: 300000, // 5 minutes
  resourceDescription: 'Polkadot News aggregation and AI-powered summary service',
  responseMimeType: 'application/json',
});

/**
 * GET /polka-news
 *
 * X402 Protected endpoint - requires payment
 *
 * Query params:
 *  - query: string (prompt de búsqueda para Firecrawl)
 *  - limit: number (1-10, opcional)
 */
router.get(
  "/polka-news",
  x402Protected, // Use real X402 middleware
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const x402Req = req as X402Request;
      const paymentInfo = x402Req.x402Payment;

      const queryParam = (req.query.query as string) || (req.query.q as string);

      const userQuery =
        (queryParam && queryParam.trim()) ||
        "Latest Polkadot, Kusama and parachain ecosystem news";

      const limit = req.query.limit ? Number(req.query.limit) : undefined;

      const firecrawlRes = await firecrawlClient.searchPolkadotNews({
        query: userQuery,
        limit,
      });

      const llmProcessor = new LlmProcessor();
      const readable = await llmProcessor.toReadablePolkaNews(
        firecrawlRes,
        userQuery
      );

      const responsePayload = {
        provider: "polkax402",
        version: "v0.1.0",
        data: readable,
        payment: {
          from: paymentInfo?.payload.from,
          to: paymentInfo?.payload.to,
          amount: paymentInfo?.payload.amount,
          asset: paymentInfo?.payload.asset,
          verified: paymentInfo?.verified,
          confirmed: paymentInfo?.confirmedOnChain,
          blockHash: paymentInfo?.facilitatorResponse?.blockHash,
          extrinsicHash: paymentInfo?.facilitatorResponse?.extrinsicHash,
          
        },
      };

      res.status(200).json(responsePayload);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /polka-news/demo
 *
 * Demo endpoint with placeholder middleware (for testing without payment)
 */
router.get(
  "/polka-news/demo",
  placeholderX402Middleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queryParam = (req.query.query as string) || (req.query.q as string);

      const userQuery =
        (queryParam && queryParam.trim()) ||
        "Latest Polkadot, Kusama and parachain ecosystem news";

      const limit = req.query.limit ? Number(req.query.limit) : undefined;

      const firecrawlRes = await firecrawlClient.searchPolkadotNews({
        query: userQuery,
        limit,
      });

      const llmProcessor = new LlmProcessor();
      const readable = await llmProcessor.toReadablePolkaNews(
        firecrawlRes,
        userQuery
      );

      const responsePayload = {
        provider: "polkax402",
        version: "v0.1.0",
        note: "Demo endpoint - use /polka-news for production with real X402 payments",
        data: readable,
      };

      res.status(200).json(responsePayload);
    } catch (err) {
      next(err);
    }
  }
);

export default router;

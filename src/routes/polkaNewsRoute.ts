import { Router, Request, Response, NextFunction } from "express";
import { FirecrawlClient } from "../services/firecrawlClient";
import { LlmProcessor } from "../services/llmProcessor";
import { placeholderX402Middleware } from "../middleware/x402Middleware";

const router = Router();
const firecrawlClient = new FirecrawlClient();

/**
 * GET /polka-news
 *
 * Query params:
 *  - query: string (prompt de búsqueda para Firecrawl)
 *  - limit: number (1-10, opcional)
 */
router.get(
  "/polka-news",
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
        price_per_call_usd: 0.25,
        data: readable,
      };

      res.status(200).json(responsePayload);
    } catch (err) {
      next(err);
    }
  }
);

export default router;

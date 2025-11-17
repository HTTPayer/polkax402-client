import { privateKeyToAccount } from "viem/accounts";
import { wrapFetchWithPayment } from "x402-fetch";

const HTTPAYER_RELAY_URL =
  process.env.HTTPAYER_RELAY_URL || "https://api.httpayer.com/relay";

// Endpoint wallet de Firecrawl x402
const FIRECRAWL_X402_URL = "https://api.firecrawl.dev/v1/x402/search";

let PRIVATE_KEY = process.env.PRIVATE_KEY || "";
if (PRIVATE_KEY && !PRIVATE_KEY.startsWith("0x")) {
  PRIVATE_KEY = `0x${PRIVATE_KEY}`;
}

// Only create account and payment-enabled fetch if PRIVATE_KEY is provided
let fetchWithPayment: typeof fetch = fetch;
if (PRIVATE_KEY) {
  try {
    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
    fetchWithPayment = wrapFetchWithPayment(fetch, account);
  } catch (err) {
    console.warn("[FirecrawlClient] invalid PRIVATE_KEY provided:", err);
    // keep fallback to regular fetch
  }
}

export interface FirecrawlSearchOptions {
  query: string;
  limit?: number; // max 10 por wallet endpoint
  // Puedes pasar más opciones si quieres
}

export interface FirecrawlSearchItem {
  title: string;
  description?: string;
  url: string;
  markdown?: string;
  metadata?: {
    title?: string;
    description?: string;
    sourceURL?: string;
    statusCode?: number;
    [key: string]: unknown;
  };
}

export interface FirecrawlSearchResponse {
  success: boolean;
  data: FirecrawlSearchItem[];
}

// Este client ya hace la llamada usando HTTPayer + x402
export class FirecrawlClient {
  private firecrawlToken: string;

  constructor() {
    this.firecrawlToken = process.env.FIRECRAWL_TOKEN || "";
    if (!this.firecrawlToken) {
      console.warn("[FirecrawlClient] FIRECRAWL_TOKEN is not set");
    }
    if (!PRIVATE_KEY) {
      console.warn(
        "[FirecrawlClient] PRIVATE_KEY is not set, x402-fetch will fail"
      );
    }
  }

  async searchPolkadotNews(
    options: FirecrawlSearchOptions
  ): Promise<FirecrawlSearchResponse> {
    const limit = Math.min(options.limit ?? 5, 10);

    const firecrawlBody = {
      query: options.query,
      limit,
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true,
      },
    };

    // Payload para HTTPayer /relay
    const relayPayload = {
      api_url: FIRECRAWL_X402_URL,
      method: "POST",
      network: "base",
      data: firecrawlBody,
      headers: {
        Authorization: `Bearer ${this.firecrawlToken}`,
      },
    };

    const response = await fetchWithPayment(HTTPAYER_RELAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(relayPayload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error(
        "[FirecrawlClient] Non OK response from relay",
        response.status,
        text
      );
      throw new Error("FIRECRAWL_RELAY_FAILED");
    }

    const json = (await response.json()) as FirecrawlSearchResponse;
    if (!json.success) {
      console.error("[FirecrawlClient] Firecrawl response not successful", json);
      throw new Error("FIRECRAWL_SEARCH_NOT_SUCCESS");
    }

    return json;
  }
}

import dotenv from "dotenv";
import { privateKeyToAccount } from "viem/accounts";
import { wrapFetchWithPayment, createSigner } from "x402-fetch";

// Load env vars first
dotenv.config();

const HTTPAYER_RELAY_URL =
  process.env.HTTPAYER_RELAY_URL || "https://api.httpayer.com/relay";

// Endpoint wallet de Firecrawl x402
const FIRECRAWL_X402_URL = "https://api.firecrawl.dev/v1/x402/search";

let PRIVATE_KEY = process.env.PRIVATE_KEY || "";
if (PRIVATE_KEY && !PRIVATE_KEY.startsWith("0x")) {
  PRIVATE_KEY = `0x${PRIVATE_KEY}`;
}

// Create x402-fetch that auto-handles 402 responses
let fetchWithPayment: typeof fetch = fetch;
let signerPromise: Promise<any> | null = null;

if (PRIVATE_KEY) {
  try {
    const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
    // Create a signer from the private key for x402-fetch (async)
    signerPromise = createSigner("base", PRIVATE_KEY).then((signer) => {
      console.log("[FirecrawlClient] x402-fetch configured with wallet:", account.address);
      return signer;
    });
    
    // Wrap fetch with payment handling - will auto-pay on 402
    // Note: we'll initialize this lazily in the client
  } catch (err) {
    console.warn("[FirecrawlClient] invalid PRIVATE_KEY provided:", err);
    signerPromise = null;
  }
} else {
  console.warn("[FirecrawlClient] No PRIVATE_KEY - x402 payments will fail");
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

    // Initialize fetchWithPayment if signer is available
    let currentFetch = fetch;
    if (signerPromise) {
      try {
        const signer = await signerPromise;
        console.log("[FirecrawlClient] Signer initialized, wrapping fetch with payment handler");
        currentFetch = wrapFetchWithPayment(
          fetch,
          signer,
          BigInt(100000), // max 0.1 USDC
        ) as typeof fetch;
      } catch (err) {
        console.error("[FirecrawlClient] Failed to initialize signer:", err);
      }
    } else {
      console.warn("[FirecrawlClient] No signer available - payments will fail");
    }

    console.log("[FirecrawlClient] Making request to HTTPayer relay...");
    const response = await currentFetch(HTTPAYER_RELAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(relayPayload),
    });

    console.log("[FirecrawlClient] Response status:", response.status);

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

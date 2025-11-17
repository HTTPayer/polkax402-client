import OpenAI from "openai";
import { FirecrawlSearchResponse } from "./firecrawlClient";
import { PolkaNewsOutput } from "../utils/types";

const SYSTEM_PROMPT = `
You are PolkaNewsAgent, an expert on the Polkadot ecosystem.

You will receive a Firecrawl search response in JSON format with fields:
- success
- data: array of items with { title, description, url, markdown, metadata }

Your job:
1) Read all items and focus ONLY on:
   - Polkadot
   - Kusama
   - Parachains and their ecosystem projects
2) Extract real news: governance, runtime upgrades, ecosystem launches,
   grants, partnerships, and important community announcements.
3) Ignore price speculation, memes, low quality content, and trading advice.

Output format:
Return a VALID JSON object that matches this TypeScript type:

type PolkaNewsOutput = {
  as_of: string;           // ISO timestamp
  query_used: string;      // the original query the user asked for
  summary_markdown: string;
  bullets: string[];
  sources: {
    title: string;
    url: string;
    note?: string;
  }[];
};

Rules:
- "summary_markdown" must be a concise but readable summary in Markdown.
- "bullets" must be short, human friendly bullet points.
- "sources" should include only the most relevant 5 to 10 links.
- Do NOT invent URLs, use only the ones in the Firecrawl data.
- Respond with JSON only, no extra commentary.
`;

export class LlmProcessor {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async toReadablePolkaNews(
    firecrawl: FirecrawlSearchResponse,
    query: string
  ): Promise<PolkaNewsOutput> {
    const userContent = JSON.stringify({
      query,
      firecrawl,
    });

    const completion = await this.client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Here is the Firecrawl search response as JSON. Convert it into PolkaNewsOutput JSON:\n\n${userContent}`,
        },
      ],
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("LLM_EMPTY_RESPONSE");
    }

    try {
      const parsed = JSON.parse(content) as PolkaNewsOutput;
      return parsed;
    } catch (err) {
      console.error("[LlmProcessor] Failed to parse LLM JSON", err, content);
      throw new Error("LLM_INVALID_JSON");
    }
  }
}

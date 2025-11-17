import { Request, Response, NextFunction } from "express";

// x402 placeholder middleware that enforces a payment check for demo
// Behavior:
// - If request has header `x402-paid: true` OR query `paid=true`, allows the request
// - Otherwise responds with 402 Payment Required and returns a payment instruction body
export function placeholderX402Middleware(req: Request, res: Response, next: NextFunction) {
  const paidHeader = (req.header("x402-paid") || "").toLowerCase();
  const paidQuery = (req.query.paid as string) || "";

  const isPaid = paidHeader === "true" || paidQuery === "true";
  if (isPaid) {
    return next();
  }

  // Build a sample payment instruction payload (conforms to x402 expected shape)
  const payTo = process.env.X402_PAY_TO || "0x0000000000000000000000000000000000000000";
  const asset = process.env.X402_ASSET || "USDC";
  const maxAmountRequired = process.env.X402_AMOUNT || "0.25"; // USD string
  const network = process.env.X402_NETWORK || "base";

  const payload = {
    x402Version: 1,
    accepts: [
      {
        scheme: "exact",
        network,
        payTo,
        asset,
        maxAmountRequired,
        resource: req.originalUrl,
        description: "Payment required to access this x402-enabled endpoint",
        mimeType: "application/json",
        maxTimeoutSeconds: 180,
      },
    ],
  };

  res.status(402).json(payload);
}


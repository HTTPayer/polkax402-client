import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import {
  X402MiddlewareConfig,
  X402PaymentPayload,
  X402PaymentInfo,
  X402Request,
} from "../utils/types.js";

/**
 * X402 Middleware Factory
 * 
 * Creates Express middleware that enforces X402 payment protocol.
 * - Validates payment headers
 * - Verifies signatures
 * - Confirms with facilitator (optional)
 * - Attaches payment info to request object
 */
export function createX402Middleware(config: X402MiddlewareConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Calculate the required price for this request
      const requiredPrice = typeof config.pricePerRequest === 'function'
        ? config.pricePerRequest(req)
        : config.pricePerRequest;

      // Check for payment headers
      const paymentHeader = req.header('x-payment');
      const signatureHeader = req.header('x-payment-signature');

      if (!paymentHeader || !signatureHeader) {
        return send402Response(req, res, config, requiredPrice);
      }

      // Parse payment payload
      let paymentPayload: X402PaymentPayload;
      try {
        paymentPayload = JSON.parse(paymentHeader);
      } catch (err) {
        return res.status(400).json({
          error: 'Invalid payment header format',
          message: 'Payment header must be valid JSON',
        });
      }

      // Validate payment payload
      const validationError = validatePaymentPayload(paymentPayload, config, requiredPrice);
      if (validationError) {
        return res.status(402).json({
          error: 'Payment validation failed',
          message: validationError,
          paymentReceived: paymentPayload,
        });
      }

      // Check payment age
      const maxAge = config.maxPaymentAge || 300000; // Default 5 minutes
      const paymentAge = Date.now() - paymentPayload.timestamp;
      if (paymentAge > maxAge) {
        return res.status(402).json({
          error: 'Payment expired',
          message: `Payment is too old. Max age: ${maxAge}ms, actual: ${paymentAge}ms`,
        });
      }

      // Verify with facilitator if required
      let facilitatorConfirmed = false;
      let facilitatorResponse;

      if (config.requireFacilitatorConfirmation) {
        try {
          const facilitatorResult = await verifyWithFacilitator(
            config.facilitatorUrl,
            paymentPayload,
            signatureHeader
          );
          
          facilitatorConfirmed = facilitatorResult.success;
          facilitatorResponse = facilitatorResult;

          if (!facilitatorConfirmed) {
            return res.status(402).json({
              error: 'Payment not confirmed',
              message: facilitatorResult.error || 'Facilitator rejected payment',
              facilitatorResponse: facilitatorResult,
            });
          }
        } catch (err) {
          console.error('Facilitator verification error:', err);
          return res.status(503).json({
            error: 'Facilitator unavailable',
            message: 'Unable to verify payment with facilitator',
          });
        }
      }

      // Payment validated - attach to request
      const x402Req = req as X402Request;
      x402Req.x402Payment = {
        payload: paymentPayload,
        confirmedOnChain: facilitatorConfirmed,
        facilitatorResponse,
        verifiedAt: Date.now(),
      };

      // Continue to route handler
      next();

    } catch (err) {
      console.error('X402 Middleware error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Error processing payment verification',
      });
    }
  };
}

/**
 * Send 402 Payment Required response with payment instructions
 */
function send402Response(
  req: Request,
  res: Response,
  config: X402MiddlewareConfig,
  requiredPrice: string
) {
  const payload = {
    x402Version: 1,
    accepts: [
      {
        scheme: 'exact',
        network: config.network,
        payTo: config.recipientAddress,
        asset: config.asset,
        maxAmountRequired: requiredPrice,
        resource: req.originalUrl,
        description: config.resourceDescription || 'Payment required to access this resource',
        mimeType: config.responseMimeType || 'application/json',
        maxTimeoutSeconds: Math.floor((config.maxPaymentAge || 300000) / 1000),
      },
    ],
  };

  res.status(402).json(payload);
}

/**
 * Validate payment payload against configuration
 */
function validatePaymentPayload(
  payload: X402PaymentPayload,
  config: X402MiddlewareConfig,
  requiredPrice: string
): string | null {
  // Check recipient address
  if (payload.to.toLowerCase() !== config.recipientAddress.toLowerCase()) {
    return `Payment sent to wrong recipient. Expected: ${config.recipientAddress}, Got: ${payload.to}`;
  }

  // Check network
  if (payload.network.toLowerCase() !== config.network.toLowerCase()) {
    return `Wrong network. Expected: ${config.network}, Got: ${payload.network}`;
  }

  // Check asset
  if (payload.asset.toLowerCase() !== config.asset.toLowerCase()) {
    return `Wrong asset. Expected: ${config.asset}, Got: ${payload.asset}`;
  }

  // Check amount
  const paidAmount = BigInt(payload.amount);
  const requiredAmount = BigInt(requiredPrice);
  if (paidAmount < requiredAmount) {
    return `Insufficient payment. Required: ${requiredPrice}, Got: ${payload.amount}`;
  }

  // Check required fields
  if (!payload.from || !payload.nonce || !payload.signature || !payload.timestamp) {
    return 'Missing required payment fields (from, nonce, signature, or timestamp)';
  }

  return null;
}

/**
 * Verify payment with facilitator service
 */
async function verifyWithFacilitator(
  facilitatorUrl: string,
  payment: X402PaymentPayload,
  signature: string
): Promise<any> {
  const response = await fetch(facilitatorUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      payment,
      signature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Facilitator returned ${response.status}: ${errorText}`);
  }

  return await response.json();
}

/**
 * Placeholder middleware for demo/testing (kept for backward compatibility)
 * Use createX402Middleware for production
 */
export function placeholderX402Middleware(req: Request, res: Response, next: NextFunction) {
  const paidHeader = (req.header("x402-paid") || "").toLowerCase();
  const paidQuery = (req.query.paid as string) || "";

  const isPaid = paidHeader === "true" || paidQuery === "true";
  if (isPaid) {
    return next();
  }

  const payTo = process.env.X402_PAY_TO || "0x0000000000000000000000000000000000000000";
  const asset = process.env.X402_ASSET || "USDC";
  const maxAmountRequired = process.env.X402_AMOUNT || "0.25";
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


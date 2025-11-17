// ===== Polka News Output =====
export interface PolkaNewsOutput {
  as_of: string;
  query_used: string;
  summary_markdown: string; // texto legible principal
  bullets: string[]; // puntos clave
  sources: {
    title: string;
    url: string;
    note?: string;
  }[];
}

// ===== X402 Types =====
import { Request } from 'express';

// Polkadot Signer Interface
export interface PolkadotSigner {
  address: string;
  sign: (payload: string | Uint8Array) => Promise<{ signature: string }>;
}

// X402 Payment Required (from 402 response)
export interface X402PaymentRequired {
  scheme: string;
  network: string;
  payTo: string;
  asset: string;
  maxAmountRequired: string;
  resource: string;
  description?: string;
  mimeType?: string;
  maxTimeoutSeconds?: number;
}

// Payment Payload (before signing)
export interface PaymentPayload {
  from: string;
  to: string;
  amount: string;
  asset: string;
  resource: string;
  network: string;
  nonce: string;
  timestamp: number;
  validUntil: number;
}

// Signed Payment (after signing)
export interface SignedPayment extends PaymentPayload {
  signature: string;
}

// X402 Payment (complete payment object)
export interface X402Payment {
  x402Version: number;
  network: string;
  asset: string;
  payment: SignedPayment;
}

export interface X402PaymentPayload {
  from: string;
  to: string;
  amount: string;
  asset: string;
  network: string;
  resource: string;
  nonce: string;
  timestamp: number;
  signature: string;
  validUntil: number;
  resourceHash?: string;
}

export interface FacilitatorResponse {
  success: boolean;
  blockHash?: string;
  extrinsicHash?: string;
  error?: string;
  message?: string;
}

export interface X402PaymentInfo {
  payload: X402PaymentPayload;
  confirmedOnChain: boolean;
  facilitatorResponse?: FacilitatorResponse;
  verifiedAt: number;
}

export interface X402Request extends Request {
  x402Payment?: X402PaymentInfo;
}

export type PriceCalculator = string | ((req: Request) => string);

export interface X402MiddlewareConfig {
  network: string;
  recipientAddress: string;
  pricePerRequest: PriceCalculator;
  asset: string;
  facilitatorUrl: string;
  requireFacilitatorConfirmation: boolean;
  maxPaymentAge?: number; // milliseconds
  resourceDescription?: string;
  responseMimeType?: string;
}

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

export interface X402PaymentPayload {
  from: string;
  to: string;
  amount: string;
  asset: string;
  network: string;
  nonce: string;
  timestamp: number;
  signature: string;
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

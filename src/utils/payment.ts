/**
 * X402 Payment Utilities for Polkadot
 * 
 * Handles payment payload creation, signing, and encoding for X402 protocol
 */

import { blake2AsU8a } from '@polkadot/util-crypto';
import { u8aToHex, u8aConcat, stringToU8a } from '@polkadot/util';
import type { PolkadotSigner, X402PaymentRequired, PaymentPayload, SignedPayment, X402Payment } from './types';

/**
 * Create a payment payload from payment requirements
 */
export function createPaymentPayload(
  fromAddress: string,
  paymentRequired: X402PaymentRequired,
  validityMinutes: number = 5
): PaymentPayload {
  const nonce = Math.random().toString(36).substring(2, 15);
  const validUntil = Date.now() + validityMinutes * 60 * 1000;

  return {
    from: fromAddress,
    to: paymentRequired.payTo,
    amount: paymentRequired.maxAmountRequired,
    asset: paymentRequired.asset,
    resource: paymentRequired.resource,
    network: paymentRequired.network,
    nonce,
    timestamp: Date.now(),
    validUntil,
  };
}

/**
 * SCALE encode an AccountId (SS58 address)
 * AccountId is 32 bytes in Substrate
 */
function encodeAccountId(address: string): Uint8Array {
  // Import decoding utilities
  const { decodeAddress } = require('@polkadot/util-crypto');
  
  // Decode SS58 address to raw 32 bytes
  const publicKey = decodeAddress(address);
  return publicKey;
}

/**
 * SCALE encode a u128 Balance
 * Compact encoding for Balance (uses compact/general integers)
 */
function encodeBalance(amount: string): Uint8Array {
  const { compactToU8a } = require('@polkadot/util');
  
  // Convert string to BigInt and encode as compact
  const amountBigInt = BigInt(amount);
  return compactToU8a(amountBigInt);
}

/**
 * SCALE encode a u64 timestamp
 * Compact encoding for u64
 */
function encodeU64(value: number): Uint8Array {
  const { compactToU8a } = require('@polkadot/util');
  return compactToU8a(value);
}

/**
 * Sign a payment payload using Polkadot signer
 * 
 * CRITICAL: This must match EXACTLY how the smart contract constructs the message.
 * The contract uses SCALE encoding in this order:
 * 1. from.encode() - SCALE encoded AccountId (32 bytes)
 * 2. to.encode() - SCALE encoded AccountId (32 bytes)
 * 3. amount.encode() - SCALE encoded Balance (compact u128)
 * 4. nonce.as_bytes() - Raw UTF-8 bytes
 * 5. valid_until.encode() - SCALE encoded u64 (compact)
 * 
 * Then Blake2x256 hash, then sr25519 signature verification.
 */
export async function signPaymentPayload(
  payload: PaymentPayload,
  signer: PolkadotSigner
): Promise<SignedPayment> {
  // Build message exactly as the contract does
  const fromEncoded = encodeAccountId(payload.from);
  const toEncoded = encodeAccountId(payload.to);
  const amountEncoded = encodeBalance(payload.amount);
  const nonceBytes = stringToU8a(payload.nonce);
  const validUntilEncoded = encodeU64(payload.validUntil);
  
  // Concatenate all parts
  const message = u8aConcat(
    fromEncoded,
    toEncoded,
    amountEncoded,
    nonceBytes,
    validUntilEncoded
  );
  
  // The signer will hash with Blake2-256 internally before signing
  const { signature } = await signer.sign(message);

  return {
    ...payload,
    signature,
  };
}

/**
 * Create X402Payment object from signed payment
 */
export function createX402Payment(
  signedPayment: SignedPayment,
  network: string,
  asset: string,
  x402Version: number = 1
): X402Payment {
  return {
    x402Version,
    network,
    asset,
    payment: signedPayment,
  };
}

/**
 * Encode payment as JSON header string
 */
export function encodePaymentHeader(x402Payment: X402Payment): string {
  // For the X-Payment header, we send the payment object directly
  return JSON.stringify(x402Payment.payment);
}

/**
 * Parse X402 Payment Required response
 */
export function parsePaymentRequired(responseBody: any): X402PaymentRequired {
  if (!responseBody.accepts || !Array.isArray(responseBody.accepts) || responseBody.accepts.length === 0) {
    throw new Error('Invalid X402 Payment Required response: missing accepts array');
  }

  return responseBody.accepts[0];
}

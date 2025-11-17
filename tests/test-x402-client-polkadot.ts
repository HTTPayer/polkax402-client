/**
 * X402 Client Test - Polkadot Version
 *
 * This example demonstrates how to make requests to X402-protected endpoints
 * using Polkadot accounts and signatures.
 */

import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { blake2AsU8a, decodeAddress } from '@polkadot/util-crypto';
import { u8aConcat, stringToU8a, compactToU8a } from '@polkadot/util';
import {
  createPaymentPayload,
  signPaymentPayload,
  createX402Payment,
  encodePaymentHeader,
  parsePaymentRequired,
} from './src/utils/payment';
import type { PolkadotSigner, X402PaymentRequired } from './src/utils/types';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SERVER_URL = process.env.API_URL || 'http://localhost:3001';
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://facilitator.polkax402.dpdns.org/settle';

/**
 * Make a request to an X402-protected endpoint
 */
async function makeProtectedRequest(
  endpoint: string,
  signer: PolkadotSigner
): Promise<void> {
  console.log(`\n📡 Requesting: ${endpoint}`);
  console.log('━'.repeat(60));

  try {
    // Step 1: Make initial request
    console.log('1️⃣  Making initial request...');
    let response = await fetch(endpoint);

    // Check if payment is required
    if (response.status !== 402) {
      const data = await response.json();
      console.log('✅ Success (no payment required):', data);
      return;
    }

    console.log('💰 Payment required (402)');

    // Step 2: Parse payment requirements from response body (X402 spec)
    const responseBody = await response.json();
    const paymentRequired: X402PaymentRequired = parsePaymentRequired(responseBody);
    
    console.log('2️⃣  Payment details:');
    console.log(`   Pay to:  ${paymentRequired.payTo}`);
    console.log(`   Amount:  ${paymentRequired.maxAmountRequired} (smallest unit)`);
    console.log(`   Network: ${paymentRequired.network}`);
    console.log(`   Resource: ${paymentRequired.resource}`);

    // Step 3: Create and sign payment
    console.log('3️⃣  Creating payment authorization...');
    const validityMinutes = paymentRequired.maxTimeoutSeconds
      ? paymentRequired.maxTimeoutSeconds / 60
      : 5;
    
    const payload = createPaymentPayload(signer.address, paymentRequired, validityMinutes);
    const signedPayment = await signPaymentPayload(payload, signer);
    const x402Payment = createX402Payment(
      signedPayment,
      paymentRequired.network,
      paymentRequired.asset,
      1
    );

    console.log(`   From:    ${payload.from}`);
    console.log(`   Nonce:   ${payload.nonce}`);
    console.log(`   Valid:   ${new Date(payload.validUntil).toLocaleString()}`);
    console.log(`   Signature: ${signedPayment.signature.substring(0, 20)}...`);

    // Step 4: Retry request with payment authorization
    console.log('4️⃣  Retrying request with payment authorization...');
    const paymentHeader = encodePaymentHeader(x402Payment);

    response = await fetch(endpoint, {
      headers: {
        'X-Payment': paymentHeader,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Success! Response:');
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  }

  console.log('━'.repeat(60));
}

/**
 * Main function
 */
async function main() {
  console.log('\n🚀 X402 Client Example - Polkadot Version\n');

  // Initialize crypto
  await cryptoWaitReady();

  // Create keyring
  const keyring = new Keyring({ type: 'sr25519' });

  // Load account from SURI (seed phrase or //DevAccount format)
  const accountUri = process.env.POLKADOT_ACCOUNT_URI || '//Bob'; // Changed to //Bob so it's different from recipient
  const account = keyring.addFromUri(accountUri);

  console.log('👤 Client Account:', account.address);
  console.log('🌐 Server:', SERVER_URL);
  console.log('🔄 Facilitator:', FACILITATOR_URL);

  // Create signer
  const signer: PolkadotSigner = {
    address: account.address,
    sign: async (payload: string | Uint8Array) => {
      // The payload is already SCALE-encoded message from payment.ts
      // We just need to hash it with Blake2-256 and sign
      const message = typeof payload === 'string' ? Buffer.from(payload, 'utf-8') : payload;
      const hash = blake2AsU8a(Uint8Array.from(message), 256);
      const signature = account.sign(hash);
      return { signature: `0x${Buffer.from(signature).toString('hex')}` };
    },
  };

  // Test 1: Free endpoint
  console.log('\n📋 TEST 1: Health check (free endpoint)');
  console.log('━'.repeat(60));
  const healthResponse = await fetch(`${SERVER_URL}/health`);
  const healthData = await healthResponse.json();
  console.log('✅ Health check:', healthData);

  // Test 2: Demo endpoint (no X402 payment)
  console.log('\n📋 TEST 2: Demo endpoint (no payment required)');
  await makeProtectedRequest(`${SERVER_URL}/api/polka-news/demo?query=polkadot%20governance`, signer);

  // Test 3: Protected endpoint with X402
  console.log('\n📋 TEST 3: Protected endpoint (X402 payment required)');
  await makeProtectedRequest(`${SERVER_URL}/api/polka-news?query=polkadot%20chain`, signer);

  console.log('\n✅ All tests complete!\n');
}

// Run the client
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

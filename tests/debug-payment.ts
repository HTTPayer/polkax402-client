/**
 * Debug script to see what payment object looks like
 */

import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady, blake2AsU8a } from '@polkadot/util-crypto';
import {
  createPaymentPayload,
  signPaymentPayload,
  createX402Payment,
  encodePaymentHeader,
} from './src/utils/payment';
import type { PolkadotSigner, X402PaymentRequired } from './src/utils/types';

async function main() {
  await cryptoWaitReady();
  
  const keyring = new Keyring({ type: 'sr25519' });
  const account = keyring.addFromUri('//Bob');
  
  console.log('Account:', account.address);
  
  const signer: PolkadotSigner = {
    address: account.address,
    sign: async (payload: string | Uint8Array) => {
      const message = typeof payload === 'string' ? Buffer.from(payload, 'utf-8') : payload;
      const hash = blake2AsU8a(Uint8Array.from(message), 256);
      const signature = account.sign(hash);
      return { signature: `0x${Buffer.from(signature).toString('hex')}` };
    },
  };
  
  const paymentRequired: X402PaymentRequired = {
    scheme: 'exact',
    network: 'polkax402',
    payTo: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    asset: '5CR7oWebzRjmYrACqiYhh4G7vX4yZnCxT4ZaucYU9mCNvXGM',
    maxAmountRequired: '10000000000',
    resource: '/api/polka-news?query=test',
    maxTimeoutSeconds: 300,
  };
  
  console.log('\n1. Payment Required:', JSON.stringify(paymentRequired, null, 2));
  
  const payload = createPaymentPayload(signer.address, paymentRequired, 5);
  console.log('\n2. Payment Payload (before signing):', JSON.stringify(payload, null, 2));
  
  const signedPayment = await signPaymentPayload(payload, signer);
  console.log('\n3. Signed Payment:', JSON.stringify(signedPayment, null, 2));
  
  const x402Payment = createX402Payment(signedPayment, paymentRequired.network, paymentRequired.asset, 1);
  console.log('\n4. X402 Payment:', JSON.stringify(x402Payment, null, 2));
  
  const headerValue = encodePaymentHeader(x402Payment);
  console.log('\n5. Header Value (what gets sent in X-Payment):');
  console.log(headerValue);
  
  console.log('\n6. Parsed back:', JSON.parse(headerValue));
}

main().catch(console.error);

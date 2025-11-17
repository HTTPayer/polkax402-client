/**
 * Test different signature formats to find what the contract expects
 */

import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady, blake2AsU8a } from '@polkadot/util-crypto';
import { stringToU8a, u8aToHex } from '@polkadot/util';

async function main() {
  await cryptoWaitReady();
  
  const keyring = new Keyring({ type: 'sr25519' });
  const account = keyring.addFromUri('//Bob');
  
  console.log('Account:', account.address);
  
  const paymentData = {
    from: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
    to: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    amount: "10000000000",
    asset: "5CR7oWebzRjmYrACqiYhh4G7vX4yZnCxT4ZaucYU9mCNvXGM",
    resource: "/api/polka-news?query=test",
    network: "polkax402",
    nonce: "test123",
    timestamp: 1763367932371,
    validUntil: 1763368232371,
  };
  
  console.log('\n=== Testing Different Signature Formats ===\n');
  
  // Format 1: Full JSON with all fields
  const format1 = JSON.stringify(paymentData);
  console.log('Format 1 - Full JSON:');
  console.log(format1);
  const sig1 = signMessage(account, format1);
  console.log('Signature:', sig1);
  console.log('');
  
  // Format 2: Without validUntil
  const { validUntil, ...dataWithoutValidUntil } = paymentData;
  const format2 = JSON.stringify(dataWithoutValidUntil);
  console.log('Format 2 - Without validUntil:');
  console.log(format2);
  const sig2 = signMessage(account, format2);
  console.log('Signature:', sig2);
  console.log('');
  
  // Format 3: Ordered fields (common in smart contracts)
  const format3 = JSON.stringify({
    from: paymentData.from,
    to: paymentData.to,
    amount: paymentData.amount,
    asset: paymentData.asset,
    network: paymentData.network,
    resource: paymentData.resource,
    nonce: paymentData.nonce,
    timestamp: paymentData.timestamp,
  });
  console.log('Format 3 - Ordered without validUntil:');
  console.log(format3);
  const sig3 = signMessage(account, format3);
  console.log('Signature:', sig3);
  console.log('');
  
  // Format 4: Concatenated values (another common approach)
  const format4 = `${paymentData.from}${paymentData.to}${paymentData.amount}${paymentData.asset}${paymentData.network}${paymentData.resource}${paymentData.nonce}${paymentData.timestamp}`;
  console.log('Format 4 - Concatenated values:');
  console.log(format4);
  const sig4 = signMessage(account, format4);
  console.log('Signature:', sig4);
  console.log('');
  
  // Format 5: Minimal fields
  const format5 = JSON.stringify({
    from: paymentData.from,
    to: paymentData.to,
    amount: paymentData.amount,
    nonce: paymentData.nonce,
  });
  console.log('Format 5 - Minimal fields:');
  console.log(format5);
  const sig5 = signMessage(account, format5);
  console.log('Signature:', sig5);
  console.log('');
}

function signMessage(account: any, message: string): string {
  const messageBytes = Buffer.from(message, 'utf-8');
  const hash = blake2AsU8a(Uint8Array.from(messageBytes), 256);
  const signature = account.sign(hash);
  return `0x${Buffer.from(signature).toString('hex')}`;
}

main().catch(console.error);

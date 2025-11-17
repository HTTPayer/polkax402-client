/**
 * Direct facilitator test with SCALE encoding (matching contract)
 */

import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady, blake2AsU8a, decodeAddress } from '@polkadot/util-crypto';
import { u8aConcat, stringToU8a, compactToU8a } from '@polkadot/util';
import dotenv from 'dotenv';

dotenv.config();

const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://facilitator.polkax402.dpdns.org/settle';

async function main() {
  await cryptoWaitReady();
  
  const keyring = new Keyring({ type: 'sr25519' });
  const account = keyring.addFromUri('//Bob');
  
  console.log('🔑 Account:', account.address);
  console.log('🔄 Facilitator:', FACILITATOR_URL);
  
  // Payment data
  const from = account.address;
  const to = process.env.RECIPIENT_ADDRESS || '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  const amount = '10000000000';
  const nonce = `test-${Date.now()}`;
  const validUntil = Date.now() + 5 * 60 * 1000; // 5 minutes from now
  
  console.log('\n📦 Payment Data:');
  console.log(`  from: ${from}`);
  console.log(`  to: ${to}`);
  console.log(`  amount: ${amount}`);
  console.log(`  nonce: ${nonce}`);
  console.log(`  validUntil: ${validUntil}`);
  
  // Build message EXACTLY as the contract does with SCALE encoding
  const fromEncoded = decodeAddress(from); // 32 bytes
  const toEncoded = decodeAddress(to); // 32 bytes
  const amountEncoded = compactToU8a(BigInt(amount)); // compact u128
  const nonceBytes = stringToU8a(nonce); // raw UTF-8 bytes
  const validUntilEncoded = compactToU8a(validUntil); // compact u64
  
  // Concatenate all parts
  const message = u8aConcat(
    fromEncoded,
    toEncoded,
    amountEncoded,
    nonceBytes,
    validUntilEncoded
  );
  
  console.log('\n✍️  Message (SCALE encoded):');
  console.log(`  Length: ${message.length} bytes`);
  console.log(`  Hex: 0x${Buffer.from(message).toString('hex').substring(0, 40)}...`);
  
  // Hash with Blake2-256
  const hash = blake2AsU8a(message, 256);
  console.log(`  Hash: 0x${Buffer.from(hash).toString('hex')}`);
  
  // Sign the hash
  const signature = account.sign(hash);
  const signatureHex = `0x${Buffer.from(signature).toString('hex')}`;
  
  console.log('\n🔐 Signature:', signatureHex.substring(0, 20) + '...');
  console.log(`  Length: ${signature.length} bytes (should be 64)`);
  
  // Complete payload for facilitator
  // Try both formats - the facilitator might need the signature in a specific format
  const facilitatorPayload = {
    from,
    to,
    amount,
    asset: process.env.CONTRACT_ADDRESS || '5CR7oWebzRjmYrACqiYhh4G7vX4yZnCxT4ZaucYU9mCNvXGM',
    network: process.env.NETWORK || 'polkax402',
    resource: '/api/test',
    nonce,
    timestamp: Date.now(),
    validUntil,
    signature: signatureHex, // Keep as hex string - facilitator should handle conversion
  };
  
  console.log('\n📤 Sending to facilitator...');
  
  try {
    const response = await fetch(FACILITATOR_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(facilitatorPayload),
    });
    
    console.log('\n📥 Response status:', response.status);
    
    const result = await response.json();
    console.log('\n📋 Response body:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.ok || result.success) {
      console.log('\n✅ SUCCESS!');
      if (result.blockHash) console.log('   Block Hash:', result.blockHash);
      if (result.extrinsicHash) console.log('   Extrinsic Hash:', result.extrinsicHash);
    } else {
      console.log('\n❌ FAILED');
      console.log('   Error:', result.error);
    }
  } catch (error) {
    console.error('\n💥 Request failed:', error);
  }
}

main().catch(console.error);

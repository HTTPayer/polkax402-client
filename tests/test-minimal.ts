/**
 * Minimal test - exactly matching what facilitator expects
 */

import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady, blake2AsU8a, decodeAddress } from '@polkadot/util-crypto';
import { u8aConcat, stringToU8a, compactToU8a } from '@polkadot/util';

async function main() {
  await cryptoWaitReady();
  
  const keyring = new Keyring({ type: 'sr25519' });
  const account = keyring.addFromUri('//Bob');
  
  // Use exact values
  const from = account.address;
  const to = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  const amount = '1000000000'; // Reduce amount to 0.001 tokens
  const nonce = 'minimal-test-1';
  const validUntil = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  console.log('Testing with:');
  console.log(`  from: ${from}`);
  console.log(`  to: ${to}`);
  console.log(`  amount: ${amount}`);
  console.log(`  nonce: ${nonce}`);
  console.log(`  validUntil: ${validUntil}`);
  
  // SCALE encode
  const message = u8aConcat(
    decodeAddress(from),
    decodeAddress(to),
    compactToU8a(BigInt(amount)),
    stringToU8a(nonce),
    compactToU8a(validUntil)
  );
  
  const hash = blake2AsU8a(message, 256);
  const signature = account.sign(hash);
  const signatureHex = `0x${Buffer.from(signature).toString('hex')}`;
  
  console.log(`  signature: ${signatureHex.substring(0, 30)}...`);
  console.log(`  sig length: ${signature.length} bytes`);
  
  // Minimal payload
  const payload = {
    from,
    to,
    amount,
    nonce,
    validUntil,
    signature: signatureHex,
  };
  
  console.log('\nSending to facilitator...');
  
  try {
    const response = await fetch('https://facilitator.polkax402.dpdns.org/settle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    const result = await response.json();
    console.log('\nResponse:', JSON.stringify(result, null, 2));
    
    if (result.ok || result.success) {
      console.log('\n✅ SUCCESS!');
    } else {
      console.log('\n❌ FAILED');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('\n💥 Error:', error);
  }
}

main().catch(console.error);

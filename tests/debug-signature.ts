/**
 * Debug script - Shows what we're signing vs what contract expects
 */

import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady, blake2AsU8a, decodeAddress } from '@polkadot/util-crypto';
import { u8aConcat, stringToU8a, compactToU8a, u8aToHex } from '@polkadot/util';

async function main() {
  await cryptoWaitReady();
  
  const keyring = new Keyring({ type: 'sr25519' });
  const account = keyring.addFromUri('//Bob');
  
  const from = account.address;
  const to = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  const amount = '10000000000';
  const nonce = 'test123';
  const validUntil = 1763368960785;
  
  console.log('='.repeat(80));
  console.log('CONTRACT SIGNATURE VERIFICATION - DEBUG INFO');
  console.log('='.repeat(80));
  
  console.log('\n📋 INPUT DATA:');
  console.log(`  from:       ${from}`);
  console.log(`  to:         ${to}`);
  console.log(`  amount:     ${amount}`);
  console.log(`  nonce:      "${nonce}"`);
  console.log(`  validUntil: ${validUntil}`);
  
  console.log('\n🔧 SCALE ENCODING (step by step):');
  
  // 1. From (AccountId - 32 bytes)
  const fromEncoded = decodeAddress(from);
  console.log(`\n  1. from.encode():`);
  console.log(`     Hex: ${u8aToHex(fromEncoded)}`);
  console.log(`     Length: ${fromEncoded.length} bytes`);
  
  // 2. To (AccountId - 32 bytes)
  const toEncoded = decodeAddress(to);
  console.log(`\n  2. to.encode():`);
  console.log(`     Hex: ${u8aToHex(toEncoded)}`);
  console.log(`     Length: ${toEncoded.length} bytes`);
  
  // 3. Amount (Balance - compact u128)
  const amountEncoded = compactToU8a(BigInt(amount));
  console.log(`\n  3. amount.encode():`);
  console.log(`     Hex: ${u8aToHex(amountEncoded)}`);
  console.log(`     Length: ${amountEncoded.length} bytes`);
  console.log(`     Value: ${amount} (${BigInt(amount).toString(16)} hex)`);
  
  // 4. Nonce (raw bytes)
  const nonceBytes = stringToU8a(nonce);
  console.log(`\n  4. nonce.as_bytes():`);
  console.log(`     Hex: ${u8aToHex(nonceBytes)}`);
  console.log(`     Length: ${nonceBytes.length} bytes`);
  console.log(`     String: "${nonce}"`);
  
  // 5. ValidUntil (u64 - compact)
  const validUntilEncoded = compactToU8a(validUntil);
  console.log(`\n  5. valid_until.encode():`);
  console.log(`     Hex: ${u8aToHex(validUntilEncoded)}`);
  console.log(`     Length: ${validUntilEncoded.length} bytes`);
  console.log(`     Value: ${validUntil} (${validUntil.toString(16)} hex)`);
  
  // Concatenate
  const message = u8aConcat(
    fromEncoded,
    toEncoded,
    amountEncoded,
    nonceBytes,
    validUntilEncoded
  );
  
  console.log('\n📦 CONCATENATED MESSAGE:');
  console.log(`  Total length: ${message.length} bytes`);
  console.log(`  Full hex: ${u8aToHex(message)}`);
  
  // Hash
  const hash = blake2AsU8a(message, 256);
  console.log('\n🔐 BLAKE2-256 HASH:');
  console.log(`  Hash: ${u8aToHex(hash)}`);
  
  // Sign
  const signature = account.sign(hash);
  const signatureHex = u8aToHex(signature);
  console.log('\n✍️  SR25519 SIGNATURE:');
  console.log(`  Signature: ${signatureHex}`);
  console.log(`  Length: ${signature.length} bytes`);
  
  // Verify locally (should pass)
  const publicKey = account.publicKey;
  console.log('\n🔍 LOCAL VERIFICATION:');
  console.log(`  Public Key: ${u8aToHex(publicKey)}`);
  
  // Try to verify (we can't easily do sr25519 verify in Node without native deps)
  console.log('\n✅ If contract receives:');
  console.log(`  - Same message hash: ${u8aToHex(hash)}`);
  console.log(`  - This signature: ${signatureHex}`);
  console.log(`  - From public key: ${u8aToHex(publicKey)}`);
  console.log(`  Then signature verification SHOULD succeed.`);
  
  console.log('\n' + '='.repeat(80));
  console.log('NEXT STEPS:');
  console.log('='.repeat(80));
  console.log('1. Check if account has balance in token contract');
  console.log('2. Check if nonce is already used');
  console.log('3. Check if validUntil is in the future');
  console.log('4. Ask facilitator/contract devs to add better error logging');
  console.log('='.repeat(80));
}

main().catch(console.error);

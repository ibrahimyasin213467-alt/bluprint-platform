import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';

export function verifySignature(
  walletAddress: string,
  message: string,
  signature: string
): boolean {
  try {
    const publicKey = new PublicKey(walletAddress);
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = Buffer.from(signature, 'base64');
    
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey.toBytes());
  } catch (error) {
    return false;
  }
}
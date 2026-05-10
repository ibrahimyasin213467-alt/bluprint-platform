import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';

const ADMIN_WALLETS = [
  "aJCqEsDgSXhkLUYAnq4tA2T3LfG7rMbfcdJapf9af9x", // YOUR_WALLET
  "2WyCLgg2vuvzmExak8WAeF9kBfvfcD4ahcKfm9P18gSc"  // KUZEN_WALLET
];

export async function POST(req: NextRequest) {
  try {
    const { publicKey, signature, message } = await req.json();
    
    if (!ADMIN_WALLETS.includes(publicKey)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    const publicKeyBytes = new PublicKey(publicKey).toBytes();
    
    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
    }
    
    const token = btoa(JSON.stringify({ publicKey, exp: Date.now() + 3600000 }));
    
    return NextResponse.json({ success: true, token });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
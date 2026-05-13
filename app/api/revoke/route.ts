import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createSetAuthorityInstruction, AuthorityType } from '@solana/spl-token';

const RPC_URL = 'https://solana-mainnet.g.alchemy.com/v2/HOfnwF22z5T8BCHNl_KIo';

export async function POST(req: NextRequest) {
  try {
    const { mintAddress, userPublicKey } = await req.json();

    if (!mintAddress || !userPublicKey) {
      return NextResponse.json({ success: false, error: 'Missing mintAddress or userPublicKey' }, { status: 400 });
    }

    const connection = new Connection(RPC_URL, 'confirmed');
    const mint = new PublicKey(mintAddress);
    const user = new PublicKey(userPublicKey);

    const transaction = new Transaction();
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = user;

    // Revoke Mint Authority
    transaction.add(
      createSetAuthorityInstruction(mint, user, AuthorityType.MintTokens, null)
    );
    
    // Revoke Freeze Authority
    transaction.add(
      createSetAuthorityInstruction(mint, user, AuthorityType.FreezeAccount, null)
    );

    return NextResponse.json({
      success: true,
      transaction: transaction.serialize({ verifySignatures: false }).toString('base64'),
    });
  } catch (error: any) {
    console.error('Revoke error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('wallet');
    
    if (!walletAddress) {
      return NextResponse.json({ success: false, error: 'Wallet required' }, { status: 400 });
    }
    
    const wallet = new PublicKey(walletAddress);
    
    // Cüzdandaki tüm token hesaplarını bul
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet, {
      programId: TOKEN_PROGRAM_ID,
    });
    
    const tokens = [];
    for (const account of tokenAccounts.value) {
      const tokenData = account.account.data.parsed.info;
      const mint = tokenData.mint;
      const balance = tokenData.tokenAmount.uiAmount;
      
      if (balance > 0) {
        // Token metadata'sını al
        try {
          const metadataRes = await fetch(`https://tokens.jup.ag/token/${mint}`);
          const metadata = await metadataRes.json();
          tokens.push({
            mint,
            name: metadata.name || "Unknown",
            symbol: metadata.symbol || "???",
            image: metadata.logoURI || "",
            balance,
          });
        } catch {
          tokens.push({
            mint,
            name: "Unknown Token",
            symbol: "???",
            image: "",
            balance,
          });
        }
      }
    }
    
    return NextResponse.json({ success: true, tokens });
  } catch (error: any) {
    console.error('User tokens error:', error);
    return NextResponse.json({ success: false, error: error.message, tokens: [] });
  }
}
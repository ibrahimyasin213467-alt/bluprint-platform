import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'trending';
    
    let url = '';
    
    if (filter === 'trending') {
      url = 'https://api.dexscreener.com/latest/dex/tokens/trending';
    } else if (filter === 'volume') {
      url = 'https://api.dexscreener.com/latest/dex/search?q=Solana&sort=volume&order=desc';
    } else {
      url = 'https://api.dexscreener.com/latest/dex/search?q=Solana';
    }
    
    console.log('Fetching DexScreener:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
      next: { revalidate: 30 }
    });
    
    const data = await response.json();
    
    let tokens = [];
    
    if (filter === 'trending') {
      // Trending endpoint farklı yapıda
      if (data.tokens && Array.isArray(data.tokens)) {
        tokens = data.tokens
          .filter((token: any) => token.chainId === 'solana')
          .slice(0, 50)
          .map((token: any) => ({
            mint: token.address,
            name: token.name || "Unknown",
            symbol: token.symbol || "???",
            image: token.logoURI || "",
            volume24h: token.volume?.h24 || 0,
            liquidity: token.liquidity?.usd || 0,
            priceChange24h: token.priceChange?.h24 || 0,
            pairAddress: token.pairAddress,
            dexUrl: `https://dexscreener.com/solana/${token.pairAddress}`,
            dex: token.dexId || "DexScreener",
          }));
      }
    } else {
      // Search endpoint
      if (data.pairs && Array.isArray(data.pairs)) {
        tokens = data.pairs
          .filter((pair: any) => pair.chainId === 'solana')
          .slice(0, 50)
          .map((pair: any) => ({
            mint: pair.baseToken?.address || pair.pairAddress,
            name: pair.baseToken?.name || "Unknown",
            symbol: pair.baseToken?.symbol || "???",
            image: pair.baseToken?.logoURI || "",
            volume24h: pair.volume?.h24 || 0,
            liquidity: pair.liquidity?.usd || 0,
            priceChange24h: pair.priceChange?.h24 || 0,
            pairAddress: pair.pairAddress,
            dexUrl: pair.url || `https://dexscreener.com/solana/${pair.pairAddress}`,
            dex: pair.dexId || "DexScreener",
          }));
      }
    }
    
    console.log(`Found ${tokens.length} Solana tokens`);
    
    return NextResponse.json({
      success: true,
      tokens,
    });
  } catch (error: any) {
    console.error("DexScreener API error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      tokens: []
    }, { status: 200 });
  }
}
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'trending';
    
    let url = '';
    
    if (filter === 'trending') {
      url = 'https://api.dexscreener.com/latest/dex/tokens/trending?chain=solana';
    } else if (filter === 'volume') {
      url = 'https://api.dexscreener.com/latest/dex/search?q=Solana&sort=volume&order=desc';
    } else {
      url = 'https://api.dexscreener.com/latest/dex/search?q=Solana';
    }
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
    });
    
    const data = await response.json();
    
    // Formatla
    let tokens = [];
    if (data.pairs && Array.isArray(data.pairs)) {
      tokens = data.pairs.slice(0, 30).map((pair: any) => ({
        mint: pair.baseToken?.address || pair.pairAddress,
        name: pair.baseToken?.name || "Unknown",
        symbol: pair.baseToken?.symbol || "???",
        image: pair.info?.image || "",
        volume24h: pair.volume?.h24 || 0,
        liquidity: pair.liquidity?.usd || 0,
        priceChange24h: pair.priceChange?.h24 || 0,
        pairAddress: pair.pairAddress,
        dexUrl: pair.url || `https://dexscreener.com/solana/${pair.pairAddress}`,
      }));
    }
    
    return NextResponse.json({
      success: true,
      tokens,
    });
  } catch (error: any) {
    console.error("DexScreener API error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      tokens: [
        { mint: "1", name: "Bonk", symbol: "BONK", volume24h: 1500000, liquidity: 500000, priceChange24h: 15.5 },
        { mint: "2", name: "DogWifHat", symbol: "WIF", volume24h: 2800000, liquidity: 1200000, priceChange24h: -5.2 },
        { mint: "3", name: "Popcat", symbol: "POPCAT", volume24h: 890000, liquidity: 320000, priceChange24h: 42.8 },
      ]
    }, { status: 200 });
  }
}
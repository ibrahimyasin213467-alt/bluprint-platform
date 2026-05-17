import { NextResponse } from 'next/server';

let cachedTokens: any[] = [];
let lastFetch = 0;
const CACHE_DURATION = 60 * 1000; // 1 dakika cache

export async function GET() {
  const now = Date.now();
  
  if (cachedTokens.length > 0 && (now - lastFetch) < CACHE_DURATION) {
    return NextResponse.json({ success: true, tokens: cachedTokens, cached: true });
  }
  
  try {
    // JUPITER TOKEN API V2 - RECENT ENDPOINT
    // Bu endpoint son eklenen tokenları getirir (ilk pool oluşturulma zamanına göre)
    const response = await fetch('https://lite-api.jup.ag/tokens/v2/recent', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Jupiter API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      const formattedTokens = data.slice(0, 50).map((token: any) => ({
        mint: token.id,
        name: token.name || "Unknown",
        symbol: token.symbol || "???",
        image: token.icon || "",
        volume24h: token.stats24h?.volume || 0,
        liquidity: token.liquidity || 0,
        priceChange24h: token.stats24h?.priceChange || 0,
        createdAt: token.firstPool?.createdAt,
        holderCount: token.holderCount,
        organicScore: token.organicScore,
        isVerified: token.isVerified,
        dex: "Jupiter"
      }));
      
      cachedTokens = formattedTokens;
      lastFetch = now;
      
      return NextResponse.json({ 
        success: true, 
        tokens: formattedTokens,
        total: formattedTokens.length,
        source: 'jupiter-v2-recent'
      });
    }
    
    throw new Error('No tokens found');
    
  } catch (error: any) {
    console.error('Jupiter Recent API error:', error);
    
    if (cachedTokens.length > 0) {
      return NextResponse.json({ 
        success: true, 
        tokens: cachedTokens, 
        cached: true,
        warning: 'Using cached data'
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch from Jupiter API',
      tokens: []
    }, { status: 200 });
  }
}
import { NextResponse } from 'next/server';

let cachedTokens: any[] = [];
let lastFetch = 0;
const CACHE_DURATION = 60 * 1000; // 1 dakika

export async function GET() {
  const now = Date.now();
  
  // Cache kontrolü
  if (cachedTokens.length > 0 && (now - lastFetch) < CACHE_DURATION) {
    return NextResponse.json({ success: true, tokens: cachedTokens, cached: true });
  }
  
  try {
    // DexPaprika - direkt token listesi (en basit)
    const response = await fetch('https://api.dexpaprika.com/tokens?limit=50', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      // Sadece Solana tokenlarını filtrele
      const solanaTokens = data.data.filter((token: any) => 
        token.chain?.toLowerCase() === 'solana' || 
        token.chain_id === 'solana' ||
        token.symbol === 'SOL' ||
        token.id?.startsWith('solana')
      );
      
      const tokensToUse = solanaTokens.length > 0 ? solanaTokens : data.data;
      
      const formattedTokens = tokensToUse.slice(0, 50).map((token: any) => ({
        mint: token.id || token.address || token.mint,
        name: token.name || "Unknown",
        symbol: token.symbol || "???",
        image: token.logo || token.logo_url || "",
        volume24h: token.volume_24h || token.volume || 0,
        liquidity: token.liquidity || 0,
        priceChange24h: token.price_change_24h || 0,
        createdAt: token.created_at || token.createdAt,
        dex: "DexPaprika"
      }));
      
      if (formattedTokens.length > 0) {
        cachedTokens = formattedTokens;
        lastFetch = now;
        
        return NextResponse.json({ 
          success: true, 
          tokens: formattedTokens,
          total: formattedTokens.length
        });
      }
    }
    
    throw new Error('No tokens found');
    
  } catch (error: any) {
    console.error('DexPaprika API error:', error);
    
    // Cache'te veri varsa onu kullan
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
      error: error.message || 'Failed to fetch from DexPaprika',
      tokens: []
    }, { status: 200 });
  }
}
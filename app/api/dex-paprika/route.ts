import { NextResponse } from 'next/server';

let cachedTokens: any[] = [];
let lastFetch = 0;
const CACHE_DURATION = 60 * 1000; // 1 dakika cache

export async function GET() {
  const now = Date.now();
  
  // Cache kontrolü
  if (cachedTokens.length > 0 && (now - lastFetch) < CACHE_DURATION) {
    return NextResponse.json({ success: true, tokens: cachedTokens, cached: true });
  }
  
  try {
    // DexPaprika - yeni tokenlar için
    // Önce Solana chain ID'sini bulalım
    const chainsRes = await fetch('https://api.dexpaprika.com/chains');
    const chainsData = await chainsRes.json();
    
    let solanaId = 'solana';
    for (const chain of chainsData.data || []) {
      if (chain.name === 'Solana') {
        solanaId = chain.id;
        break;
      }
    }
    
    // Yeni tokenları çek (son 24 saatte eklenenler)
    const response = await fetch(
      `https://api.dexpaprika.com/tokens?chain=${solanaId}&sort=new&limit=50`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
        next: { revalidate: 60 }
      }
    );
    
    if (!response.ok) {
      throw new Error(`DexPaprika API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      const formattedTokens = data.data.slice(0, 50).map((token: any) => ({
        mint: token.id,
        name: token.name || "Unknown",
        symbol: token.symbol || "???",
        image: token.logo || "",
        volume24h: token.volume_24h || 0,
        liquidity: token.liquidity || 0,
        priceChange24h: token.price_change_24h || 0,
        createdAt: token.created_at,
        dex: "DexPaprika"
      }));
      
      cachedTokens = formattedTokens;
      lastFetch = now;
      
      return NextResponse.json({ 
        success: true, 
        tokens: formattedTokens,
        total: formattedTokens.length,
        source: 'dexpaprika'
      });
    }
    
    throw new Error('No tokens found');
    
  } catch (error: any) {
    console.error('DexPaprika API error:', error);
    
    // Hata durumunda cache'teki veriyi döndür
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
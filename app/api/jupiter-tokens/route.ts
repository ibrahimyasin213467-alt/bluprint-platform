import { NextResponse } from 'next/server';

let cachedTokens: any[] = [];
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika cache

export async function GET() {
  const now = Date.now();
  
  // Cache kontrolü
  if (cachedTokens.length > 0 && (now - lastFetch) < CACHE_DURATION) {
    return NextResponse.json({ success: true, tokens: cachedTokens, cached: true });
  }
  
  try {
    // Jupiter API - daha stabil endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 saniye timeout
    
    const response = await fetch('https://token.jup.ag/all', {
      signal: controller.signal,
      headers: { 
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Jupiter API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data from Jupiter API');
    }
    
    // Tokenları formatla ve son eklenenlere göre sırala
    const formattedTokens = data.slice(0, 50).map((token: any) => ({
      mint: token.address,
      name: token.name || "Unknown",
      symbol: token.symbol || "???",
      image: token.logoURI || "",
      volume24h: token.volume_24h || 0,
      liquidity: token.liquidity || 0,
      priceChange24h: token.price_change_24h || 0,
      createdAt: token.createdAt,
      dex: "Jupiter"
    }));
    
    if (formattedTokens.length === 0) {
      throw new Error('No tokens found');
    }
    
    // Cache'e kaydet
    cachedTokens = formattedTokens;
    lastFetch = now;
    
    return NextResponse.json({ 
      success: true, 
      tokens: formattedTokens,
      total: formattedTokens.length,
      source: 'jupiter-api'
    });
    
  } catch (error: any) {
    console.error('Jupiter API error:', error);
    
    // Cache'te veri varsa onu döndür
    if (cachedTokens.length > 0) {
      return NextResponse.json({ 
        success: true, 
        tokens: cachedTokens, 
        cached: true,
        warning: 'Using cached data due to API error'
      });
    }
    
    // Hiç veri yoksa fallback olarak BluPrint tokenları mı göstersek?
    // Veya boş array döndür
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch from Jupiter API',
      tokens: []
    }, { status: 200 }); // 500 yerine 200 döndür ki frontend kırılmasın
  }
}
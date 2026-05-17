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
    // Jupiter API - sadece gerçek veri
    const response = await fetch('https://tokens.jup.ag/tokens?tags=verified', {
      headers: { 
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
      next: { revalidate: 60 } // 60 saniye revalidate
    });
    
    if (!response.ok) {
      throw new Error(`Jupiter API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data from Jupiter API');
    }
    
    // Sadece Solana tokenları (chainId kontrolü)
    const solanaTokens = data.filter((token: any) => 
      token.chainId === 'solana' || token.chainId === '101' || token.address?.startsWith('So')
    );
    
    // Formatla
    const formattedTokens = solanaTokens.slice(0, 50).map((token: any) => ({
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
      throw new Error('No Solana tokens found');
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
    
    // HATA DURUMUNDA MOCK DATA YOK - SADECE HATA DÖNDÜR
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch from Jupiter API',
      tokens: []
    }, { status: 500 });
  }
}
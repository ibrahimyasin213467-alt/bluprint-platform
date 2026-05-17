import { NextResponse } from 'next/server';

// Cache mekanizması (30 saniye)
let cachedTokens: any[] = [];
let lastFetch = 0;
const CACHE_DURATION = 30 * 1000;

export async function GET() {
  const now = Date.now();
  
  // Cache kontrolü
  if (cachedTokens.length > 0 && (now - lastFetch) < CACHE_DURATION) {
    return NextResponse.json({ success: true, tokens: cachedTokens, cached: true });
  }
  
  try {
    // Jupiter token listesi API'si
    const response = await fetch('https://tokens.jup.ag/tokens?tags=verified', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (Array.isArray(data)) {
      // Sadece Solana chain tokenları
      let solanaTokens = data.filter((token: any) => token.chainId === 'solana' || token.chainId === '101');
      
      // Oluşturulma tarihine göre sırala (en yeniler en başta)
      solanaTokens = solanaTokens.sort((a: any, b: any) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
      
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
      
      cachedTokens = formattedTokens;
      lastFetch = now;
      
      return NextResponse.json({ success: true, tokens: formattedTokens });
    } else {
      throw new Error('Invalid response format');
    }
    
  } catch (error: any) {
    console.error('Jupiter API error:', error);
    
    // Mock data (hata durumunda)
    const mockTokens = [
      { mint: "mock1", name: "BluPrint", symbol: "BLUEP", image: "", volume24h: 150000, liquidity: 50000, priceChange24h: 15.5, dex: "Jupiter" },
      { mint: "mock2", name: "Solana", symbol: "SOL", image: "", volume24h: 2800000, liquidity: 1200000, priceChange24h: -5.2, dex: "Jupiter" },
      { mint: "mock3", name: "Bonk", symbol: "BONK", image: "", volume24h: 890000, liquidity: 320000, priceChange24h: 42.8, dex: "Jupiter" },
    ];
    
    return NextResponse.json({ success: true, tokens: mockTokens, isMock: true });
  }
}   
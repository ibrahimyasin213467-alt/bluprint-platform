import { NextRequest, NextResponse } from 'next/server';

// Cache'te tut (10 dakika)
let cachedTokens: any[] = [];
let lastFetch = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 dakika

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'new';
    
    // Cache kontrolü
    const now = Date.now();
    if (cachedTokens.length > 0 && (now - lastFetch) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        tokens: cachedTokens,
        cached: true,
      });
    }
    
    let tokens: any[] = [];
    
    if (filter === 'new') {
      // Yeni Pairs için özel endpoint
      // DexScreener'ın yeni pair'leri "pairCreatedAt"a göre sıralanmış olarak geliyor
      const url = 'https://api.dexscreener.com/latest/dex/search?q=Solana';
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
        next: { revalidate: 60 }
      });
      
      const data = await response.json();
      
      if (data.pairs && Array.isArray(data.pairs)) {
        // Sadece Solana chain'dekileri filtrele
        let solanaPairs = data.pairs.filter((pair: any) => pair.chainId === 'solana');
        
        // Oluşturulma tarihine göre sırala (en yeniler en başta)
        solanaPairs = solanaPairs.sort((a: any, b: any) => {
          const aTime = a.pairCreatedAt ? new Date(a.pairCreatedAt).getTime() : 0;
          const bTime = b.pairCreatedAt ? new Date(b.pairCreatedAt).getTime() : 0;
          return bTime - aTime;
        });
        
        tokens = solanaPairs.slice(0, 50).map((pair: any) => ({
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
          pairCreatedAt: pair.pairCreatedAt,
        }));
      }
    } else {
      // Trending veya Volume için mevcut mantık
      let url = '';
      if (filter === 'trending') {
        url = 'https://api.dexscreener.com/latest/dex/tokens/trending';
      } else {
        url = 'https://api.dexscreener.com/latest/dex/search?q=Solana';
      }
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
        next: { revalidate: 60 }
      });
      
      const data = await response.json();
      
      if (filter === 'trending' && data.tokens) {
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
            dex: token.dexId || "DexScreener",
          }));
      } else if (data.pairs) {
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
    
    // Cache'e kaydet
    cachedTokens = tokens;
    lastFetch = now;
    
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
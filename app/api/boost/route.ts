import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/app/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const { mintAddress, wallet } = await req.json();
    
    if (!mintAddress || !wallet) {
      return NextResponse.json({ success: false, error: 'Missing mintAddress or wallet' }, { status: 400 });
    }
    
    // Boost sayısını artır
    const boostKey = `boost:${mintAddress}`;
    const currentBoost = await redis.incr(boostKey);
    
    // Leaderboard'a ekle
    await redis.zadd(KEYS.boostLeaderboard, { score: currentBoost, member: mintAddress });
    
    // Token bilgilerini al
    const allTokens = await redis.lrange(KEYS.tokens, 0, -1);
    let token = null;
    
    for (const t of allTokens) {
      const tokenData = typeof t === 'string' ? JSON.parse(t) : t;
      if (tokenData.mint === mintAddress) {
        token = tokenData;
        break;
      }
    }
    
    return NextResponse.json({
      success: true,
      boostCount: currentBoost,
      token
    });
  } catch (error: any) {
    console.error("Boost error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET: Boost leaderboard'u getir
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // zrange ile en yüksek skorları al (descending için REV ile)
    const topBoosts = await redis.zrange(KEYS.boostLeaderboard, 0, limit - 1, { 
      rev: true, 
      withScores: true 
    });
    
    const tokens = [];
    // topBoosts format: [{ member: "mint", score: 15 }, ...]
    for (const item of topBoosts) {
      if (!item || typeof item !== 'object') continue;
      
      const mintAddress = 'member' in item ? item.member as string : null;
      const boostCount = 'score' in item ? item.score as number : 0;
      
      if (!mintAddress) continue;
      
      // Token detaylarını bul
      const allTokens = await redis.lrange(KEYS.tokens, 0, -1);
      let token = null;
      for (const t of allTokens) {
        const tokenData = typeof t === 'string' ? JSON.parse(t) : t;
        if (tokenData.mint === mintAddress) {
          token = tokenData;
          break;
        }
      }
      
      if (token) {
        tokens.push({
          ...token,
          boostCount
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      tokens
    });
  } catch (error: any) {
    console.error("Boost leaderboard error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
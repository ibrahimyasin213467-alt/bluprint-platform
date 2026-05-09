import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/app/lib/redis';

export async function GET() {
  try {
    const tokens = await redis.lrange(KEYS.tokens, 0, 49);
    
    // Redis'ten gelen verileri temizle
    const cleanTokens = tokens.map((t: any) => {
      if (typeof t === 'string') {
        return JSON.parse(t);
      }
      return t;
    });
    
    return NextResponse.json({
      success: true,
      tokens: cleanTokens,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function POST(req: Request) {
  try {
    const { mintAddress, name, symbol, twitter, telegram, website, createdBy } = await req.json();
    
    const tokenData = {
      mint: mintAddress,
      name,
      symbol,
      createdAt: new Date().toISOString(),
      twitter: twitter || '',
      telegram: telegram || '',
      website: website || '',
      createdBy: createdBy || '',
    };
    
    // STRING olarak kaydet (JSON.stringify ile)
    await redis.lpush(KEYS.tokens, JSON.stringify(tokenData));
    await redis.ltrim(KEYS.tokens, 0, 49);
    await redis.incr(KEYS.tokenCount);
    
    if (createdBy) {
      await redis.sadd(KEYS.users, createdBy);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Token save error:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
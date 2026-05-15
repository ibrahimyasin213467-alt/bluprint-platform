import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/app/lib/redis';

// POST: Yeni token kaydet
export async function POST(req: NextRequest) {
  try {
    const { mint, name, symbol, createdBy, createdAt, image, twitter, telegram, website } = await req.json();

    if (!mint || !name || !symbol || !createdBy) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const tokenData = {
      mint,
      name,
      symbol: symbol.toUpperCase(),
      createdAt: createdAt || new Date().toISOString(),
      createdBy,
      image: image || '',
      twitter: twitter || '',
      telegram: telegram || '',
      website: website || '',
    };

    await redis.lpush(KEYS.tokens, JSON.stringify(tokenData));
    await redis.ltrim(KEYS.tokens, 0, 99);
    await redis.incr(KEYS.tokenCount);
    await redis.sadd(KEYS.users, createdBy);

    return NextResponse.json({ success: true, token: tokenData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET: Tüm token'ları getir
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const tokens = await redis.lrange(KEYS.tokens, 0, limit - 1);
    const parsedTokens = tokens.map((t: any) => typeof t === 'string' ? JSON.parse(t) : t);
    
    return NextResponse.json({
      success: true,
      tokens: parsedTokens,
      total: await redis.get(KEYS.tokenCount) || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
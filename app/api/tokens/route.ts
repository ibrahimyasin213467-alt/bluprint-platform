import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/app/lib/redis';

// GET: Belirli bir token'ı getir
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  try {
    const { mint } = await params;
    
    // Redis'teki tüm token'ları al
    const allTokens = await redis.lrange(KEYS.tokens, 0, -1);
    
    let foundToken = null;
    
    for (const token of allTokens) {
      const tokenData = JSON.parse(token as string);
      if (tokenData.mint === mint) {
        foundToken = tokenData;
        break;
      }
    }
    
    if (!foundToken) {
      return NextResponse.json({ success: false, error: 'Token not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      token: foundToken,
    });
  } catch (error: any) {
    console.error('Token API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

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

    // Token'ı Redis listesine ekle (en başa)
    await redis.lpush(KEYS.tokens, JSON.stringify(tokenData));
    // Son 100 token'ı tut
    await redis.ltrim(KEYS.tokens, 0, 99);
    // Token sayacını artır
    await redis.incr(KEYS.tokenCount);
    // Kullanıcıyı kaydet
    await redis.sadd(KEYS.users, createdBy);

    console.log(`✅ Token saved to Redis: ${mint} (${name})`);

    return NextResponse.json({ success: true, token: tokenData });
  } catch (error: any) {
    console.error('Token save error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET: Tüm token'ları getir (query parameter ile)
export async function GET_ALL(req: NextRequest) {
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
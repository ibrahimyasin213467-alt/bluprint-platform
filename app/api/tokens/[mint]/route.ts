import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/app/lib/redis';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  try {
    const { mint } = await params;
    
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
    
    return NextResponse.json({ success: true, token: foundToken });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
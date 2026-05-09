import { NextResponse } from 'next/server';
import { redis, KEYS } from '@/app/lib/redis';

export async function GET() {
  try {
    const tokenCount = await redis.get(KEYS.tokenCount) || 0;
    const tokensLeft = Math.max(0, 100 - Number(tokenCount));
    
    return NextResponse.json({
      success: true,
      totalTokens: Number(tokenCount),
      tokensLeft,
      poolTotal: 50,
      poolRemaining: (tokensLeft / 100) * 50,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
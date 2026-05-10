import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/app/lib/redis';

export async function GET(
  req: NextRequest,
  { params }: { params: { wallet: string } }
) {
  try {
    const { wallet } = params;
    
    // Kullanıcının oluşturduğu token'ları bul
    const allTokens = await redis.lrange(KEYS.tokens, 0, -1);
    const userTokens: any[] = [];
    
    for (const token of allTokens) {
      const tokenData = JSON.parse(token as string);
      if (tokenData.createdBy === wallet) {
        userTokens.push(tokenData);
      }
    }
    
    // Kullanıcının referans kazancını bul
    const earningsKey = `${KEYS.earnings}:${wallet}`;
    const earnings = await redis.get(earningsKey);
    const earningsData = earnings ? JSON.parse(earnings as string) : { pending: 0, claimed: 0, referrals: [] };
    
    // Promo code'u sadece token oluşturmuşsa gönder
    const promoCode = userTokens.length > 0 ? await redis.get(`promocode:${wallet}`) : null;
    
    return NextResponse.json({
      success: true,
      user: {
        wallet,
        totalTokens: userTokens.length,
        totalReferrals: earningsData.referrals?.length || 0,
        totalEarned: earningsData.claimed || 0,
        pendingEarnings: earningsData.pending || 0,
        promoCode: promoCode || null,
        hasCreatedToken: userTokens.length > 0,
        tokens: userTokens.slice(0, 10),
      }
    });
  } catch (error: any) {
    console.error('Profile API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { redis, KEYS } from '@/app/lib/redis';

export async function GET() {
  try {
    const allEarningsKeys = await redis.keys(`${KEYS.earnings}:*`);
    const leaderboard: { wallet: string; referrals: number; earnings: number }[] = [];
    
    for (const key of allEarningsKeys) {
      const wallet = key.replace(`${KEYS.earnings}:`, '');
      const claimed = Number(await redis.hget(key, 'claimed') || 0);
      const pending = Number(await redis.hget(key, 'pending') || 0);
      const referralsCount = await redis.scard(`${key}:referrals`);
      
      leaderboard.push({
        wallet,
        referrals: referralsCount,
        earnings: claimed + pending,
      });
    }
    
    // Referans sayısına göre sırala
    leaderboard.sort((a, b) => b.referrals - a.referrals);
    
    return NextResponse.json({
      success: true,
      leaderboard: leaderboard.slice(0, 20),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
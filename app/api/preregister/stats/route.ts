import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const total = await redis.scard('preregister:list');
    const vip = await redis.scard('preregister:vip');
    const premium = total - vip;

    // Leaderboard için en çok referans getirenler
    const allWallets = await redis.smembers('preregister:list');
    const leaderboard = [];
    
    for (const wallet of allWallets) {
      const data = await redis.get(`preregister:${wallet}`);
      if (data) {
        const userData = JSON.parse(data as string);
        leaderboard.push({
          wallet: wallet as string,
          referrals: userData.referrals || 0,
          tier: userData.tier,
        });
      }
    }
    
    leaderboard.sort((a, b) => b.referrals - a.referrals);
    const topReferrers = leaderboard.slice(0, 10);

    return NextResponse.json({
      success: true,
      stats: {
        total,
        vip,
        premium,
        maxLimit: 2000,
        vipLimit: 500,
      },
      topReferrers,
    });
  } catch (error: any) {
    console.error('Preregister stats error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
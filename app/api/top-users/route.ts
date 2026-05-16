import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/app/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || 'all';
    const sortBy = searchParams.get('sort') || 'tokens';

    // Tüm kullanıcıları al
    const users = await redis.smembers(KEYS.users);
    
    // Her kullanıcı için token sayısını ve referral sayısını hesapla
    const userStats = [];
    for (const wallet of users) {
      // Token sayısı
      const allTokens = await redis.lrange(KEYS.tokens, 0, -1);
      let tokenCount = 0;
      for (const t of allTokens) {
        const tokenData = typeof t === 'string' ? JSON.parse(t) : t;
        if (tokenData.createdBy === wallet) {
          tokenCount++;
        }
      }
      
      // Referral sayısı (earnings içindeki referrals dizisinden)
      const earningsKey = `${KEYS.earnings}:${wallet}`;
      const earningsData = await redis.get(earningsKey);
      let referralCount = 0;
      if (earningsData) {
        const data = typeof earningsData === 'string' ? JSON.parse(earningsData) : earningsData;
        referralCount = data.referrals?.length || 0;
      }
      
      // Önkayıt tier'ını kontrol et
      const preregisterData = await redis.get(`preregister:${wallet}`);
      let tier = null;
      if (preregisterData) {
        const prereg = typeof preregisterData === 'string' ? JSON.parse(preregisterData) : preregisterData;
        tier = prereg.tier;
      }
      
      // Token oluşturma zamanı (ilk token)
      let createdAt = null;
      for (const t of allTokens) {
        const tokenData = typeof t === 'string' ? JSON.parse(t) : t;
        if (tokenData.createdBy === wallet) {
          createdAt = tokenData.createdAt;
          break;
        }
      }
      
      userStats.push({
        wallet,
        tokenCount,
        referralCount,
        tier,
        createdAt,
      });
    }
    
    // Sırala
    userStats.sort((a, b) => {
      if (sortBy === 'tokens') {
        return b.tokenCount - a.tokenCount;
      } else {
        return b.referralCount - a.referralCount;
      }
    });
    
    // Limit
    const topUsers = userStats.slice(0, 50);
    
    return NextResponse.json({
      success: true,
      users: topUsers,
    });
  } catch (error: any) {
    console.error("Top users error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
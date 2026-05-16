import { NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';  // ✅ DOĞRU YOL

export async function GET() {
  try {
    // Aktif boostların key'lerini al
    const keys = await redis.keys('boost:active:*');
    const activeBoosts = [];
    
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const boost = typeof data === 'string' ? JSON.parse(data) : data;
        // Süresi dolmamış mı kontrol et
        if (boost.expiresAt > Date.now()) {
          activeBoosts.push(boost);
        } else {
          // Süresi dolmuşsa temizle
          await redis.del(key);
        }
      }
    }
    
    // Boost sayısına göre sırala (en çok boostlanan en önde)
    activeBoosts.sort((a, b) => b.boostCount - a.boostCount);
    
    return NextResponse.json({ success: true, tokens: activeBoosts });
  } catch (error: any) {
    console.error('Active boosts error:', error);
    return NextResponse.json({ success: false, tokens: [] });
  }
}
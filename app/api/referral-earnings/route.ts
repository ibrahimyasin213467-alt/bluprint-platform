import { NextRequest, NextResponse } from 'next/server';
import { redis, KEYS } from '@/app/lib/redis';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet');
  
  if (!wallet) {
    return NextResponse.json({ success: false, error: 'Wallet required' }, { status: 400 });
  }
  
  try {
    // Kullanıcının kazançlarını al
    const earningsKey = `${KEYS.earnings}:${wallet}`;
    const userEarnings = await redis.hgetall(earningsKey);
    
    const pending = Number(userEarnings?.pending || 0);
    const claimed = Number(userEarnings?.claimed || 0);
    const referrals = await redis.smembers(`${earningsKey}:referrals`);
    
    return NextResponse.json({
      success: true,
      earnings: pending,
      claimed,
      totalReferrals: referrals.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function POST(req: Request) {
  try {
    const { wallet, amount } = await req.json();
    
    if (!wallet || amount === undefined) {
      return NextResponse.json({ success: false, error: 'Wallet and amount required' });
    }
    
    const earningsKey = `${KEYS.earnings}:${wallet}`;
    
    // Mevcut kazancı kontrol et
    const pending = Number(await redis.hget(earningsKey, 'pending') || 0);
    
    if (pending < amount) {
      return NextResponse.json({ success: false, error: 'Insufficient earnings' });
    }
    
    // Kazancı güncelle
    await redis.hincrby(earningsKey, 'pending', -amount);
    await redis.hincrby(earningsKey, 'claimed', amount);
    
    return NextResponse.json({ success: true, amount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
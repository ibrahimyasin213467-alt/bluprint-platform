  import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';

const MAX_LIMIT = 2000;
const VIP_LIMIT = 500;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet } = body;

    if (!wallet) {
      return NextResponse.json({ success: false, error: 'Wallet required' }, { status: 400 });
    }

    // Zaten kayıtlı mı?
    const existing = await redis.get(`preregister:${wallet}`);
    if (existing) {
      return NextResponse.json({ success: false, error: 'Already registered' }, { status: 400 });
    }

    // Kontenjan dolu mu?
    const count = await redis.scard('preregister:list');
    if (count >= MAX_LIMIT) {
      return NextResponse.json({ success: false, error: 'Registration full' }, { status: 400 });
    }

    // VIP mi Premium mu?
    const isVip = count < VIP_LIMIT;
    const tier = isVip ? 'vip' : 'premium';

    const data = {
      wallet,
      tier,
      registeredAt: new Date().toISOString(),
      hasCreatedToken: false,
      createdAt: new Date().toISOString(),
    };
    
    // Redis'e kaydet
    await redis.set(`preregister:${wallet}`, JSON.stringify(data));
    await redis.sadd('preregister:list', wallet);
    await redis.sadd(`preregister:${tier}`, wallet);
    
    // Sayaçları güncelle
    await redis.incr(`stats:${tier}:count`);
    await redis.incr('stats:total:count');

    return NextResponse.json({
      success: true,
      tier,
      rank: count + 1,
      total: MAX_LIMIT,
      vipLimit: VIP_LIMIT,
    });
  } catch (error: any) {
    console.error('Preregister error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (wallet) {
      // Tekil kullanıcı sorgusu
      const data = await redis.get(`preregister:${wallet}`);
      if (!data) {
        return NextResponse.json({ success: false, registered: false });
      }
      const userData = JSON.parse(data as string);
      return NextResponse.json({
        success: true,
        registered: true,
        tier: userData.tier,
        hasCreatedToken: userData.hasCreatedToken || false,
      });
    }

    // İstatistikler
    const total = await redis.scard('preregister:list');
    const vip = await redis.scard('preregister:vip');
    const premium = total - vip;
    const launchReady = total >= MAX_LIMIT;

    return NextResponse.json({
      success: true,
      stats: {
        total,
        vip,
        premium,
        maxLimit: MAX_LIMIT,
        vipLimit: VIP_LIMIT,
        launchReady,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
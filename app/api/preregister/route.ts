import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';

const MAX_LIMIT = 2000;

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

    const isVip = count < 500;
    const tier = isVip ? 'vip' : 'premium';

    // Kaydet
    const data = {
      wallet,
      tier,
      registeredAt: new Date().toISOString(),
      referrals: 0,
    };
    await redis.set(`preregister:${wallet}`, JSON.stringify(data));
    await redis.sadd('preregister:list', wallet);
    if (isVip) {
      await redis.sadd('preregister:vip', wallet);
    } else {
      await redis.sadd('preregister:premium', wallet);
    }

    return NextResponse.json({
      success: true,
      tier,
      rank: count + 1,
      total: MAX_LIMIT,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
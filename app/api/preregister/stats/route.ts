import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const total = await redis.scard('preregister:list');
    const vip = await redis.scard('preregister:vip');
    const premium = total - vip;

    return NextResponse.json({
      success: true,
      stats: {
        total,
        vip,
        premium,
        maxLimit: 2000,
        vipLimit: 500,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
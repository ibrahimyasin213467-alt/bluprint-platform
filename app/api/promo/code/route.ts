import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.json({ success: false, error: 'Code required' }, { status: 400 });
  }
  
  try {
    const wallet = await redis.get(`promocode:wallet:${code.toUpperCase()}`);
    
    if (wallet) {
      return NextResponse.json({
        success: true,
        wallet,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid promo code',
      });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
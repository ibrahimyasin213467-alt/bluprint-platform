import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';

const MAX_LIMIT = 2000;

export async function GET() {
  try {
    const total = await redis.scard('preregister:list');
    const launchReady = total >= MAX_LIMIT;
    
    return NextResponse.json({
      success: true,
      launchReady,
      total,
      needed: MAX_LIMIT - total,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
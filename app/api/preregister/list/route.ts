import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const allWallets = await redis.smembers('preregister:list');
    const registrations: any[] = [];
    
    for (const wallet of allWallets) {
      const data = await redis.get(`preregister:${wallet as string}`);
      if (data) {
        registrations.push(JSON.parse(data as string));
      }
    }
    
    registrations.sort((a, b) => 
      new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
    );
    
    return NextResponse.json({
      success: true,
      registrations,
    });
  } catch (error: any) {
    console.error('List error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { redis } from '@/app/lib/redis';

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
const PLATFORM_WALLET = new PublicKey(process.env.PLATFORM_WALLET!);
const BOOST_DURATION_DAYS = 4;
const BOOST_PRICE = 0.1 * 1e9; // 0.1 SOL in lamports

export async function POST(req: Request) {
  try {
    const { mint, symbol, name, image, userWallet, signature } = await req.json();
    
    // 1. Transaction doğrula (0.1 SOL ödenmiş mi?)
    const tx = await connection.getTransaction(signature);
    if (!tx) throw new Error('Transaction not found');
    
    // 2. Mevcut boost sayısını al
    let boostCount = 1;
    const existingStr = await redis.get(`boost:stats:${mint}`);
    if (existingStr) {
      const existingData = typeof existingStr === 'string' ? JSON.parse(existingStr) : existingStr;
      boostCount = existingData.boostCount + 1;
    }
    
    // 3. 4 gün sonra bitecek şekilde kaydet
    const expiresAt = Date.now() + (BOOST_DURATION_DAYS * 24 * 60 * 60 * 1000);
    
    const boostData = {
      mint,
      symbol,
      name,
      image,
      boostCount,
      expiresAt,
      userWallet,
      boostedAt: Date.now(),
    };
    
    // Aktif boost olarak kaydet (4 gün TTL)
    await redis.set(`boost:active:${mint}`, JSON.stringify(boostData), {
      ex: BOOST_DURATION_DAYS * 24 * 60 * 60
    });
    
    // İstatistik kaydet
    await redis.set(`boost:stats:${mint}`, JSON.stringify({ boostCount, lastBoost: Date.now() }));
    
    // Leaderboard'a ekle (sıralama için)
    await redis.zadd('boost:leaderboard', { score: boostCount, member: mint });
    
    // Aktivite kaydet
    await redis.lpush('activity:feed', JSON.stringify({
      type: 'boost',
      mint,
      symbol,
      userWallet,
      timestamp: Date.now(),
    }));
    
    return NextResponse.json({ success: true, boostCount });
  } catch (error: any) {
    console.error('Boost error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
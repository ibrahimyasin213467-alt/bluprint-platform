import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';
import { Connection, PublicKey } from '@solana/web3.js';

const RPC_URL = "https://solana-mainnet.g.alchemy.com/v2/HOfnwF22z5T8BCHNl_KIo";

export async function POST(req: NextRequest) {
  try {
    const { wallet, mintAddress } = await req.json();

    if (!wallet || !mintAddress) {
      return NextResponse.json({ success: false, error: 'Wallet and mint address required' }, { status: 400 });
    }

    // Önkayıt kontrolü
    const preregisterData = await redis.get(`preregister:${wallet}`);
    if (!preregisterData) {
      return NextResponse.json({ success: false, error: 'Not registered for preregister' }, { status: 400 });
    }

    const userData = JSON.parse(preregisterData as string);
    if (userData.hasCreatedToken) {
      return NextResponse.json({ success: false, error: 'Token already verified' }, { status: 400 });
    }

    // Token'ın gerçekten bu wallet tarafından oluşturulduğunu kontrol et
    const connection = new Connection(RPC_URL, 'confirmed');
    const mint = new PublicKey(mintAddress);
    const tokenSupply = await connection.getTokenSupply(mint);
    
    if (!tokenSupply.value) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 400 });
    }

    // Token oluşturulmuş, kullanıcıyı aktif et
    userData.hasCreatedToken = true;
    userData.tokenCreatedAt = new Date().toISOString();
    userData.mintAddress = mintAddress;
    
    await redis.set(`preregister:${wallet}`, JSON.stringify(userData));
    await redis.sadd('preregister:active', wallet);
    await redis.sadd(`preregister:active:${userData.tier}`, wallet);

    return NextResponse.json({
      success: true,
      message: 'Token verified! Your perks are now active.',
      tier: userData.tier,
    });
  } catch (error: any) {
    console.error('Verify token error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
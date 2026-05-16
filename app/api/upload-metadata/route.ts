import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, symbol, description, image, external_url, twitter, telegram } = await req.json();

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      return NextResponse.json({ success: false, error: 'Pinata not configured' }, { status: 500 });
    }

    const metadata = {
      name,
      symbol: symbol.toUpperCase(),
      description: description || 'Launched on BluPrint Platform',
      image: image || 'https://gateway.pinata.cloud/ipfs/QmaZYRoR1eBSqESX4Fo5NR28CZPNig9YuZfJsBzmG7KPe3',
      external_url: external_url || 'https://bluprint.fun',
      attributes: [
        { trait_type: 'Platform', value: 'BluPrint' },
        { trait_type: 'Type', value: 'Meme Coin' },
        { trait_type: 'Twitter', value: twitter || '' },
        { trait_type: 'Telegram', value: telegram || '' },
      ],
    };

    const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: { name: `metadata-${name}-${Date.now()}` },
      }),
    });

    const data = await res.json();
    if (!data.IpfsHash) throw new Error('IPFS upload failed');

    return NextResponse.json({
      success: true,
      uri: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
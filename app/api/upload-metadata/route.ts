import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const metadata = await req.json();

    // Validate required fields
    if (
      !metadata.name ||
      !metadata.symbol ||
      !metadata.description ||
      !metadata.image
    ) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required metadata fields: name, symbol, description, image required' 
        },
        { status: 400 }
      );
    }

    // Optional: Validate image URL format
    if (!metadata.image.startsWith('https://')) {
      return NextResponse.json(
        { success: false, error: 'Image must be a valid HTTPS URL' },
        { status: 400 }
      );
    }

    const pinataRes = await fetch(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!pinataRes.ok) {
      const error = await pinataRes.text();
      console.error('Pinata error:', error);
      return NextResponse.json(
        { success: false, error: 'Pinata upload failed' },
        { status: 500 }
      );
    }

    const pinataData = await pinataRes.json();

    return NextResponse.json({
      success: true,
      uri: `https://gateway.pinata.cloud/ipfs/${pinataData.IpfsHash}`,
      hash: pinataData.IpfsHash,
    });
  } catch (err: any) {
    console.error('Metadata upload error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}
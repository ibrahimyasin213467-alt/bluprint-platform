import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('logo') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Pinata JWT'yi server-side'dan al
    const pinataJwt = process.env.PINATA_JWT; // NOT: NEXT_PUBLIC_ yok!
    
    if (!pinataJwt) {
      console.error("Pinata JWT not configured on server");
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    // Pinata'ya yükle
    const pinataFormData = new FormData();
    pinataFormData.append('file', file);

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pinataJwt}`,
      },
      body: pinataFormData,
    });

    const data = await res.json();
    
    if (!data.IpfsHash) {
      throw new Error('Pinata upload failed');
    }

    const url = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
    
    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
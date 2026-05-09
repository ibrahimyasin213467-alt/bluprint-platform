import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('logo') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }
    
    // MIME type kontrolü
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type. Use PNG, JPG, or WEBP' }, { status: 400 });
    }
    
    // Boyut kontrolü
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'File too large. Max 2MB' }, { status: 400 });
    }
    
    const pinataJwt = process.env.PINATA_JWT;
    
    // Vercel'deysek Pinata'ya yükle
    if (process.env.VERCEL === '1' || !pinataJwt) {
      if (!pinataJwt) {
        return NextResponse.json({ success: false, error: 'Pinata JWT not configured' }, { status: 500 });
      }
      
      // Pinata'ya yükle
      const pinataFormData = new FormData();
      pinataFormData.append('file', file);
      
      const uploadRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${pinataJwt}`,
        },
        body: pinataFormData,
      });
      
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) {
        return NextResponse.json({ success: false, error: uploadData.error || 'Upload to Pinata failed' }, { status: 500 });
      }
      
      const url = `https://gateway.pinata.cloud/ipfs/${uploadData.IpfsHash}`;
      return NextResponse.json({ success: true, url });
    }
    
    // Local'deysek dosya sistemine yaz (geliştirme için)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const ext = file.type.split('/')[1];
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`;
    const uploadDir = './public/uploads';
    
    // Sharp olmadan da çalışsın diye kaldırdık, sadece dosya yaz
    if (!require('fs').existsSync(uploadDir)) {
      require('fs').mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = require('path').join(uploadDir, filename);
    require('fs').writeFileSync(filePath, buffer);
    
    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
    });
    
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
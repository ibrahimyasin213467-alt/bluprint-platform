import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // output: 'standalone', // <--- BUNU SİL VEYA YORUM SATIRI YAP

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.solana.com https://*.alchemy.com https://*.pinata.cloud https://*.upstash.io https://*.phantom.app blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.solana.com https://*.alchemy.com https://*.pinata.cloud https://*.upstash.io wss://*.walletconnect.com https://*.phantom.app; frame-src 'self' https://*.phantom.app; worker-src 'self' blob:;"
          }
        ],
      },
    ];
  },
};

export default nextConfig;
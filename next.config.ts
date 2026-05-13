import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.solana.com https://*.alchemy.com https://*.pinata.cloud https://*.upstash.io https://*.phantom.app; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.solana.com https://*.alchemy.com https://*.pinata.cloud https://*.upstash.io wss://*.walletconnect.com https://*.phantom.app; frame-src 'self' https://*.phantom.app; worker-src 'self' blob:;"
          }
        ],
      },
    ];
  },
};

export default nextConfig;
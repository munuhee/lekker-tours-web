import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Admin-uploaded media is served by the Express API from /uploads.
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/uploads/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '4000', pathname: '/uploads/**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
};

export default nextConfig;

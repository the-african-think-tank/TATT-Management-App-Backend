import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',       // empty = match any port (covers 5000, 3000, 3001, etc.)
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**', // allow any HTTPS origin for future CDN/S3 use
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

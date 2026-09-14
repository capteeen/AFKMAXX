import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['127.0.0.1:4173', 'localhost:4173']
    }
  }
};

export default nextConfig;

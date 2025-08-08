import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['api.imgbb.com', 'i.ibb.co'],
  },
};

export default nextConfig;

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // 将来的な画像最適化やAPI Routes設定をここに追加可能
  images: {
    domains: ['tile.openstreetmap.org'],
  },
  env: {
    ORS_API_KEY: process.env.ORS_API_KEY || '',
  },
}

export default nextConfig

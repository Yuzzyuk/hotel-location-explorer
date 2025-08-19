import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hotel Location Explorer - Isochrone Maps',
  description: 'Explore hotel locations with walking, transit, and taxi isochrones in Berlin and Paris',
  keywords: 'hotel, location, isochrone, map, travel, Berlin, Paris',
  authors: [{ name: 'Hotel Explorer Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

/**
 * ルートレイアウト：全ページの基本構造を定義
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}

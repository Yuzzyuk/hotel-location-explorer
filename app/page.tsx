'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Controls from '@/components/Controls'
import Legend from '@/components/Legend'
import PoiList from '@/components/PoiList'
import Footer from '@/components/Footer'
import type { City, TravelMode, POICategory, POI } from '@/lib/types'
import berlinPOIsData from '@/data/pois/berlin.json'
import parisPOIsData from '@/data/pois/paris.json'

// 型アサーションで POI[] 型として扱う
const berlinPOIs = berlinPOIsData as POI[]
const parisPOIs = parisPOIsData as POI[]

// Leafletは SSR に対応していないため動的インポート
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-gray-600">Loading map...</div>
    </div>
  ),
})

const HOTEL_COORDS = {
  berlin: { lat: 52.5200, lng: 13.4050, name: 'Hotel Berlin Central' },
  paris: { lat: 48.8566, lng: 2.3522, name: 'Hotel Paris Opera' },
}

/**
 * メインページコンポーネント：URL同期とステート管理
 */
function HomePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // URL パラメータから初期値を取得
  const [city, setCity] = useState<City>(
    (searchParams.get('city') as City) || 'berlin'
  )
  const [mode, setMode] = useState<TravelMode>(
    (searchParams.get('mode') as TravelMode) || 'walk'
  )
  const [time, setTime] = useState<number>(
    parseInt(searchParams.get('time') || '10')
  )
  const [categories, setCategories] = useState<POICategory[]>(() => {
    const catParam = searchParams.get('cat')
    return catParam
      ? (catParam.split(',') as POICategory[])
      : ['sights', 'station']
  })

  const [filteredPOIs, setFilteredPOIs] = useState<POI[]>([])

  // POI データの取得
  const allPOIs: POI[] = city === 'berlin' ? berlinPOIs : parisPOIs

  // URL 更新処理
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('city', city)
    params.set('mode', mode)
    params.set('time', time.toString())
    params.set('cat', categories.join(','))
    router.push(`?${params.toString()}`, { scroll: false })
  }, [city, mode, time, categories, router])

  const hotelCoords = HOTEL_COORDS[city]

  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 左サイドバー: コントロール */}
        <aside className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-4 overflow-y-auto">
          <Controls
            city={city}
            mode={mode}
            time={time}
            categories={categories}
            onCityChange={setCity}
            onModeChange={setMode}
            onTimeChange={setTime}
            onCategoriesChange={setCategories}
          />
          <div className="mt-6">
            <Legend mode={mode} />
          </div>
        </aside>

        {/* 中央: 地図 */}
        <div className="flex-1 relative">
          <Map
            hotelCoords={hotelCoords}
            mode={mode}
            time={time}
            categories={categories}
            pois={allPOIs}
            onFilteredPOIsChange={setFilteredPOIs}
          />
        </div>

        {/* 右サイドバー: POI リスト */}
        <aside className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 overflow-y-auto">
          <PoiList pois={filteredPOIs} hotelName={hotelCoords.name} />
        </aside>
      </main>

      <Footer />
    </div>
  )
}

/**
 * Suspense境界でラップしたページコンポーネント
 */
export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <HomePage />
    </Suspense>
  )
}

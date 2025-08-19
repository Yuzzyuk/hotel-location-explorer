'use client'

import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { TravelMode, POI, POICategory } from '@/lib/types'
import { generateMockIsochrone } from '@/lib/isochrones/mock'
import { fetchORSIsochrone } from '@/lib/isochrones/openroute'
import type { FeatureCollection, Polygon } from 'geojson'

// Leaflet アイコンの修正（Next.js での問題回避）
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface MapProps {
  hotelCoords: { lat: number; lng: number; name: string }
  mode: TravelMode
  time: number
  categories: POICategory[]
  pois: POI[]
  onFilteredPOIsChange: (pois: POI[]) => void
}

/**
 * 地図の中心を更新するコンポーネント
 */
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

/**
 * メイン地図コンポーネント：isochrone表示とPOIフィルタリング
 */
export default function Map({
  hotelCoords,
  mode,
  time,
  categories,
  pois,
  onFilteredPOIsChange,
}: MapProps) {
  const [isochrones, setIsochrones] = useState<FeatureCollection<Polygon> | null>(null)
  const [loading, setLoading] = useState(false)

  // Isochrone の取得
  useEffect(() => {
    const fetchIsochrones = async () => {
      setLoading(true)
      try {
        // 環境変数チェック
        const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY || ''
        let data: FeatureCollection<Polygon> | null = null

        if (apiKey) {
          // ORS API を試す
          try {
            data = await fetchORSIsochrone(
              hotelCoords.lat,
              hotelCoords.lng,
              mode,
              [5, 10, 15, 20],
              apiKey
            )
          } catch (error) {
            console.warn('ORS API failed, falling back to mock:', error)
          }
        }

        // フォールバック: モックデータ
        if (!data) {
          data = generateMockIsochrone(
            hotelCoords.lat,
            hotelCoords.lng,
            mode,
            [5, 10, 15, 20]
          )
        }

        setIsochrones(data)
      } catch (error) {
        console.error('Failed to fetch isochrones:', error)
        // エラー時もモックを表示
        const mockData = generateMockIsochrone(
          hotelCoords.lat,
          hotelCoords.lng,
          mode,
          [5, 10, 15, 20]
        )
        setIsochrones(mockData)
      } finally {
        setLoading(false)
      }
    }

    fetchIsochrones()
  }, [hotelCoords, mode])

  // POI フィルタリング（isochrone内判定）
  const filteredPOIs = useMemo(() => {
    if (!isochrones || !isochrones.features.length) return []

    // 選択された時間のisochrone を取得
    const relevantIsochrone = isochrones.features.find((feature) => {
      const featureTime = feature.properties?.value || feature.properties?.time
      return featureTime === time * 60 // 分を秒に変換
    })

    if (!relevantIsochrone) return []

    // カテゴリフィルタ
    const categoryFiltered = pois.filter((poi) =>
      categories.includes(poi.category)
    )

    // Isochrone 内判定（簡易版: bounding box チェック）
    const filtered = categoryFiltered.filter((poi) => {
      // より正確な判定には turf.js の pointInPolygon を使用可能
      // ここでは簡易的に距離ベースで判定
      const distance = Math.sqrt(
        Math.pow(poi.lat - hotelCoords.lat, 2) +
        Math.pow(poi.lng - hotelCoords.lng, 2)
      )
      const maxDistance = time * 0.002 // 簡易的な距離計算
      return distance <= maxDistance
    })

    return filtered
  }, [isochrones, time, categories, pois, hotelCoords])

  // フィルタ結果を親コンポーネントに通知
  useEffect(() => {
    onFilteredPOIsChange(filteredPOIs)
  }, [filteredPOIs, onFilteredPOIsChange])

  // POI アイコンの作成
  const createPOIIcon = (category: POICategory) => {
    const colors: Record<POICategory, string> = {
      sights: '#FF6B6B',
      food: '#4ECDC4',
      cafe: '#8B6F47',
      museum: '#9B59B6',
      station: '#3498DB',
    }

    return L.divIcon({
      html: `<div style="background-color: ${colors[category]}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      className: 'custom-div-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
  }

  // Isochrone スタイル
  const isochroneStyle = (feature: any) => {
    const time = (feature.properties?.value || feature.properties?.time) / 60
    const opacity = 0.15 - (time - 5) * 0.02
    const colors: Record<TravelMode, string> = {
      walk: '#00AA55',
      transit: '#0066CC',
      taxi: '#FF6633',
    }

    return {
      fillColor: colors[mode],
      weight: 2,
      opacity: 0.8,
      color: colors[mode],
      fillOpacity: opacity,
    }
  }

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-brand-blue border-t-transparent rounded-full"></div>
            <span className="text-sm">Loading isochrones...</span>
          </div>
        </div>
      )}

      <MapContainer
        center={[hotelCoords.lat, hotelCoords.lng]}
        zoom={13}
        className="w-full h-full"
        zoomControl={true}
      >
        <ChangeView center={[hotelCoords.lat, hotelCoords.lng]} zoom={13} />
        
        {/* OSM タイル - 将来的に他のプロバイダに切り替え可能 */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Isochrones */}
        {isochrones && (
          <GeoJSON
            key={`${mode}-${time}`}
            data={isochrones}
            style={isochroneStyle}
          />
        )}

        {/* ホテルマーカー */}
        <Marker position={[hotelCoords.lat, hotelCoords.lng]}>
          <Popup>
            <div className="font-semibold text-lg">{hotelCoords.name}</div>
            <div className="text-sm text-gray-600">4-Star Hotel</div>
          </Popup>
        </Marker>

        {/* POI マーカー */}
        {filteredPOIs.map((poi) => (
          <Marker
            key={poi.id}
            position={[poi.lat, poi.lng]}
            icon={createPOIIcon(poi.category)}
          >
            <Popup>
              <div className="font-semibold">{poi.name}</div>
              <div className="text-sm text-gray-600 capitalize">{poi.category}</div>
              {poi.description && (
                <div className="text-sm mt-1">{poi.description}</div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

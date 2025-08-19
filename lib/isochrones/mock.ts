import type { FeatureCollection, Polygon } from 'geojson'
import type { TravelMode } from '@/lib/types'

/**
 * モックisochroneデータを生成（同心円ベース）
 */
export function generateMockIsochrone(
  lat: number,
  lng: number,
  mode: TravelMode,
  times: number[] // 分単位
): FeatureCollection<Polygon> {
  // 移動速度の定義 (km/h)
  const speeds: Record<TravelMode, number> = {
    walk: 5, // 5 km/h
    transit: 15, // 15 km/h (平均、待ち時間含む)
    taxi: 25, // 25 km/h (都市部の平均)
  }

  const speed = speeds[mode]

  // 楕円の歪み係数（緯度による補正）
  const latRad = (lat * Math.PI) / 180
  const lngCorrection = Math.cos(latRad)

  const features = times.map((minutes) => {
    // 距離計算 (km)
    const distance = (speed * minutes) / 60

    // 度数への変換（概算: 1度 ≈ 111km）
    const latDelta = distance / 111
    const lngDelta = distance / (111 * lngCorrection)

    // 多角形の頂点数
    const points = 32

    // 楕円形の多角形を生成（より自然な形状）
    const coordinates = []
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * 2 * Math.PI
      
      // ランダムな変動を加えて自然な形に
      const randomFactor = 0.9 + Math.random() * 0.2
      
      // 楕円の座標計算
      const pointLat = lat + latDelta * Math.sin(angle) * randomFactor
      const pointLng = lng + lngDelta * Math.cos(angle) * randomFactor
      
      coordinates.push([pointLng, pointLat])
    }

    return {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [coordinates],
      },
      properties: {
        value: minutes * 60, // 秒に変換
        time: minutes * 60,
        mode: mode,
        isMock: true, // モックデータであることを示すフラグ
      },
    }
  })

  // 時間の降順でソート（大きい範囲を先に描画）
  features.sort((a, b) => b.properties.value - a.properties.value)

  return {
    type: 'FeatureCollection',
    features,
  }
}

/**
 * POIがisochrone内にあるかチェック（簡易版）
 */
export function isPointInIsochrone(
  pointLat: number,
  pointLng: number,
  centerLat: number,
  centerLng: number,
  mode: TravelMode,
  minutes: number
): boolean {
  const speeds: Record<TravelMode, number> = {
    walk: 5,
    transit: 15,
    taxi: 25,
  }

  const speed = speeds[mode]
  const maxDistance = (speed * minutes) / 60 // km

  // 緯度経度から距離を概算（Haversine formula の簡易版）
  const latDiff = Math.abs(pointLat - centerLat)
  const lngDiff = Math.abs(pointLng - centerLng)
  
  const latDistance = latDiff * 111 // km
  const lngDistance = lngDiff * 111 * Math.cos((centerLat * Math.PI) / 180) // km
  
  const distance = Math.sqrt(latDistance ** 2 + lngDistance ** 2)

  return distance <= maxDistance
}

// 将来の拡張: より正確な形状生成
// - 道路ネットワークデータの考慮
// - 地形（川、公園など）の考慮
// - 実際の交通データとの統合

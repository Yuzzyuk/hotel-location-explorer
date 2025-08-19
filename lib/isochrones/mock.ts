import type { FeatureCollection, Polygon } from 'geojson'
import type { TravelMode } from '@/lib/types'

/**
 * モックisochroneデータを生成（同心円ベース・固定形状）
 */
export function generateMockIsochrone(
  lat: number,
  lng: number,
  mode: TravelMode,
  times: number[] // 分単位
): FeatureCollection<Polygon> {
  // 移動速度の定義 (km/h) - 現実的な速度
  const speeds: Record<TravelMode, number> = {
    walk: 4,      // 4 km/h (歩行速度)
    transit: 20,  // 20 km/h (都市部の公共交通、待ち時間・乗り換え含む平均)
    taxi: 35,     // 35 km/h (都市部の車、渋滞考慮)
  }

  const speed = speeds[mode]

  // 楕円の歪み係数（緯度による補正）
  const latRad = (lat * Math.PI) / 180
  const lngCorrection = Math.cos(latRad)

  const features = times.map((minutes, index) => {
    // 距離計算 (km)
    const distance = (speed * minutes) / 60

    // 度数への変換（概算: 1度 ≈ 111km）
    const latDelta = distance / 111
    const lngDelta = distance / (111 * lngCorrection)

    // 多角形の頂点数
    const points = 48 // 滑らかな円

    // 固定された形状パターン（ランダム要素なし）
    const coordinates = []
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * 2 * Math.PI
      
      // モードごとに固定の変形パターン
      let variationFactor = 1.0
      
      if (mode === 'walk') {
        // 徒歩: 完全な円形
        variationFactor = 1.0
      } else if (mode === 'transit') {
        // 公共交通: 駅の配置を想定した星型
        // 8方向（45度ごと）に伸びる
        const angleNorm = (angle % (Math.PI / 4)) / (Math.PI / 4)
        variationFactor = 0.85 + 0.3 * (1 - Math.abs(angleNorm - 0.5) * 2)
      } else if (mode === 'taxi') {
        // タクシー: 主要道路沿い（十字型に伸びる）
        const isMainDirection = 
          Math.abs(Math.sin(angle)) < 0.3 || 
          Math.abs(Math.cos(angle)) < 0.3
        variationFactor = isMainDirection ? 1.15 : 0.95
      }
      
      // 座標計算（固定値）
      const pointLat = lat + latDelta * Math.sin(angle) * variationFactor
      const pointLng = lng + lngDelta * Math.cos(angle) * variationFactor
      
      coordinates.push([pointLng, pointLat])
    }

    // 透明度を時間に応じて設定
    const opacityMap: Record<number, number> = {
      5: 0.40,
      10: 0.30,
      15: 0.20,
      20: 0.10
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
        speed: speed,
        distance: distance.toFixed(1),
        isMock: true,
        opacity: opacityMap[minutes] || 0.1,
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
 * POIがisochrone内にあるかチェック（改善版）
 */
export function isPointInIsochrone(
  pointLat: number,
  pointLng: number,
  centerLat: number,
  centerLng: number,
  mode: TravelMode,
  minutes: number
): boolean {
  // 修正された速度
  const speeds: Record<TravelMode, number> = {
    walk: 4,
    transit: 20,
    taxi: 35,
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

// デバッグ用: 各モードの到達距離を出力
export function getReachableDistance(mode: TravelMode, minutes: number): string {
  const speeds: Record<TravelMode, number> = {
    walk: 4,
    transit: 20,
    taxi: 35,
  }
  
  const distance = (speeds[mode] * minutes) / 60
  return `${mode}: ${distance.toFixed(1)}km in ${minutes}min (${speeds[mode]}km/h)`
}

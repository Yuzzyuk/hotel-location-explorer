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
  // 移動速度の定義 (km/h) - 現実的な速度に修正
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
    const points = 48 // より滑らかな円にするため増やす

    // 形状の変動を加える（モードごとに異なるパターン）
    const coordinates = []
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * 2 * Math.PI
      
      // モードごとに異なる変動パターン
      let variationFactor = 1.0
      
      if (mode === 'walk') {
        // 徒歩: ほぼ円形（どの方向も同じ速度）
        variationFactor = 0.95 + Math.random() * 0.1
      } else if (mode === 'transit') {
        // 公共交通: 駅の配置により不規則
        variationFactor = 0.85 + Math.random() * 0.3
      } else if (mode === 'taxi') {
        // タクシー: 主要道路沿いに広がる
        // 東西南北方向（主要道路）はより遠くまで
        const isMainDirection = 
          Math.abs(Math.sin(angle)) < 0.2 || 
          Math.abs(Math.cos(angle)) < 0.2
        variationFactor = isMainDirection 
          ? 1.1 + Math.random() * 0.1
          : 0.9 + Math.random() * 0.1
      }
      
      // 楕円の座標計算
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

// 将来の拡張: より正確な形状生成
// - 道路ネットワークデータの考慮
// - 地形（川、公園など）の考慮
// - 実際の交通データとの統合

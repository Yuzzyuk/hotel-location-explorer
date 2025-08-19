import type { FeatureCollection, Polygon } from 'geojson'
import type { TravelMode } from '@/lib/types'

/**
 * OpenRouteService API を使用してisochroneを取得
 */
export async function fetchORSIsochrone(
  lat: number,
  lng: number,
  mode: TravelMode,
  times: number[], // 分単位
  apiKey: string
): Promise<FeatureCollection<Polygon> | null> {
  // ORS API のプロファイルマッピング
  const profileMap: Record<TravelMode, string> = {
    walk: 'foot-walking',
    transit: 'driving-car', // ORS に公共交通機関プロファイルがないため代替
    taxi: 'driving-car',
  }

  const profile = profileMap[mode]
  const timeSeconds = times.map(t => t * 60).join(',') // 秒に変換

  const url = 'https://api.openrouteservice.org/v2/isochrones/' + profile

  const requestBody = {
    locations: [[lng, lat]], // ORS は [lng, lat] の順序
    range: times.map(t => t * 60), // 秒単位
    range_type: 'time',
    smoothing: 0.9, // スムージング係数
    attributes: ['area', 'total_pop'], // オプション属性
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      console.error('ORS API error:', response.status, response.statusText)
      
      // レート制限やクォータエラーの場合
      if (response.status === 429 || response.status === 403) {
        console.warn('API rate limit or quota exceeded')
      }
      
      return null
    }

    const data = await response.json()

    // ORS のレスポンスをGeoJSON形式に変換
    if (data && data.features) {
      // プロパティに mode を追加
      const features = data.features.map((feature: any) => ({
        ...feature,
        properties: {
          ...feature.properties,
          mode: mode,
          time: feature.properties.value, // 互換性のため
        },
      }))

      // 時間の降順でソート
      features.sort((a: any, b: any) => b.properties.value - a.properties.value)

      return {
        type: 'FeatureCollection',
        features,
      }
    }

    return null
  } catch (error) {
    console.error('Failed to fetch ORS isochrone:', error)
    return null
  }
}

/**
 * APIキーの検証
 */
export function validateORSApiKey(apiKey: string): boolean {
  // 基本的な形式チェック（ORS APIキーは通常32文字以上）
  return apiKey.length >= 32 && /^[a-zA-Z0-9]+$/.test(apiKey)
}

/**
 * エラーハンドリング付きのisochrone取得
 */
export async function getIsochroneWithFallback(
  lat: number,
  lng: number,
  mode: TravelMode,
  times: number[],
  apiKey?: string
): Promise<{ data: FeatureCollection<Polygon>; source: 'ors' | 'mock' }> {
  // APIキーが提供されていて有効な場合
  if (apiKey && validateORSApiKey(apiKey)) {
    try {
      const orsData = await fetchORSIsochrone(lat, lng, mode, times, apiKey)
      
      if (orsData) {
        return { data: orsData, source: 'ors' }
      }
    } catch (error) {
      console.warn('ORS API failed, using mock data:', error)
    }
  }

  // フォールバック: モックデータを使用
  const { generateMockIsochrone } = await import('./mock')
  const mockData = generateMockIsochrone(lat, lng, mode, times)
  
  return { data: mockData, source: 'mock' }
}

// 将来の拡張ポイント:
// - 公共交通機関用の別APIとの統合（Transitland, GTFS など）
// - キャッシュ機能の実装（同じリクエストの再利用）
// - バッチリクエスト対応（複数の地点を一度に処理）

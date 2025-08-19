/**
 * アプリケーション全体で使用する型定義
 */

export type City = 'berlin' | 'paris'

export type TravelMode = 'walk' | 'transit' | 'taxi'

export type POICategory = 'sights' | 'food' | 'cafe' | 'museum' | 'station'

export interface POI {
  id: string
  name: string
  lat: number
  lng: number
  category: POICategory
  description?: string
  rating?: number
}

export interface HotelLocation {
  lat: number
  lng: number
  name: string
}

export interface IsochroneOptions {
  lat: number
  lng: number
  mode: TravelMode
  times: number[] // 分単位
}

// OpenRouteService API レスポンス型
export interface ORSIsochroneResponse {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    geometry: {
      type: 'Polygon'
      coordinates: number[][][]
    }
    properties: {
      value: number // 秒単位
      [key: string]: any
    }
  }>
}

// 将来の拡張用
export interface FilterOptions {
  categories: POICategory[]
  minRating?: number
  maxDistance?: number
}

export interface ShareableState {
  city: City
  mode: TravelMode
  time: number
  categories: POICategory[]
}

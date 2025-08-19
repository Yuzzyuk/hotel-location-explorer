'use client'

import type { POI } from '@/lib/types'

interface PoiListProps {
  pois: POI[]
  hotelName: string
}

/**
 * POIリストコンポーネント：到達可能な場所のリスト表示
 */
export default function PoiList({ pois, hotelName }: PoiListProps) {
  const categoryEmojis: Record<string, string> = {
    sights: '🏛️',
    food: '🍽️',
    cafe: '☕',
    museum: '🎨',
    station: '🚉',
  }

  const categoryColors: Record<string, string> = {
    sights: 'bg-red-100 text-red-800',
    food: 'bg-green-100 text-green-800',
    cafe: 'bg-yellow-100 text-yellow-800',
    museum: 'bg-purple-100 text-purple-800',
    station: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg">Reachable POIs</h2>
        <p className="text-sm text-gray-600 mt-1">
          {pois.length} locations from {hotelName}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {pois.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📍</div>
            <p>No POIs found in the selected isochrone.</p>
            <p className="text-sm mt-2">Try adjusting your filters or time range.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pois.map((poi) => (
              <div
                key={poi.id}
                className="card hover:shadow-md transition-shadow duration-200 animate-slide-in"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl flex-shrink-0">
                    {categoryEmojis[poi.category] || '📍'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {poi.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                          categoryColors[poi.category] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {poi.category}
                      </span>
                      {poi.rating && (
                        <span className="text-xs text-gray-500">
                          ⭐ {poi.rating}
                        </span>
                      )}
                    </div>
                    {poi.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {poi.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pois.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            POIs shown are within the selected time isochrone
          </div>
        </div>
      )}
    </div>
  )
}

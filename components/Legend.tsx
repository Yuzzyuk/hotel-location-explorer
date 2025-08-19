'use client'

import type { TravelMode } from '@/lib/types'

interface LegendProps {
  mode: TravelMode
}

/**
 * 凡例コンポーネント：isochrone の色と時間帯を表示
 */
export default function Legend({ mode }: LegendProps) {
  const modeColors: Record<TravelMode, string> = {
    walk: '#00AA55',
    transit: '#0066CC', 
    taxi: '#FF6633',
  }

  const modeLabels: Record<TravelMode, string> = {
    walk: 'Walking',
    transit: 'Public Transit',
    taxi: 'Taxi/Car',
  }

  const timeRanges = [
    { minutes: 5, opacity: 0.35 },
    { minutes: 10, opacity: 0.25 },
    { minutes: 15, opacity: 0.15 },
    { minutes: 20, opacity: 0.08 },
  ]

  return (
    <div className="card">
      <h3 className="font-semibold text-lg mb-3">Isochrone Legend</h3>
      
      <div className="mb-3">
        <div className="text-sm text-gray-600 mb-1">Current Mode:</div>
        <div className="font-medium flex items-center space-x-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: modeColors[mode] }}
          ></div>
          <span>{modeLabels[mode]}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-gray-600">Time Ranges:</div>
        {timeRanges.map((range) => (
          <div key={range.minutes} className="flex items-center space-x-3">
            <div
              className="w-12 h-6 rounded border-2"
              style={{
                backgroundColor: modeColors[mode],
                opacity: range.opacity,
                borderColor: modeColors[mode],
              }}
            ></div>
            <span className="text-sm">{range.minutes} minutes</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div className="mb-2 font-semibold">Mode Colors:</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#00AA55' }}></div>
              <span>Walk = Green</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#0066CC' }}></div>
              <span>Transit = Blue</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FF6633' }}></div>
              <span>Taxi = Orange</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

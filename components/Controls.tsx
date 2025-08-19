'use client'

import { useState } from 'react'
import type { City, TravelMode, POICategory } from '@/lib/types'

interface ControlsProps {
  city: City
  mode: TravelMode
  time: number
  categories: POICategory[]
  onCityChange: (city: City) => void
  onModeChange: (mode: TravelMode) => void
  onTimeChange: (time: number) => void
  onCategoriesChange: (categories: POICategory[]) => void
}

/**
 * コントロールパネル：都市選択、移動モード、時間、POIカテゴリ
 */
export default function Controls({
  city,
  mode,
  time,
  categories,
  onCityChange,
  onModeChange,
  onTimeChange,
  onCategoriesChange,
}: ControlsProps) {
  const [localTime, setLocalTime] = useState(time)
  const [localCategories, setLocalCategories] = useState(categories)

  const handleApply = () => {
    onTimeChange(localTime)
    onCategoriesChange(localCategories)
  }

  const handleReset = () => {
    setLocalTime(10)
    setLocalCategories(['sights', 'station'])
    onTimeChange(10)
    onCategoriesChange(['sights', 'station'])
  }

  const toggleCategory = (cat: POICategory) => {
    setLocalCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat]
    )
  }

  const shareUrl = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    alert('Share URL copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      {/* 都市選択 */}
      <div className="card">
        <h3 className="font-semibold text-lg mb-3">City</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onCityChange('berlin')}
            className={`btn ${
              city === 'berlin' ? 'btn-primary' : 'btn-secondary'
            }`}
            aria-label="Select Berlin"
          >
            Berlin
          </button>
          <button
            onClick={() => onCityChange('paris')}
            className={`btn ${
              city === 'paris' ? 'btn-primary' : 'btn-secondary'
            }`}
            aria-label="Select Paris"
          >
            Paris
          </button>
        </div>
      </div>

      {/* 移動モード */}
      <div className="card">
        <h3 className="font-semibold text-lg mb-3">Travel Mode</h3>
        <div className="space-y-2">
          {(['walk', 'transit', 'taxi'] as TravelMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`w-full text-left px-4 py-2 rounded-lg border-2 transition-all ${
                mode === m
                  ? 'border-brand-blue bg-blue-50 text-brand-blue'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              aria-label={`Select ${m} mode`}
            >
              <div className="flex items-center justify-between">
                <span className="capitalize font-medium">{m}</span>
                <span className="text-sm text-gray-500">
                  {m === 'walk' && '🚶'}
                  {m === 'transit' && '🚊'}
                  {m === 'taxi' && '🚕'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 時間設定 */}
      <div className="card">
        <h3 className="font-semibold text-lg mb-3">Time Range</h3>
        <div className="space-y-3">
          <input
            type="range"
            min="5"
            max="20"
            step="5"
            value={localTime}
            onChange={(e) => setLocalTime(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            aria-label="Select time range"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>5 min</span>
            <span className="font-semibold text-brand-blue">{localTime} min</span>
            <span>20 min</span>
          </div>
        </div>
      </div>

      {/* POIカテゴリ */}
      <div className="card">
        <h3 className="font-semibold text-lg mb-3">POI Categories</h3>
        <div className="space-y-2">
          {(
            [
              { id: 'sights', label: 'Sights', emoji: '🏛️' },
              { id: 'food', label: 'Restaurants', emoji: '🍽️' },
              { id: 'cafe', label: 'Cafes', emoji: '☕' },
              { id: 'museum', label: 'Museums', emoji: '🎨' },
              { id: 'station', label: 'Stations', emoji: '🚉' },
            ] as const
          ).map((cat) => (
            <label
              key={cat.id}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={localCategories.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
                className="w-4 h-4 text-brand-blue focus:ring-brand-blue"
                aria-label={`Toggle ${cat.label}`}
              />
              <span className="flex-1">{cat.label}</span>
              <span>{cat.emoji}</span>
            </label>
          ))}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="space-y-2">
        <button
          onClick={handleApply}
          className="w-full btn btn-primary"
          aria-label="Apply filters"
        >
          Apply Filters
        </button>
        <button
          onClick={handleReset}
          className="w-full btn btn-secondary"
          aria-label="Reset filters"
        >
          Reset
        </button>
        <button
          onClick={shareUrl}
          className="w-full btn bg-gray-100 text-gray-700 hover:bg-gray-200"
          aria-label="Share URL"
        >
          📤 Share URL
        </button>
      </div>
    </div>
  )
}

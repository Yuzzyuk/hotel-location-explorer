'use client'

/**
 * フッターコンポーネント：著作権表記とデータソース情報
 */
export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <div className="mb-2 sm:mb-0">
            © 2025 Hotel Location Explorer. Demo purposes only.
          </div>
          <div className="flex items-center space-x-4">
            <span>Map data © OpenStreetMap contributors</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              Isochrones: {process.env.NEXT_PUBLIC_ORS_API_KEY ? 'OpenRouteService' : 'Mock Data'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

'use client'

/**
 * ヘッダーコンポーネント：アプリケーションタイトルとナビゲーション
 */
export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🏨</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Hotel Location Explorer
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Explore reachable areas with isochrone maps
              </p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-4">
            <button
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Help"
              onClick={() => alert('Explore hotel locations by selecting travel mode, time range, and POI categories. Share your view with the URL!')}
            >
              ❓ Help
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="View on GitHub"
            >
              GitHub
            </a>
          </nav>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Menu"
            onClick={() => alert('Mobile menu - implement as needed')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

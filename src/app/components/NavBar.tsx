import AuthButton from './AuthButton';
import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-12 sm:h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              <Link href='/'>StatStreak</Link>
            </h1>
          </div>

          {/* Right side - Profile and Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link
              href="/leaderboard"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-2 py-1 rounded"
            >
              Leaderboard
            </Link>
            <AuthButton />

            {/* Hamburger Menu */}
            <button className="p-1 sm:p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

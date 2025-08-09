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
              <Link href="/">StatStreak</Link>
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
            <Link
              href="/archive"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-2 py-1 rounded"
            >
              Archive
            </Link>
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
}

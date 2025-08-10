'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-24 bg-gray-50">
      <h1 className="text-4xl font-bold mb-4 text-blue-700">404 - Page Not Found</h1>
      <p className="mb-6 text-gray-600 text-lg">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
      >
        Go Home
      </Link>
    </div>
  );
}
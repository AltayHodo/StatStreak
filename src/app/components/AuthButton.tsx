'use client';

import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState, Suspense } from 'react';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';

function AuthButtonInner({
  className = 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-4 rounded-lg transition-colors duration-200 shadow',
}: {
  className?: string;
}) {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [loading, setLoading] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const params = searchParams.toString();
      const redirectUrl = `${window.location.origin}${pathname}${
        params ? `?${params}` : ''
      }`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Error signing in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (user) {
    return (
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            {user.user_metadata?.avatar_url ? (
              <Image
                src={user.user_metadata.avatar_url}
                alt="Profile"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs sm:text-sm font-medium text-gray-600">
                {user.email?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <span className="hidden sm:block text-sm text-gray-700 max-w-24 truncate">
            {user.user_metadata?.name || user.email}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className={`${className} cursor-pointer`}
    >
      {loading ? 'Loading...' : 'Log In'}
    </button>
  );
}

export default function AuthButton(props: { className?: string }) {
  return (
    <Suspense fallback={<button disabled>Loading...</button>}>
      <AuthButtonInner {...props} />
    </Suspense>
  );
}

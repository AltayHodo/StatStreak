'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

type GameRow = {
  id: number;
  game_date: string;
};

export default function Archive() {
  const supabase = useSupabaseClient();
  const [games, setGames] = useState<GameRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('Games')
        .select('id, game_date')
        .order('game_date', { ascending: false });

      if (!error && data) setGames(data);
      setLoading(false);
    };
    fetchGames();
  }, [supabase]);

  return (
    <>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Game Archive</h1>
        <div className="bg-white rounded-lg shadow border">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-right">Link</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="text-center py-6">
                    Loading...
                  </td>
                </tr>
              ) : games.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center py-6">
                    No games found.
                  </td>
                </tr>
              ) : (
                games.map((game) => (
                  <tr key={game.id} className="border-t">
                    <td className="py-2 px-4">{game.game_date}</td>
                    <td className="py-2 px-4 text-right">
                      <Link
                        href={`/archive/${game.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Play
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

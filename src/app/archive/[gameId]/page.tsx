'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useParams } from 'next/navigation';
import GameBoard from '../../components/GameBoard';
import { DailyGame } from '@/app/types/game';
import Link from 'next/link';

export default function ArchiveGamePage() {
  const supabase = useSupabaseClient();
  const params = useParams();
  const gameId = params?.gameId;
  const [game, setGame] = useState<DailyGame | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('Games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (!error && data) setGame(data);
      setLoading(false);
    };
    if (gameId) fetchGame();
  }, [supabase, gameId]);

  return (
    <>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {loading ? (
          <div>Loading game...</div>
        ) : game ? (
          <GameBoard game={game} archiveMode />
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="text-2xl font-semibold mb-4">
              Game not found.
            </span>
            <Link
              href="/archive"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 shadow"
            >
              Go Back to Archive
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

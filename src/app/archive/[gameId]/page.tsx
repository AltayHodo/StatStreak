'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useParams } from 'next/navigation';
import GameBoard from '../../components/GameBoard';
import { DailyGame } from '@/app/types/game';

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
          <div>Game not found.</div>
        )}
      </div>
    </>
  );
}

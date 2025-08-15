'use client';

import { useUser } from '@supabase/auth-helpers-react';
import GameBoard from './GameBoard';
import { GameBoardProps } from '../types/game';

export default function GameBoardWrapper(props: GameBoardProps) {
  const user = useUser();
  return (
    <GameBoard key={`${user?.id ?? 'anon'}-${props.game.id}`} {...props} />
  );
}

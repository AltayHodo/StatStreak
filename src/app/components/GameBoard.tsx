'use client';

import { DailyGame } from '../types/game';

type GameboardProps = {
  game: DailyGame;
};

export default function GameBoard({ game }: GameboardProps) {
  console.log('Game data:', game);
  return (
    <>
      {game.selected_players.map((player) => (
        <div key={player.player_name}>{player.player_name}</div>
      ))}
    </>
  );
}

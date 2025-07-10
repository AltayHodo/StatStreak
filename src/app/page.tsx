import { supabase } from './utils/supabaseClient';
import { generateDailyGame } from './lib/gameGenerator';
import GameBoard from './components/GameBoard';

export default async function Home() {
  const today = new Date().toISOString().split('T')[0];

  let { data: todaysGame } = await supabase
    .from('Games')
    .select('*')
    .eq('game_date', today)
    .single();

  if (!todaysGame) {
    todaysGame = await generateDailyGame(today);
  }

  return (
    <div>
      <GameBoard game={todaysGame} />
    </div>
  );
}

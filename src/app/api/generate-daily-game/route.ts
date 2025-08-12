import { NextResponse } from 'next/server';
import { generateDailyGame } from '@/app/lib/gameGenerator';
import { supabase } from '@/app/utils/supabaseClient';

export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  let { data: todaysGame } = await supabase
    .from('Games')
    .select('*')
    .eq('game_date', today)
    .single();

  if (!todaysGame) {
    todaysGame = await generateDailyGame(today);
  }

  return NextResponse.json({ success: true, game: todaysGame });
}
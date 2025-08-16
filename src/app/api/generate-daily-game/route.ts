import { NextResponse } from 'next/server';
import { generateDailyGame } from '@/app/lib/gameGenerator';
import { supabaseAdmin } from '@/app/utils/supabaseAdmin';

export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  let { data: todaysGame } = await supabaseAdmin
    .from('Games')
    .select('*')
    .eq('game_date', today)
    .single();

  if (!todaysGame) {
    todaysGame = await generateDailyGame(today, supabaseAdmin);
  }

  return NextResponse.json({ success: true, game: todaysGame });
}
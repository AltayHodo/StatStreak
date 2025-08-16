import { NextResponse } from 'next/server';
import { generateDailyGame } from '@/app/lib/gameGenerator';
import { supabaseAdmin } from '@/app/utils/supabaseAdmin';
import { format } from 'date-fns-tz';

export async function GET() {
  const timeZone = 'America/Los_Angeles';
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd', { timeZone });

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

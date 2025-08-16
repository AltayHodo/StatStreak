import { Player, StatCategory } from '../types/player';
import { SupabaseClient } from '@supabase/supabase-js';

export async function generateDailyGame(
  date: string,
  supabase: SupabaseClient
) {
  const { data: players, error: fetchError } = await supabase
    .from('Players')
    .select('*');
  if (fetchError || !players) {
    console.error('Error fetching players:', fetchError);
    return;
  }
  const selectedPlayers = getRandomPlayers(players, 5);

  const statCategories = [
    { key: 'points_per_game', display_name: 'Points Per Game' },
    { key: 'assists_per_game', display_name: 'Assists Per Game' },
    { key: 'rebounds_per_game', display_name: 'Rebounds Per Game' },
    { key: 'blocks_per_game', display_name: 'Blocks Per Game' },
    { key: 'steals_per_game', display_name: 'Steals Per Game' },
    { key: 'turnovers_per_game', display_name: 'Turnovers Per Game' },
    { key: 'field_goal_percentage', display_name: 'Field Goal Percentage' },
    { key: 'three_point_percentage', display_name: 'Three Point Percentage' },
    { key: 'free_throw_percentage', display_name: 'Free Throw Percentage' },
    {
      key: 'effective_field_goal_percentage',
      display_name: 'Effective Field Goal Percentage',
    },
    { key: 'three_pointers_per_game', display_name: 'Three Pointers Per Game' },
    { key: 'minutes_played_per_game', display_name: 'Minutes Played Per Game' },
    {
      key: 'player_efficiency_rating',
      display_name: 'Player Efficiency Rating',
    },
    { key: 'box_plus_minus', display_name: 'Box Plus Minus' },
    { key: 'usage_rate', display_name: 'Usage Rate' },
    { key: 'total_minutes_played', display_name: 'Total Minutes Played' },
    { key: 'total_points', display_name: 'Total Points' },
    { key: 'total_rebounds', display_name: 'Total Rebounds' },
    { key: 'total_assists', display_name: 'Total Assists' },
    { key: 'total_field_goals', display_name: 'Total Field Goals' },
    { key: 'total_three_pointers', display_name: 'Total Three Pointers' },
    { key: 'total_steals', display_name: 'Total Steals' },
    { key: 'total_blocks', display_name: 'Total Blocks' },
    { key: 'total_turnovers', display_name: 'Total Turnovers' },
    { key: 'triple_doubles', display_name: 'Triple Doubles' },
  ];
  const selectedCategories = getRandomCategories(statCategories, 10);

  const gameData = {
    game_date: date,
    selected_players: selectedPlayers,
    selected_categories: selectedCategories,
  };

  const { data, error } = await supabase
    .from('Games')
    .insert(gameData)
    .select()
    .single();

  if (error) {
    console.error('Error creating daily game:', error);
    return null;
  }

  return data;
}

function getRandomPlayers(players: Player[], count: number) {
  return players.sort(() => 0.5 - Math.random()).slice(0, count);
}

function getRandomCategories(stats: StatCategory[], count: number) {
  return stats.sort(() => 0.5 - Math.random()).slice(0, count);
}

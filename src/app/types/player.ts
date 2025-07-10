export type Player = {
  id?: string; // Add this for database operations
  player_name: string;
  team_name: string;
  points_per_game: string;
  assists_per_game: string;
  rebounds_per_game: string;
  blocks_per_game: string;
  steals_per_game: string;
  turnovers_per_game: string;
  field_goal_percentage: string;
  three_point_percentage: string;
  free_throw_percentage: string;
  effective_field_goal_percentage: string;
  three_pointers_per_game: string;
  minutes_played_per_game: string;
  player_efficiency_rating?: string;
  usage_rate?: string;
  box_plus_minus?: string;
  total_minutes_played?: string;
  total_points?: string;
  total_rebounds?: string;
  total_assists?: string;
  total_field_goals?: string;
  total_three_pointers?: string;
  total_steals?: string;
  total_blocks?: string;
  total_turnovers?: string;
  triple_doubles?: string;
}

export type StatCategory = {
  key: string;
  display_name: string;
}
import { Player } from "./player";

export interface DailyGame {
  id: string;
  game_date: string;
  selected_players: Player[];
  selected_stats: StatCategory[];
}

export interface StatCategory {
  key: string;
  display_name: string;
  description: string;
}

export interface UserAnswer {
  stat_category: string;
  selected_player_id: string;
  correct_player_id: string;
  is_correct: boolean;
}
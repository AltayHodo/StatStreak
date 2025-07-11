import { Player } from "./player";

export type DailyGame = {
  id: string;
  game_date: string;
  selected_players: Player[];
  selected_categories: StatCategory[];
}

export type StatCategory  = {
  key: string;
  display_name: string;
  description: string;
}

export type UserAnswer = {
  stat_category: string;
  selected_player_id: string;
  correct_player_id: string;
  is_correct: boolean;
}

export type GameResult = {
  category: string;
  userSelection: string;
  correctAnswer: string;
  isCorrect: boolean;
  playerStats: { playerName: string; value: number}[];
}
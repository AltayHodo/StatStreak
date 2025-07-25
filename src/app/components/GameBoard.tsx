'use client';

import { DailyGame, GameResult } from '../types/game';
import { useState } from 'react';
import React from 'react';
import Image from 'next/image';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import AuthButton from './AuthButton';

type GameboardProps = {
  game: DailyGame;
};

export default function GameBoard({ game }: GameboardProps) {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<GameResult[]>([]);

  const user = useUser();
  const supabase = useSupabaseClient();

  if (!game || !game.selected_players || !game.selected_categories) {
    return <div>Loading game...</div>;
  }

  const handlePlayerSelect = (categoryKey: string, playerName: string) => {
    if (submitted) return;
    setSelections((prev) => ({
      ...prev,
      [categoryKey]: playerName,
    }));
  };

  const handleSubmit = async () => {
    const isAllCategoriesSelected = game.selected_categories.every(
      (category) => selections[category.key]
    );

    if (!isAllCategoriesSelected) {
      alert('Please select a player for each category');
      return;
    }

    const results = calculateResults();
    setResults(results);
    setSubmitted(true);

    if (user) {
      await saveGameResults(results);
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const ensureUserExists = async () => {
    if (!user) return;

    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!existingUser) {
        const { error } = await supabase.from('users').insert({
          auth_id: user.id,
          email: user.email,
          username:
            user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          total_score: 0,
          total_guesses: 0,
          accuracy: 0.0,
          total_games: 0,
        });

        if (error) {
          console.log('Error creating user:', error);
        }
      }
    } catch (error) {
      console.error('Error ensuring user exists:', error);
    }
  };

  const saveGameResults = async (results: GameResult[]) => {
    if (!user) return;

    await ensureUserExists();
    try {
      const score = results.filter((r) => r.isCorrect).length;
      const totalQuestions = results.length;

      const guessPromises = game.selected_categories.map(async (category) => {
        const selectedPlayerName = selections[category.key];
        const selectedPlayer = game.selected_players.find(
          (p) => p.player_name === selectedPlayerName
        );
        const isCorrect =
          results.find((r) => r.category === category.display_name)
            ?.isCorrect || false;

        if (selectedPlayer) {
          return supabase.from('guesses').insert({
            user_id: user.id,
            game_id: game.id,
            player_id: selectedPlayer.id,
            category: category.key,
            is_correct: isCorrect,
          });
        }
      });

      await Promise.all(guessPromises.filter(Boolean));
      await updateUserStats(score, totalQuestions);
    } catch (error) {
      console.error('Error saving game results:', error);
    }
  };

  const updateUserStats = async (score: number, totalQuestions: number) => {
    if (!user) return;

    try {
      const { data: currentStats } = await supabase
        .from('users')
        .select('total_games, total_score, total_guesses')
        .eq('auth_id', user.id)
        .single();

      if (currentStats) {
        const newTotalGames = currentStats.total_games + 1;
        const newTotalScore = currentStats.total_score + score;
        const newTotalGuesses = currentStats.total_guesses + totalQuestions;
        const newAccuracy =
          newTotalGuesses > 0 ? (newTotalScore / newTotalGuesses) * 100 : 0;

        await supabase
          .from('users')
          .update({
            total_games: newTotalGames,
            total_score: newTotalScore,
            total_guesses: newTotalGuesses,
            accuracy: newAccuracy,
          })
          .eq('auth_id', user.id);
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  const resetGame = () => {
    setSelections({});
    setSubmitted(false);
    setResults([]);
  };

  const findHighestPlayer = (categoryKey: string) => {
    const playerStats = game.selected_players.map((player) => {
      const statValue = player[categoryKey as keyof typeof player];
      const numericValue = parseFloat(statValue as string) || 0;

      return {
        playerName: player.player_name,
        value: numericValue,
      };
    });

    const sorted = playerStats.sort((a, b) => b.value - a.value);
    const highestValue = sorted[0].value;
    const correctPlayers = sorted.filter(
      (player) => player.value === highestValue
    );

    return {
      correctPlayers,
      highestValue,
      allStats: sorted,
    };
  };

  const calculateResults = (): GameResult[] => {
    return game.selected_categories.map((category) => {
      const { correctPlayers, allStats } = findHighestPlayer(category.key);
      const userSelection = selections[category.key];

      const isCorrect = correctPlayers.some(
        (player) => player.playerName === userSelection
      );

      return {
        category: category.display_name,
        userSelection,
        correctAnswer: correctPlayers.map((p) => p.playerName).join(' / '),
        isCorrect,
        playerStats: allStats,
        correctPlayers,
      };
    });
  };

  const calculateScore = () => {
    return results.filter((result) => result.isCorrect).length;
  };

  // Helper function to get player stat for specific category
  const getPlayerStat = (playerName: string, categoryKey: string) => {
    const player = game.selected_players.find(
      (p) => p.player_name === playerName
    );
    if (!player) return 0;
    const statValue = player[categoryKey as keyof typeof player];
    return parseFloat(statValue as string) || 0;
  };

  // Helper function to check if user's selection was correct for a category
  const isSelectionCorrect = (categoryKey: string, playerName: string) => {
    if (!submitted) return null;
    const result = results.find(
      (r) =>
        r.category ===
        game.selected_categories.find((c) => c.key === categoryKey)
          ?.display_name
    );
    return result?.isCorrect && selections[categoryKey] === playerName;
  };

  // Helper function to check if user's selection was incorrect for a category
  const isSelectionIncorrect = (categoryKey: string, playerName: string) => {
    if (!submitted) return null;
    const result = results.find(
      (r) =>
        r.category ===
        game.selected_categories.find((c) => c.key === categoryKey)
          ?.display_name
    );
    return !result?.isCorrect && selections[categoryKey] === playerName;
  };

  const isCorrectAnswer = (categoryKey: string, playerName: string) => {
    if (!submitted) return false;
    const { correctPlayers } = findHighestPlayer(categoryKey);
    return correctPlayers.some((cp) => cp.playerName === playerName);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                StatStreak
              </h1>
            </div>

            {/* Right side - Profile and Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <AuthButton />

              {/* Hamburger Menu */}
              <button className="p-1 sm:p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Game Instructions */}
        <div className="text-center mb-4 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Daily StatStreak
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
            {!submitted
              ? 'Select which player you think has the highest value for each stat category!'
              : 'Results are shown below - green borders indicate correct picks, red borders indicate incorrect picks.'}
          </p>
        </div>

        {/* Game Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full table-fixed min-w-max">
            {/* Header Row */}
            <thead>
              <tr>
                {/* Empty top-left cell */}
                <th className="bg-gray-50 border-b border-r border-gray-200 p-2 sm:p-4 w-24 sm:w-32 md:w-48 min-w-[6rem]"></th>

                {/* Player Headers */}
                {game.selected_players.map((player) => (
                  <th
                    key={player.player_name}
                    className="bg-gray-50 border-b border-r border-gray-200 p-1 sm:p-2 md:p-4 text-center w-16 sm:w-20 md:w-32 min-w-[4rem] align-top"
                  >
                    <div className="flex flex-col h-full">
                      {/* Fixed height container for images */}
                      <div className="flex justify-center items-start mb-1 sm:mb-2 h-8 sm:h-12 md:h-16">
                        {player.image_url ? (
                          <div className="relative w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 flex-shrink-0">
                            <Image
                              src={player.image_url}
                              alt={player.player_name}
                              fill
                              className="object-cover rounded-full border border-gray-300 sm:border-2"
                              onError={() => {
                                console.log(
                                  `Failed to load image for ${player.player_name}`
                                );
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gray-300 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm text-gray-600 flex-shrink-0">
                            {player.player_name
                              .split(' ')
                              .map((name) => name[0])
                              .join('')}
                          </div>
                        )}
                      </div>

                      {/* Flexible height container for names */}
                      <div className="flex-1 flex items-start justify-center">
                        <span className="text-[10px] sm:text-xs font-medium text-gray-900 text-center leading-tight break-words w-full px-1">
                          {player.player_name}
                        </span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body Rows */}
            <tbody>
              {game.selected_categories.map((category, rowIndex) => (
                <tr
                  key={category.key}
                  className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  {/* Category Label */}
                  <td className="border-b border-r border-gray-200 p-2 sm:p-3 md:p-4 font-medium text-gray-800 bg-gray-50 text-xs sm:text-sm md:text-base leading-tight">
                    {category.display_name}
                  </td>

                  {/* Player Selection Buttons */}
                  {game.selected_players.map((player) => {
                    const isSelected =
                      selections[category.key] === player.player_name;
                    const categoryHasSelection = !!selections[category.key];
                    const isCorrect = isSelectionCorrect(
                      category.key,
                      player.player_name
                    );
                    const isIncorrect = isSelectionIncorrect(
                      category.key,
                      player.player_name
                    );

                    return (
                      <td
                        key={`${category.key}-${player.player_name}`}
                        className={`
                          p-1 sm:p-2 md:p-3 w-16 sm:w-20 md:w-32
                          ${
                            isCorrect
                              ? 'border-2 border-green-500 shadow-lg'
                              : isIncorrect
                              ? 'border-2 border-red-500 shadow-lg'
                              : isSelected
                              ? 'border-2 border-black shadow-lg'
                              : 'border-b border-r border-gray-200'
                          }
                          ${
                            !isSelected && !categoryHasSelection && !submitted
                              ? 'hover:ring-gray-300 hover:shadow-md'
                              : ''
                          }
                        `}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <button
                            onClick={() =>
                              handlePlayerSelect(
                                category.key,
                                player.player_name
                              )
                            }
                            disabled={submitted}
                            className={`
                              w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg transition-all duration-200 relative overflow-hidden mx-auto block
                              ${
                                isSelected
                                  ? ''
                                  : categoryHasSelection
                                  ? 'opacity-40 grayscale hover:opacity-70'
                                  : ''
                              }
                              ${
                                submitted
                                  ? 'opacity-60 cursor-not-allowed'
                                  : 'cursor-pointer'
                              }
                              ${
                                !submitted && !categoryHasSelection
                                  ? 'hover:scale-105'
                                  : ''
                              }
                            `}
                          >
                            {/* Player Image - Fixed Size */}
                            {player.image_url ? (
                              <Image
                                src={player.image_url}
                                alt={player.player_name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-300 flex items-center justify-center font-bold text-xs sm:text-sm md:text-lg text-gray-600">
                                {player.player_name
                                  .split(' ')
                                  .map((name) => name[0])
                                  .join('')}
                              </div>
                            )}
                          </button>

                          {/* Player Stat Display */}
                          {submitted && (
                            <div className="text-center">
                              <span className="text-xs font-medium text-gray-700">
                                {getPlayerStat(
                                  player.player_name,
                                  category.key
                                )}
                              </span>
                              {submitted &&
                                isCorrectAnswer(
                                  category.key,
                                  player.player_name
                                ) && (
                                  <div className="flex items-center justify-center">
                                    <span className="text-yellow-500 text-sm sm:text-base">
                                      👑
                                    </span>
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Submit Button or Results */}
        {!submitted ? (
          <div className="flex justify-center mt-4 sm:mt-8">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 sm:py-3 sm:px-8 rounded-lg transition-colors duration-200 text-sm sm:text-base"
            >
              Submit Answers
            </button>
          </div>
        ) : (
          <div className="mt-6 sm:mt-8">
            {/* Score Display */}
            <div className="text-center mb-4">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
                {calculateScore()}/{results.length}
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Correct Answers
              </p>
            </div>

            {/* Play Again Button */}
            <div className="flex justify-center">
              <button
                onClick={resetGame}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 sm:py-3 sm:px-8 rounded-lg transition-colors duration-200 text-sm sm:text-base"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

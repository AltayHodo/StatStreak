'use client';

import { DailyGame, GameResult } from '../types/game';
import { useState } from 'react';
import React from 'react';
import Image from 'next/image';

type GameboardProps = {
  game: DailyGame;
};

export default function GameBoard({ game }: GameboardProps) {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<GameResult[]>([]);

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

  const handleSubmit = () => {
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
              {/* Profile Photo Placeholder */}
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs sm:text-sm font-medium text-gray-600">
                  U
                </span>
              </div>

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
        {!submitted ? (
          <>
            {/* Game Instructions */}
            <div className="text-center mb-4 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Daily StatStreak
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
                Select which player you think has the highest value for each
                stat category!
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

                        return (
                          <td
                            key={`${category.key}-${player.player_name}`}
                            className={`
                              p-1 sm:p-2 md:p-3 w-16 sm:w-20 md:w-32
                              ${
                                isSelected
                                  ? 'border-2 border-black shadow-lg'
                                  : 'border-b border-r border-gray-200'
                              }
                              ${
                                !isSelected && !categoryHasSelection
                                  ? 'hover:ring-1 hover:ring-gray-300 hover:shadow-md'
                                  : ''
                              }
                            `}
                          >
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
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-4 sm:mt-8">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 sm:py-3 sm:px-8 rounded-lg transition-colors duration-200 text-sm sm:text-base"
              >
                Submit Answers
              </button>
            </div>
          </>
        ) : (
          /* Results Section */
          <div className="max-w-4xl mx-auto">
            {/* Score Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Results
              </h2>
              <div className="text-4xl sm:text-6xl font-bold text-blue-600 mb-2">
                {calculateScore()}/{results.length}
              </div>
              <p className="text-sm sm:text-base text-gray-600">
                Correct Predictions
              </p>
            </div>

            {/* Results Grid */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`
                    rounded-lg border-2 p-4 sm:p-6 transition-all duration-200
                    ${
                      result.isCorrect
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      {result.category}
                    </h3>
                    <span className="text-xl sm:text-2xl">
                      {result.isCorrect ? '✅' : '❌'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm sm:text-base text-gray-700">
                      <span className="font-medium">Your pick:</span>{' '}
                      {result.userSelection}
                    </p>

                    {!result.isCorrect && (
                      <p className="text-sm sm:text-base text-gray-700">
                        <span className="font-medium">
                          Correct answer
                          {result.correctPlayers.length > 1 ? 's' : ''}:
                        </span>{' '}
                        {result.correctAnswer}
                        {result.correctPlayers.length > 1 && (
                          <span className="text-xs sm:text-sm text-gray-500 ml-1">
                            (tied)
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Stats Details */}
                  <details className="mt-3 sm:mt-4">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base">
                      View all stats
                    </summary>
                    <div className="mt-3 bg-white rounded-md p-3 sm:p-4 border border-gray-200">
                      <ul className="space-y-2">
                        {result.playerStats.map((stat) => (
                          <li
                            key={stat.playerName}
                            className={`
                              flex justify-between items-center py-1 text-sm sm:text-base
                              ${
                                result.correctPlayers.some(
                                  (cp) => cp.playerName === stat.playerName
                                )
                                  ? 'font-bold text-green-600'
                                  : 'text-gray-700'
                              }
                            `}
                          >
                            <span className="truncate pr-2">
                              {stat.playerName}
                            </span>
                            <span className="flex-shrink-0">
                              {stat.value}
                              {result.correctPlayers.some(
                                (cp) => cp.playerName === stat.playerName
                              ) &&
                                result.correctPlayers.length > 1 && (
                                  <span className="text-xs ml-1">
                                    (tied for 1st)
                                  </span>
                                )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                </div>
              ))}
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

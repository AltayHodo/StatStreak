'use client';

import { DailyGame, GameResult } from '../types/game';
import { useState } from 'react';
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
    <div>
      <p>
        Select which player you think has the highest value for each stat
        category
      </p>
      <table>
        <thead>
          <tr>
            <th>Stat Category</th>
            {game.selected_players.map((player) => (
              <th key={player.player_name}>{player.player_name}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {game.selected_categories.map(category => (
            <tr
              key={category.key}
            >
              <td>{category.display_name}</td>

              {game.selected_players.map((player) => {
                const isSelected =
                  selections[category.key] === player.player_name;
                const categoryHasSelection = !!selections[category.key];

                return (
                  <td key={`${category.key}-${player.player_name}`}>
                    <button
                      onClick={() =>
                        handlePlayerSelect(category.key, player.player_name)
                      }
                      disabled={submitted}
                      className={`
                        ${
                          isSelected
                            ? 'bg-green-500 text-white'
                            : categoryHasSelection
                            ? 'bg-gray-200 text-gray-400 hover:bg-gray-300 opacity-50'
                            : 'bg-white text-gray-700'
                        }
                        ${submitted ? 'opacity-60' : 'cursor-pointer'}
                        ${
                          !submitted && !categoryHasSelection
                            ? 'hover:scale-105'
                            : ''
                        }
                        `}
                    >
                      {player.image_url ? (
                        <img
                          src={player.image_url}
                          alt={player.player_name}
                          className={`
                            w-20 h-20 object-cover
                          ${isSelected ? 'border-white' : 'border-gray-300'}
                          `}
                        />
                      ) : null}

                      <div
                        className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs
                  ${
                    isSelected
                      ? 'bg-white text-green-600'
                      : 'bg-gray-300 text-gray-600'
                  }
                  ${player.image_url ? 'hidden' : 'flex'}
                `}
                      >
                        {player.player_name
                          .split(' ')
                          .map((name) => name[0])
                          .join('')}
                      </div>

                      {/* Player Name */}
                      <span
                        className={`
                text-xs font-medium mt-1 text-center leading-tight
                ${isSelected ? 'text-white' : 'text-gray-700'}
              `}
                      >
                        {player.player_name}
                      </span>
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {!submitted ? (
          <button onClick={handleSubmit}>Submit Answers</button>
        ) : (
          <div>
            <span>Results</span>
            <p>
              Score: {calculateScore()} / {results.length}{' '}
            </p>
            <button onClick={resetGame}>Play Again</button>

            <div>
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded mb-2 ${
                    result.isCorrect
                      ? 'bg-green-100 border-green-300'
                      : 'bg-red-100 border-red-300'
                  }`}
                >
                  <h3>{result.category}</h3>
                  <p>
                    Your pick: <strong>{result.userSelection}</strong>
                    {result.isCorrect ? ' ✅' : ' ❌'}
                  </p>

                  {!result.isCorrect && (
                    <p>
                      Correct answer
                      {result.correctPlayers.length > 1 ? 's' : ''}:
                      <strong> {result.correctAnswer}</strong>
                      {result.correctPlayers.length > 1 && (
                        <span className="text-sm text-gray-600"> (tied)</span>
                      )}
                    </p>
                  )}

                  {/* Show actual stats */}
                  <details className="mt-2">
                    <summary>View all stats</summary>
                    <ul className="mt-2">
                      {result.playerStats.map((stat) => (
                        <li
                          key={stat.playerName}
                          className={
                            result.correctPlayers.some(
                              (cp) => cp.playerName === stat.playerName
                            )
                              ? 'font-bold text-green-600' // Highlight tied winners
                              : ''
                          }
                        >
                          {stat.playerName}: {stat.value}
                          {result.correctPlayers.some(
                            (cp) => cp.playerName === stat.playerName
                          ) &&
                            result.correctPlayers.length > 1 &&
                            ' (tied for 1st)'}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

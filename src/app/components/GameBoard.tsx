'use client';

import { DailyGame, GameResult } from '../types/game';
import { useState } from 'react';

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

    return {
      correctPlayer: sorted[0],
      allStats: sorted,
    };
  };

  const calculateResults = (): GameResult[] => {
    return game.selected_categories.map((category) => {
      const { correctPlayer, allStats } = findHighestPlayer(category.key);
      const userSelection = selections[category.key];

      return {
        category: category.display_name,
        userSelection,
        correctAnswer: correctPlayer.playerName,
        isCorrect: userSelection === correctPlayer.playerName,
        playerStats: allStats,
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
          {game.selected_categories.map((category, rowIndex) => (
            <tr
              key={category.key}
              className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
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
                            ? 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                            : 'bg-white text-gray-700'
                        }
                        ${submitted && 'opacity-60'}
                        `}
                    >
                      {isSelected ? 'Selected' : 'Select'}
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
                      Correct answer: <strong>{result.correctAnswer}</strong>
                    </p>
                  )}

                  {/* Show actual stats */}
                  <details className="mt-2">
                    <summary>View all stats</summary>
                    <ul className="mt-2">
                      {result.playerStats.map((stat) => (
                        <li key={stat.playerName}>
                          {stat.playerName}: {stat.value}
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

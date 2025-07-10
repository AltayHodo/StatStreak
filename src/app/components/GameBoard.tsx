'use client';

import { DailyGame } from '../types/game';
import { useState } from 'react';

type GameboardProps = {
  game: DailyGame;
};

export default function GameBoard({ game }: GameboardProps) {
  // explain= useState<Record<m [categoryKey] syntax
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  console.log('Game data:', game);
  if (!game || !game.selected_players || !game.selected_categories) {
    return <div>Loading game...</div>;
  }

  const handlePlayerSelect = (categoryKey: string, playerName: string) => {
    if (submitted) return;

    if (!selections[categoryKey]) {
      setSelections((prev) => ({
        ...prev,
        [categoryKey]: playerName,
      }));
    }
  };

  const handleSubmit = () => {
    const isAllCategoriesSelected = game.selected_categories.every(
      (category) => selections[category.key]
    );

    if (!isAllCategoriesSelected) {
      alert('Please select a player for each category');
      return;
    }

    setSubmitted(true);
    console.log('User selections', selections);
    // TODO: Add scoring logic here later
  };

  const resetGame = () => {
    setSelections({});
    setSubmitted(false);
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
                      disabled={submitted || categoryHasSelection}
                      className={`
                        ${
                          isSelected
                            ? 'bg-green-500 text-white'
                            : categoryHasSelection
                            ? 'bg-gray-200 text-gray-400'
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
            <span>Answers Submitted</span>
            <button onClick={resetGame}>Play Again</button>
          </div>
        )}
      </div>
    </div>
  );
}

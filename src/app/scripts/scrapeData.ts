import * as cheerio from 'cheerio';
import { supabase } from "../utils/supabaseClient";

async function scrapeData() {
  const STATS_URL =
    'https://www.basketball-reference.com/leagues/NBA_2025_per_game.html';

  try {
    const response = await fetch(STATS_URL);
    const html = await response.text();
    const $ = cheerio.load(html);

    const players: {
      player_name: string;
      team_name: string;
      points_per_game: string;
      assists_per_game: string;
      rebounds_per_game: string;
    }[] = [];

    $('#per_game_stats tbody tr')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .each((_: number, row: any) => {
        const player_name = $(row)
          .find('td[data-stat="name_display"] a')
          .first()
          .text()
          .trim();
        const team_name = $(row)
          .find('td[data-stat="team_name_abbr"] a')
          .first()
          .text()
          .trim();
        const points_per_game = $(row)
          .find('td[data-stat="pts_per_g"]')
          .first()
          .text()
          .trim();
        const assists_per_game = $(row)
          .find('td[data-stat="ast_per_g"]')
          .first()
          .text()
          .trim();
        const rebounds_per_game = $(row)
          .find('td[data-stat="trb_per_g"]')
          .first()
          .text()
          .trim();

        if (!player_name) return;
        players.push({
          player_name,
          team_name,
          points_per_game,
          assists_per_game,
          rebounds_per_game,
        });
      });

    const playerMap = new Map<string, (typeof players)[0][]>();
    for (const row of players) {
      if (!playerMap.has(row.player_name)) playerMap.set(row.player_name, []);
      playerMap.get(row.player_name)!.push(row);
    }

    // Filter: keep only the total row, but set teamName to last team row
    let filteredPlayers = [];
    for (const [, rows] of playerMap.entries()) {
      const totalRow = rows.find((r) => !r.team_name);
      const lastTeamRow = [...rows].reverse().find((r) => r.team_name);
      if (totalRow && lastTeamRow) {
        totalRow.team_name = lastTeamRow.team_name;
        filteredPlayers.push(totalRow);
      } else if (rows.length) {
        // If no total row, just use the last row
        filteredPlayers.push(rows[rows.length - 1]);
      }
    }

    filteredPlayers = filteredPlayers.slice(0, 400);
    for (const player of filteredPlayers) {
      console.log(player);
    }

    const { data, error } = await supabase
      .from('Players')
      .insert(filteredPlayers);

    if (error) {
      console.error('Supabase insert error:', error);
    } else {
      console.log('Inserted players:', data);
    }
  } catch (error) {
    console.error('Error scraping data:', error);
  }
}

scrapeData();

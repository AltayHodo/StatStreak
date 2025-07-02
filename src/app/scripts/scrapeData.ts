import * as cheerio from 'cheerio';
import { supabase } from '../utils/supabaseClient';

async function scrapeData() {
  const PER_GAME_URL =
    'https://www.basketball-reference.com/leagues/NBA_2025_per_game.html';
  const ADVANCED_URL =
    'https://www.basketball-reference.com/leagues/NBA_2025_advanced.html';

  try {
    let response = await fetch(PER_GAME_URL);
    let html = await response.text();
    let $ = cheerio.load(html);

    const players: {
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
      player_efficiency_rating?: string; // add ? if not always present initially
      usage_rate?: string;
      box_plus_minus?: string;
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
        const blocks_per_game = $(row)
          .find('td[data-stat="blk_per_g"]')
          .first()
          .text()
          .trim();
        const steals_per_game = $(row)
          .find('td[data-stat="stl_per_g"]')
          .first()
          .text()
          .trim();
        const turnovers_per_game = $(row)
          .find('td[data-stat="tov_per_g"]')
          .first()
          .text()
          .trim();
        const field_goal_percentage = $(row)
          .find('td[data-stat="fg_pct"]')
          .first()
          .text()
          .trim();
        const three_point_percentage = $(row)
          .find('td[data-stat="fg3_pct"]')
          .first()
          .text()
          .trim();
        const free_throw_percentage = $(row)
          .find('td[data-stat="ft_pct"]')
          .first()
          .text()
          .trim();
        const effective_field_goal_percentage = $(row)
          .find('td[data-stat="efg_pct"]')
          .first()
          .text()
          .trim();
        const three_pointers_per_game = $(row)
          .find('td[data-stat="fg3_per_g"]')
          .first()
          .text()
          .trim();
        const minutes_played_per_game = $(row)
          .find('td[data-stat="mp_per_g"]')
          .first()
          .text()
          .trim();
        if (!player_name) return;
        players.push({
          player_name,
          team_name,
          points_per_game: emptyToZeroString(points_per_game),
          assists_per_game: emptyToZeroString(assists_per_game),
          rebounds_per_game: emptyToZeroString(rebounds_per_game),
          blocks_per_game: emptyToZeroString(blocks_per_game),
          steals_per_game: emptyToZeroString(steals_per_game),
          turnovers_per_game: emptyToZeroString(turnovers_per_game),
          field_goal_percentage: emptyToZeroString(field_goal_percentage),
          three_point_percentage: emptyToZeroString(three_point_percentage),
          free_throw_percentage: emptyToZeroString(free_throw_percentage),
          effective_field_goal_percentage: emptyToZeroString(
            effective_field_goal_percentage
          ),
          three_pointers_per_game: emptyToZeroString(three_pointers_per_game),
          minutes_played_per_game: emptyToZeroString(minutes_played_per_game),
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
    const newMap = new Map<string, (typeof players)[0]>();
    for (const player of filteredPlayers) {
      newMap.set(player.player_name, { ...player });
    }

    // const firstRow = $('#per_game_stats tbody tr').first();
    // console.log(firstRow.html());

    response = await fetch(ADVANCED_URL);
    html = await response.text();
    $ = cheerio.load(html);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $('.stats_table tbody tr').each((_: number, row: any) => {
      const player_name = $(row)
        .find('td[data-stat="name_display"] a')
        .first()
        .text()
        .trim();
      const player_efficiency_rating = $(row)
        .find('td[data-stat="per"]')
        .first()
        .text()
        .trim();
      const usage_rate = $(row)
        .find('td[data-stat="usg_pct"]')
        .first()
        .text()
        .trim();
      const box_plus_minus = $(row)
        .find('td[data-stat="bpm"]')
        .first()
        .text()
        .trim();
      console.log({
        player_name,
        player_efficiency_rating,
        usage_rate,
        box_plus_minus,
      });

      const playerObj = newMap.get(player_name);
      if (playerObj) {
        Object.assign(playerObj, {
          player_efficiency_rating: emptyToZeroString(player_efficiency_rating),
          usage_rate: emptyToZeroString(usage_rate),
          box_plus_minus: emptyToZeroString(box_plus_minus),
        });
      }
    });
    const mergedPlayers = Array.from(newMap.values());
    console.log(mergedPlayers)

    // const { error: deleteError } = await supabase
    //   .from('Players')
    //   .delete()
    //   .neq('id', 0);
    // if (deleteError) {
    //   console.error('Error clearing Players table:', deleteError);
    // }
    // const { data, error } = await supabase
    //   .from('Players')
    //   .insert(filteredPlayers);

    // if (error) {
    //   console.error('Supabase insert error:', error);
    // } else {
    //   console.log('Inserted players:', data);
    // }
  } catch (error) {
    console.error('Error scraping data:', error);
  }
}

function emptyToZeroString(value: string): string {
  return value.trim() === '' ? '0' : value.trim();
}

scrapeData();

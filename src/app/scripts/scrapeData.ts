import * as cheerio from 'cheerio';
import { supabase } from '../utils/supabaseClient';
import { Player } from '../types/player';

async function scrapeData() {
  const PER_GAME_URL =
    'https://www.basketball-reference.com/leagues/NBA_2025_per_game.html';
  const ADVANCED_URL =
    'https://www.basketball-reference.com/leagues/NBA_2025_advanced.html';
  const TOTALS_URL =
    'https://www.basketball-reference.com/leagues/NBA_2025_totals.html';

  try {
    const players: Player[] = [];

    let response = await fetch(PER_GAME_URL);
    let html = await response.text();
    let $ = cheerio.load(html);

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

    // map name -> list of player object (for players on multiple teams, who were traded)
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
    // map player name -> player object
    const newMap = new Map<string, (typeof players)[0]>();
    for (const player of filteredPlayers) {
      newMap.set(player.player_name, { ...player });
    }

    // const firstRow = $('#per_game_stats tbody tr').first();
    // console.log(firstRow.html());

    response = await fetch(TOTALS_URL);
    html = await response.text();
    $ = cheerio.load(html);

    let totalStats: {
      player_name: string;
      team_name: string;
      total_minutes_played: string;
      total_points: string;
      total_field_goals: string;
      total_three_pointers: string;
      total_rebounds: string;
      total_assists: string;
      total_steals: string;
      total_blocks: string;
      total_turnovers: string;
      triple_doubles: string;
    }[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $('.stats_table tbody tr').each((_: number, row: any) => {
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
      const total_minutes_played = $(row)
        .find('td[data-stat="mp"]')
        .first()
        .text()
        .trim();
      const total_points = $(row)
        .find('td[data-stat="pts"]')
        .first()
        .text()
        .trim();
      const total_field_goals = $(row)
        .find('td[data-stat="fg"]')
        .first()
        .text()
        .trim();
      const total_three_pointers = $(row)
        .find('td[data-stat="fg3"]')
        .first()
        .text()
        .trim();
      const total_rebounds = $(row)
        .find('td[data-stat="trb"]')
        .first()
        .text()
        .trim();
      const total_assists = $(row)
        .find('td[data-stat="ast"]')
        .first()
        .text()
        .trim();
      const total_steals = $(row)
        .find('td[data-stat="stl"]')
        .first()
        .text()
        .trim();
      const total_blocks = $(row)
        .find('td[data-stat="blk"]')
        .first()
        .text()
        .trim();
      const total_turnovers = $(row)
        .find('td[data-stat="tov"]')
        .first()
        .text()
        .trim();
      const triple_doubles = $(row)
        .find('td[data-stat="tpl_dbl"]')
        .first()
        .text()
        .trim();

      if (!player_name) return;

      totalStats.push({
        player_name,
        team_name,
        total_minutes_played: emptyToZeroString(total_minutes_played),
        total_points: emptyToZeroString(total_points),
        total_field_goals: emptyToZeroString(total_field_goals),
        total_three_pointers: emptyToZeroString(total_three_pointers),
        total_rebounds: emptyToZeroString(total_rebounds),
        total_assists: emptyToZeroString(total_assists),
        total_steals: emptyToZeroString(total_steals),
        total_blocks: emptyToZeroString(total_blocks),
        total_turnovers: emptyToZeroString(total_turnovers),
        triple_doubles: emptyToZeroString(triple_doubles),
      });
    });
    totalStats = totalStats.slice(0, 735);

    // Filter totalStats: handle traded players (same logic as filteredPlayers)
    const totalsPlayerMap = new Map<string, (typeof totalStats)[0][]>();
    for (const row of totalStats) {
      if (!totalsPlayerMap.has(row.player_name)) {
        totalsPlayerMap.set(row.player_name, []);
      }
      totalsPlayerMap.get(row.player_name)!.push({ ...row });
    }

    // Filter: keep only the total row, but set teamName to last team row
    const filteredTotalStats = [];
    for (const [, rows] of totalsPlayerMap.entries()) {
      const totalRow = rows.find((r) => !r.team_name);
      const lastTeamRow = [...rows].reverse().find((r) => r.team_name);
      if (totalRow && lastTeamRow) {
        totalRow.team_name = lastTeamRow.team_name;
        filteredTotalStats.push(totalRow);
      } else if (rows.length) {
        // If no total row, just use the last row
        filteredTotalStats.push(rows[rows.length - 1]);
      }
    }

    for (const totalStat of filteredTotalStats) {
      const playerObj = newMap.get(totalStat.player_name);
      if (playerObj) {
        Object.assign(playerObj, {
          total_minutes_played: totalStat.total_minutes_played,
          total_points: totalStat.total_points,
          total_rebounds: totalStat.total_rebounds,
          total_assists: totalStat.total_assists,
          total_field_goals: totalStat.total_field_goals,
          total_three_pointers: totalStat.total_three_pointers,
          total_steals: totalStat.total_steals,
          total_blocks: totalStat.total_blocks,
          total_turnovers: totalStat.total_turnovers,
          triple_doubles: totalStat.triple_doubles,
        });
      }
    }

    response = await fetch(ADVANCED_URL);
    html = await response.text();
    $ = cheerio.load(html);
    let advancedStats: {
      player_name: string;
      team_name: string;
      player_efficiency_rating: string;
      usage_rate: string;
      box_plus_minus: string;
    }[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $('.stats_table tbody tr').each((_: number, row: any) => {
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

      advancedStats.push({
        player_name: emptyToZeroString(player_name),
        team_name: emptyToZeroString(team_name),
        player_efficiency_rating: emptyToZeroString(player_efficiency_rating),
        usage_rate: emptyToZeroString(usage_rate),
        box_plus_minus: emptyToZeroString(box_plus_minus),
      });
    });

    advancedStats = advancedStats.slice(0, 735);
    const advancedPlayerMap = new Map<string, (typeof advancedStats)[0][]>();
    for (const row of advancedStats) {
      if (!advancedPlayerMap.has(row.player_name)) {
        advancedPlayerMap.set(row.player_name, []);
      }
      advancedPlayerMap.get(row.player_name)!.push({ ...row });
    }

    const filteredAdvancedStats = [];
    for (const [, rows] of advancedPlayerMap.entries()) {
      const totalRow = rows.find((r) => !r.team_name);
      const lastTeamRow = [...rows].reverse().find((r) => r.team_name);
      if (totalRow && lastTeamRow) {
        totalRow.team_name = lastTeamRow.team_name;
        filteredAdvancedStats.push(totalRow);
      } else if (rows.length) {
        // If no total row, just use the last row
        filteredAdvancedStats.push(rows[rows.length - 1]);
      }
    }

    for (const advancedStat of filteredAdvancedStats) {
      const playerObj = newMap.get(advancedStat.player_name);
      if (playerObj) {
        Object.assign(playerObj, {
          player_efficiency_rating: advancedStat.player_efficiency_rating,
          usage_rate: advancedStat.usage_rate,
          box_plus_minus: advancedStat.box_plus_minus,
        });
      }
    }

    const mergedPlayers = Array.from(newMap.values());
    const playerIdMap = await getESPNPlayerIds(mergedPlayers);
    const playersWithImages = await scrapeESPNPlayerImages(
      playerIdMap,
      mergedPlayers
    );

    const { error: deleteError } = await supabase
      .from('Players')
      .delete()
      .neq('id', 0);
    if (deleteError) {
      console.error('Error clearing Players table:', deleteError);
    }
    const { data, error } = await supabase
      .from('Players')
      .insert(playersWithImages);

    if (error) {
      console.error('Supabase insert error:', error);
    } else {
      console.log('Inserted players:', data);
    }
  } catch (error) {
    console.error('Error scraping data:', error);
  }
}

function emptyToZeroString(value: string): string {
  return value.trim() === '' ? '0' : value.trim();
}

scrapeData();

async function getESPNPlayerIds(mergedPlayers: Player[]) {
  //don't forget- accents in player names messing things up
  const playerIdMap = new Map<string, string>();

  const espnTeamMap: Record<string, string> = {
    ATL: 'atl/atlanta-hawks',
    BOS: 'bos/boston-celtics',
    BRK: 'bkn/brooklyn-nets',
    CHO: 'cha/charlotte-hornets',
    CHI: 'chi/chicago-bulls',
    CLE: 'cle/cleveland-cavaliers',
    DAL: 'dal/dallas-mavericks',
    DEN: 'den/denver-nuggets',
    DET: 'det/detroit-pistons',
    GSW: 'gs/golden-state-warriors',
    HOU: 'hou/houston-rockets',
    IND: 'ind/indiana-pacers',
    LAC: 'lac/la-clippers',
    LAL: 'lal/los-angeles-lakers',
    MEM: 'mem/memphis-grizzlies',
    MIA: 'mia/miami-heat',
    MIL: 'mil/milwaukee-bucks',
    MIN: 'min/minnesota-timberwolves',
    NOP: 'no/new-orleans-pelicans',
    NYK: 'ny/new-york-knicks',
    OKC: 'okc/oklahoma-city-thunder',
    ORL: 'orl/orlando-magic',
    PHI: 'phi/philadelphia-76ers',
    PHO: 'phx/phoenix-suns',
    POR: 'por/portland-trail-blazers',
    SAC: 'sac/sacramento-kings',
    SAS: 'sa/san-antonio-spurs',
    TOR: 'tor/toronto-raptors',
    UTA: 'utah/utah-jazz',
    WAS: 'wsh/washington-wizards',
  };

  const playersByTeam = new Map<string, Player[]>();
  for (const player of mergedPlayers) {
    const teamKey = player.team_name;
    if (!playersByTeam.has(teamKey)) {
      playersByTeam.set(teamKey, []);
    }
    playersByTeam.get(teamKey)!.push(player);
  }

  for (const [teamAbbr] of playersByTeam) {
    const espnTeam = espnTeamMap[teamAbbr];
    if (!espnTeam) {
      console.log(`No ESPN mapping for team: ${teamAbbr}`);
      continue;
    }

    try {
      console.log(`Processing team: ${teamAbbr} (${espnTeam})`);
      const rosterUrl = `https://www.espn.com/nba/team/roster/_/name/${espnTeam}`;
      const response = await fetch(rosterUrl);
      const html = await response.text();
      const $ = cheerio.load(html);

      $('.Roster__MixedTable .flex .Table__TBODY tr').each(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (_: number, row: any) => {
          const athleteLink = $(row).find('a[data-resource-id="AthleteName"]');
          if (athleteLink.length > 0) {
            const href = athleteLink.attr('href');
            const playerName = athleteLink.text().trim();

            if (href) {
              const match = href.match(/\/id\/(\d+)\//);

              if (match) {
                const playerId = match[1];

                const matchingPlayer = mergedPlayers.find((p) => {
                  const normalizedBRName = normalizePlayerName(p.player_name);
                  const normalizedESPNName = normalizePlayerName(playerName);

                  return (
                    normalizedBRName.includes(normalizedESPNName) ||
                    normalizedESPNName.includes(normalizedBRName) ||
                    normalizedBRName === normalizedESPNName
                  );
                });

                if (matchingPlayer) {
                  playerIdMap.set(matchingPlayer.player_name, playerId);
                }
              }
            }
          }
        }
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error processing team ${teamAbbr}:`, error);
    }
  }
  console.log(`\nTotal player IDs mapped: ${playerIdMap.size}`);
  return playerIdMap;
}

function normalizePlayerName(name: string): string {
  return (
    name
      .toLowerCase()
      // Basic Latin accents
      .replace(/[àáâãäåāăą]/g, 'a')
      .replace(/[èéêëēĕė]/g, 'e')
      .replace(/[ìíîïīĭį]/g, 'i')
      .replace(/[òóôõöōŏő]/g, 'o')
      .replace(/[ùúûüūŭů]/g, 'u')
      .replace(/[ñń]/g, 'n')
      .replace(/[ç]/g, 'c')
      // Eastern European specific characters
      .replace(/[č]/g, 'c') // Dončić -> Doncic
      .replace(/[ć]/g, 'c') // Serbian/Croatian
      .replace(/[đ]/g, 'd') // Serbian/Croatian
      .replace(/[š]/g, 's') // Šengün -> Sengun
      .replace(/[ž]/g, 'z') // Various Slavic
      .replace(/[ģ]/g, 'g') // Porziņģis -> Porzingis
      .replace(/[ņ]/g, 'n') // Porziņģis -> Porzingis
      .replace(/[ļ]/g, 'l') // Latvian
      .replace(/[ķ]/g, 'k') // Latvian
      // Lithuanian specific
      .replace(/[ū]/g, 'u') // Valančiūnas -> Valanciunas
      .replace(/[ė]/g, 'e') // Lithuanian
      .replace(/[į]/g, 'i') // Lithuanian
      .replace(/[ą]/g, 'a') // Lithuanian/Polish
      .replace(/[ę]/g, 'e') // Lithuanian/Polish
      // Turkish specific
      .replace(/[ğ]/g, 'g') // Turkish
      .replace(/[ı]/g, 'i') // Turkish dotless i
      .replace(/[İ]/g, 'i') // Turkish capital I with dot
      .replace(/[ş]/g, 's') // Turkish
      .replace(/[ü]/g, 'u') // Turkish
      .replace(/[ö]/g, 'o') // Turkish
      // Remove any remaining non-alphabetic characters except spaces
      .replace(/[^a-z\s]/g, '')
      .trim()
  );
}

async function scrapeESPNPlayerImages(
  playerIdMap: Map<string, string>,
  mergedPlayers: Player[]
) {
  const playersWithImages: Player[] = [];
  for (const player of mergedPlayers) {
    const playerId = playerIdMap.get(player.player_name);

    if (playerId) {
      const imageUrl = `https://a.espncdn.com/i/headshots/nba/players/full/${playerId}.png`;

      try {
        const imageResponse = await fetch(imageUrl, { method: 'HEAD' });

        if (imageResponse.ok) {
          playersWithImages.push({
            ...player,
            image_url: imageUrl,
          });
          console.log(`Image found for ${player.player_name}: ${imageUrl}`);
        } else {
          console.log(
            `No image available for ${player.player_name} - excluding from database`
          );
        }
      } catch (error) {
        console.error(`Error checking image for ${player.player_name}:`, error);
        console.log(`Excluding ${player.player_name} from database`);
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    } else {
      console.log(
        `No image available for ${player.player_name} - excluding from database`
      );
    }
  }
  console.log(
    `\nFiltered players: ${playersWithImages.length} players with images out of ${mergedPlayers.length} total players`
  );
  return playersWithImages;
}

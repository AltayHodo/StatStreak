// import * as cheerio from 'cheerio';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cheerio = require('cheerio');

async function scrapeData() {
  const STATS_URL =
    'https://www.basketball-reference.com/leagues/NBA_2025_per_game.html';

  try {
    const response = await fetch(STATS_URL);
    const html = await response.text();
    const $ = cheerio.load(html);

    const players: {
      playerName: string;
      teamName: string;
      ppg: string;
      apg: string;
      rpg: string;
    }[] = [];

    $('#per_game_stats tbody tr')
      .not('.thead')
      .each((_: number, row: Element) => {
        const playerName = $(row)
          .find('td[data-stat="name_display"] a')
          .first()
          .text()
          .trim();
        const teamName = $(row)
          .find('td[data-stat="team_name_abbr"] a')
          .first()
          .text()
          .trim();
        const ppg = $(row)
          .find('td[data-stat="pts_per_g"]')
          .first()
          .text()
          .trim();
        const apg = $(row)
          .find('td[data-stat="ast_per_g"]')
          .first()
          .text()
          .trim();
        const rpg = $(row)
          .find('td[data-stat="trb_per_g"]')
          .first()
          .text()
          .trim();

        if (!playerName) return;
        players.push({ playerName, teamName, ppg, apg, rpg });
      });

    const playerMap = new Map<string, (typeof players)[0][]>();
    for (const row of players) {
      if (!playerMap.has(row.playerName)) playerMap.set(row.playerName, []);
      playerMap.get(row.playerName)!.push(row);
    }

    // Filter: keep only the total row, but set teamName to last team row
    let filteredPlayers = [];
    for (const [, rows] of playerMap.entries()) {
      const totalRow = rows.find((r) => !r.teamName);
      const lastTeamRow = [...rows].reverse().find((r) => r.teamName);
      if (totalRow && lastTeamRow) {
        totalRow.teamName = lastTeamRow.teamName;
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
  } catch (error) {
    console.error('Error scraping data:', error);
  }
}

scrapeData();

// import * as cheerio from 'cheerio';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cheerio = require('cheerio');

async function scrapeData() {
  const STATS_URL =
    'https://www.basketball-reference.com/leagues/NBA_2025_per_game.html';

  try {
    const response = await fetch(STATS_URL);
    const html = await response.text();
    console.log(html);
    const $ = cheerio.load(html);
    console.log($);
  } catch (error) {
    console.error('Error scraping data:', error);
  }
}

scrapeData();

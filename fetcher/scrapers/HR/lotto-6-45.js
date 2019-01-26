// 6/45 + joker (same)
// Ordered
// Thu and Sun at 20:00
const moment = require('moment-timezone');
const run = require('../runtime');

// CONFIGURATION -----------------------------------------------------------------------------------

module.exports = {
  lottoId: 'HR:LOTTO_6-45',
  timezone: 'Europe/Zagreb',
  schedule: {
    scheduledOffset: 60 * 24 * 14, // 14 days before (4 draws)
    scheduled: [
      '0 20 * * 0,4',
    ],
    blockedOffset: 60, // 1 hour before
    blocked: [
      '0 19 * * 0,4',
    ],
    picked: [
      '0 20 * * 0,4',
    ],
  },
  retry: {
    times: 120, // attempts
    wait: 30, // seconds
  },
};

// SCRAPING ----------------------------------------------------------------------------------------

const extractDate = async (page) => {
  const dateString = await page.evaluate(() => document.querySelector('#date-info').innerText);
  const regex = /\d{2}\.\d{2}\.\d{4}\./g;
  const date = `${dateString.match(regex)[0]} 20:00`;

  return moment.tz(date, 'DD.MM.YYYY. H:m', module.exports.timezone).toISOString();
};

const extractPicks = async (page) => {
  const pick = await page.evaluate(() => Array.prototype.slice.call(
    document.querySelector('#winnings-info').getElementsByTagName('li'),
  ).map(el => parseInt(el.innerText, 10)));

  if (pick.length !== 7) {
    throw new Error(`Expected 7 numbers, got ${pick}`);
  }

  return [pick.slice(0, 6), pick.slice(6, 7)];
};

// RUN ---------------------------------------------------------------------------------------------

if (!module.parent) {
  run({
    url: 'https://www.lutrija.hr/cms/loto6od45',
    extractDate,
    extractPicks,
  });
}

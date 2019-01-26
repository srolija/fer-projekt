// 7/35 + joker (same)
// Ordered
// Wed and Sat 20:05
const moment = require('moment-timezone');
const run = require('../runtime');

// CONFIGURATION -----------------------------------------------------------------------------------

module.exports = {
  lottoId: 'HR:LOTTO_7',
  timezone: 'Europe/Zagreb',
  schedule: {
    scheduledOffset: 60 * 24 * 14, // 14 days before (4 draws)
    scheduled: [
      '5 20 * * 3,6',
    ],
    blockedOffset: 60, // 1 hour before
    blocked: [
      '5 19 * * 3,6',
    ],
    picked: [
      '5 20 * * 3,6',
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
  const date = `${dateString.match(regex)[0]} 20:05`;

  return moment.tz(date, 'DD.MM.YYYY. H:m', 'Europe/Zagreb').toISOString();
};

const extractPicks = async (page) => {
  const pick = await page.evaluate(() => Array.prototype.slice.call(
    document.querySelector('#winnings-info').getElementsByTagName('li'),
  ).map(el => parseInt(el.innerText, 10)));

  if (pick.length !== 8) {
    throw new Error(`Expected 8 numbers, got ${pick}`);
  }

  return [pick.slice(0, 7), pick.slice(7, 8)];
};

// RUN ---------------------------------------------------------------------------------------------

if (!module.parent) {
  run({
    url: 'https://www.lutrija.hr/cms/loto7',
    extractDate,
    extractPicks,
  });
}

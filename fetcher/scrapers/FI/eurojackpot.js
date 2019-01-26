// 5/50 + 2/10 (different)
// Ordered
// Every week at Fri 21:00 GMT
const moment = require('moment-timezone');
const run = require('../runtime');

// CONFIGURATION -----------------------------------------------------------------------------------

module.exports = {
  lottoId: 'FI:EUROJACKPOT',
  timezone: 'GMT',
  schedule: {
    scheduledOffset: 60 * 24 * 21, // 21 days before (3 draws)
    scheduled: [
      '0 21 * * 5',
    ],
    blockedOffset: 60, // 1 hour before
    blocked: [
      '0 20 * * 5',
    ],
    picked: [
      '0 21 * * 5',
    ],
  },
  retry: {
    times: 120, // attempts
    wait: 30, // seconds
  },
};

// SCRAPING ----------------------------------------------------------------------------------------

const extractDate = async (page) => {
  const dateString = await page.evaluate(() => (
    document.querySelector('.winning_numbers .time time').innerText
  ));

  const date = `${dateString.split('-')[0]} 21:00`;

  return moment.tz(date, 'DD-MM-YY. H:m', module.exports.timezone).toISOString();
};

const extractPicks = async (page) => {
  const pick = await page.evaluate(() => Array.prototype.slice.call(
    document.querySelectorAll('ul.results > li'),
  ).map(el => parseInt(el.innerText, 10)));

  if (pick.length !== 7) {
    throw new Error(`Expected total of 7 numbers, got ${pick}`);
  }

  return [pick.slice(0, 4), pick.slice(5, 7)];
};

// RUN ---------------------------------------------------------------------------------------------

if (!module.parent) {
  run({
    url: 'https://www.eurojackpot.org/en/',
    extractDate,
    extractPicks,
  });
}

// 6/49
// Ordered
// Tue, Thu and Sat at 21:00
const moment = require('moment-timezone');
const run = require('../runtime');

// CONFIGURATION -----------------------------------------------------------------------------------

module.exports = {
  lottoId: 'PL:LOTTO_6',
  timezone: 'Europe/Warsaw',
  schedule: {
    scheduledOffset: 60 * 24 * 7, // 7 days before (3 draws)
    scheduled: [
      '40 21 * * 2,4,6',
    ],
    blockedOffset: 60, // 1 hour before
    blocked: [
      '40 20 * * 2,4,6',
    ],
    picked: [
      '40 21 * * 2,4,6',
    ],
  },
  retry: {
    times: 120, // attempts
    wait: 30, // seconds
  },
};

// SCRAPING ----------------------------------------------------------------------------------------

const extractDate = async (page) => {
  const dateString = await page.evaluate(() => Array.prototype.slice.call(
    document.querySelectorAll('.resultsItem.lotto')[0].querySelectorAll('.resultsTime > span > strong'),
  ).map(el => el.innerText));

  const date = `${dateString[0]} ${dateString[1]}`;

  return moment.tz(date, 'DD-MM-YY. H:m', module.exports.timezone).toISOString();
};

const extractPicks = async (page) => {
  const pick = await page.evaluate(() => Array.prototype.slice.call(
    document.querySelectorAll('.resultsItem.lotto')[0].querySelectorAll('.wynik_lotto.number'),
  ).map(el => parseInt(el.innerText, 10)));

  if (pick.length !== 6) {
    throw new Error(`Expected 6 numbers, got ${pick}`);
  }

  return [pick, null];
};

// RUN ---------------------------------------------------------------------------------------------

if (!module.parent) {
  run({
    url: 'https://www.lotto.pl/wyniki-gier',
    extractDate,
    extractPicks,
  });
}

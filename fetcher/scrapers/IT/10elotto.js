// 20/90 + 2/90 (same set)
// Ordered
// Every 5 minutes (0-24/365)
const moment = require('moment-timezone');
const run = require('../runtime');

// CONFIGURATION -----------------------------------------------------------------------------------

module.exports = {
  lottoId: 'IT:10_ELOTTO_5',
  timezone: 'Europe/Rome',
  schedule: {
    scheduledOffset: 60, // minutes before (12 draws)
    scheduled: [
      '*/5 * * * *',
    ],
    blockedOffset: 5, // minutes before
    blocked: [
      '*/5 * * * *',
    ],
    picked: [
      '*/5 * * * *',
    ],
  },
  retry: {
    times: 50, // attempts
    wait: 8, // seconds
  },
};

// SCRAPING ----------------------------------------------------------------------------------------

const extractDate = async (page) => {
  const cols = await page.evaluate(() => Array.prototype.slice.call(
    document.querySelector('table').getElementsByTagName('tr')[1].getElementsByTagName('td'),
  ).map(el => el.innerText));

  const date = cols[1] + cols[2];

  const tzDate = moment.tz(date, 'DD/MM H:m', module.exports.timezone);

  // They heave an error where they schedule 00:00 to previous day
  // http://s3.srolija.com/2019-01-24_00-13-42.png
  if (cols[2].indexOf('00:00') >= 0) {
    tzDate.add(1, 'd');
  }

  return tzDate.toISOString();
};

const extractPicks = async (page) => {
  const cols = await page.evaluate(() => Array.prototype.slice.call(
    document.querySelector('table').getElementsByTagName('tr')[1].getElementsByTagName('td'),
  ).map(el => el.innerText));

  const picks = cols.slice(3, 23).map(el => parseInt(el, 10));

  if (picks.length !== 20) {
    throw new Error(`Expected 20 numbers, got ${picks}`);
  }

  const specials = cols.slice(23, 25).map(el => parseInt(el, 10));

  if (specials.length !== 2) {
    throw new Error(`Expected 2 numbers, got ${specials}`);
  }

  return [picks, specials];
};

// RUN ---------------------------------------------------------------------------------------------

if (!module.parent) {
  run({
    url: 'https://www.10elotto5.it/estrazioni-10-e-lotto-ogni-5-minuti-di-oggi/',
    before: async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
    },
    extractDate,
    extractPicks,
  });
}

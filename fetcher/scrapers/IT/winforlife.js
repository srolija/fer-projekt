// 10/20 + 1/20 (different)
// Ordered
// Every hour, 07:00-23:00
const moment = require('moment-timezone');
const run = require('../runtime');

// CONFIGURATION -----------------------------------------------------------------------------------

module.exports = {
  lottoId: 'IT:WIN_FOR_LIFE',
  timezone: 'Europe/Rome',
  schedule: {
    scheduledOffset: 180, // minutes before (3 draws)
    scheduled: [
      '0 4-20 * * *',
    ],
    blockedOffset: 60, // minutes before
    blocked: [
      '0 6-22 * * *',
    ],
    picked: [
      '0 7-23 * * *',
    ],
  },
  retry: {
    times: 120, // attempts
    wait: 30, // seconds
  },
};

// SCRAPING ----------------------------------------------------------------------------------------

const extractDate = async (page) => {
  const date = await page.evaluate(() => document.querySelector('#data-estrazione').innerText.replace('ore ', ''));
  return moment.tz(date, 'DD/MM/YYYY H:m', module.exports.timezone).toISOString();
};

const extractPicks = async (page) => {
  const pick = await page.evaluate(() => Array.prototype.slice.call(
    document.querySelector('#card-combinazione').getElementsByClassName('ws-nve-numestratto'),
  ).map(el => el.innerText));

  const picks = pick.map(el => parseInt(el, 10));

  if (picks.length !== 10) {
    throw new Error(`Expected 10 numbers, got ${picks}`);
  }

  const specials = [parseInt(await page.evaluate(() => document.querySelector('#card-numerone').innerText), 10)];

  if (specials.length !== 1) {
    throw new Error(`Expected 1 numbers, got ${specials}`);
  }

  return [picks, specials];
};

// RUN ---------------------------------------------------------------------------------------------

if (!module.parent) {
  run({
    url: 'http://www.winforlife.it/estrazioni/archivio-concorsi/win-for-life-classico',
    before: async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
    },
    extractDate,
    extractPicks,
  });
}

// 20/80
// Ordered
// Every 5 minutes, 09:00-23:55
const moment = require('moment-timezone');
const run = require('../runtime');

// CONFIGURATION -----------------------------------------------------------------------------------

module.exports = {
  lottoId: 'GR:KINO',
  timezone: 'Europe/Athens',
  schedule: {
    scheduledOffset: 60, // minutes before (12 draws)
    scheduled: [
      '*/5 8-22 * * *',
    ],
    blockedOffset: 5, // minutes before
    blocked: [
      '55 8 * * *',
      '*/5 9-22 * * *',
      '0,5,10,15,20,25,30,35,40,45,50,50 23 * * *',
    ],
    picked: [
      '*/5 9-23 * * *',
    ],
  },
  retry: {
    times: 50, // attempts
    wait: 8, // seconds
  },
};

// SCRAPING ----------------------------------------------------------------------------------------

const extractDate = async (page) => {
  const date = await page.evaluate(() => (
    document
      .getElementsByTagName('table')[1]
      .getElementsByTagName('tr')[1]
      .childNodes[0]
      .textContent
  ));

  return moment.tz(date, 'DD.MM.YYYY H:m:s', module.exports.timezone).toISOString();
};

const extractPicks = async (page) => {
  const picks = await page.evaluate(() => (
    document
      .getElementsByTagName('table')[1]
      .getElementsByTagName('tr')[1]
      .childNodes[1]
      .textContent
      .split(',')
      .map(el => parseInt(el, 10))
  ));

  const fixed = [
    ...picks.slice(0, 9),
    parseInt(String(picks[9]).substr(0, 2), 10),
    parseInt(String(picks[9]).substr(2, 2), 10),
    ...picks.slice(10, 19),
  ];

  if (fixed.length !== 20) {
    throw new Error(`Expected 20 numbers, got ${fixed}`);
  }

  return [fixed, undefined];
};

// RUN ---------------------------------------------------------------------------------------------

if (!module.parent) {
  run({
    url: 'https://grkino.com/m/statistici/Rezultate-top.php',
    extractDate,
    extractPicks,
  });
}

// 20/80
// Ordered
// Every 5 minutes, 05:00-23:50
const moment = require('moment-timezone');
const run = require('../runtime');

// CONFIGURATION -----------------------------------------------------------------------------------

module.exports = {
  lottoId: 'SK:EKLUB_KENO',
  timezone: 'Europe/Bratislava',
  schedule: {
    scheduledOffset: 60, // minutes before (12 draws)
    scheduled: [
      '*/5 4-21 * * *',
      '0,5,10,15,20,25,30,35,40,45,50 22 * * *',
    ],
    blockedOffset: 5, // minutes before
    blocked: [
      '55 4 * * *',
      '*/5 5-22 * * *',
      '0,5,10,15,20,25,30,35,40,45 23 * * *',
    ],
    picked: [
      '*/5 5-22 * * *',
      '0,5,10,15,20,25,30,35,40,45,50 23 * * *',
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
    document.querySelector('.pageArchive .table').getElementsByTagName('tr')[0].getElementsByTagName('span')[1].innerText
  ));
  const day = await page.evaluate(() => (
    document.querySelector('#_ctl0_ContentPlaceHolder_ddlDay_chzn span').innerText
  ));
  const month = await page.evaluate(() => (
    document.querySelector('#_ctl0_ContentPlaceHolder_ddlMonth').selectedOptions[0].value
  ));
  const year = await page.evaluate(() => (
    document.querySelector('#_ctl0_ContentPlaceHolder_ddlYear').selectedOptions[0].value
  ));

  const formated = `${day}.${month}.${year} ${date}`;

  return moment.tz(formated, 'DD.MM.YYYY H:m', module.exports.timezone).toISOString();
};

const extractPicks = async (page) => {
  const pickString = await page.evaluate(() => (
    document.querySelector('.pageArchive .table').getElementsByTagName('tr')[1].getElementsByTagName('td')[1].innerText
  ));
  const picks = pickString.split(/\s/).map(el => parseInt(el, 10));

  if (picks.length !== 20) {
    throw new Error(`Expected 20 numbers, got ${picks}`);
  }

  return [picks, undefined];
};

// const before = async (page) => {
//   await page.select('#_ctl0_ContentPlaceHolder_ddlDay', '4');
//   await page.select('#_ctl0_ContentPlaceHolder_ddlTimeSpan', '22');
//   await page.evaluate(() => (
//     document.querySelector('#_ctl0_ContentPlaceHolder_btnSubmit').click()
//   ));
//   await page.waitForNavigation();
// };

// RUN ---------------------------------------------------------------------------------------------

if (!module.parent) {
  run({
    url: 'https://eklubkeno.etipos.sk/Archive.aspx',
    // before,
    extractDate,
    extractPicks,
  });
}

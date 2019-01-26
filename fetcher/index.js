const path = require('path');

const kafka = require('./common/kafka');
const { scheduleScraper } = require('./common/main');

const SCRAPERS = [
  'scrapers/FI/eurojackpot.js',
  'scrapers/GR/kino.js',
  'scrapers/HR/lotto-6-45.js',
  'scrapers/HR/lotto-7.js',
  'scrapers/IT/10elotto.js',
  'scrapers/IT/winforlife.js',
  'scrapers/PL/lotto.js',
  'scrapers/SK/keno.js',
];

/**
 * Go trough the list of scrapers import and schedule them.
 */
const startScrapers = () => {
  SCRAPERS.forEach((scraperPath) => {
    // eslint-disable-next-line import/no-dynamic-require,global-require
    const scraper = require(path.resolve(scraperPath));
    scheduleScraper(scraper, scraperPath);
  });
};


/**
 * Main routine which instantiates the kafka driver and scheduler
 */
(async () => {
  await kafka.initialize();
  console.log('Initialized kafka');

  startScrapers();
})();

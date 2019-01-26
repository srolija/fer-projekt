
const path = require('path');
const kafka = require('./common/kafka');
const { scheduleScraper } = require('./common/main');

const SCRAPER_PATH = 'scrapers/IT/10elotto.js';
const SCRAPER = require(path.resolve(SCRAPER_PATH));

(async () => {
  await kafka.initialize();
  scheduleScraper(SCRAPER, SCRAPER_PATH);
})();

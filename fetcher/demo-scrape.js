
const { fetchResults } = require('./common/process');

(async () => {
  console.log(await fetchResults(
    'IT:10_ELOTTO_5',
    'scrapers/IT/10elotto.js',
    new Date('2019-01-23T17:50:00.000'),
    50,
    5,
  ));
})();

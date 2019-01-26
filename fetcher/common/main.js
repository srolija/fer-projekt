
const kafkaMessages = require('./messages');
const { fetchResults } = require('./process');
const { schedule } = require('./schedule');

/**
 * Schedules the given scraper to run in the specified intervals.
 */
const scheduleScraper = ({
  lottoId,
  timezone,
  schedule: {
    scheduled,
    scheduledOffset,
    blocked,
    blockedOffset,
    picked,
  },
  retry,
}, scraperPath) => {
  console.log(`SCHEDULING: ${lottoId}`);

  // Schedule the event scheduled messages
  const scheduledHandler = (date) => {
    kafkaMessages.lotto.schedule(lottoId, date);
  };
  schedule(scheduled, scheduledHandler, scheduledOffset, timezone);

  // Schedule the event blocked messages
  const blockedHandler = (date) => {
    kafkaMessages.lotto.block(lottoId, date);
  };
  schedule(blocked, blockedHandler, blockedOffset, timezone);

  // Schedule scraping and result messages
  const pickedHandler = async (date) => {
    const result = await fetchResults(
      lottoId,
      scraperPath,
      date,
      retry.times,
      retry.wait,
    );

    switch (result.status) {
      case 'SUCCESS':
        kafkaMessages.lotto.pick(
          lottoId, date,
          result.data.picks,
          result.data.joker,
          result.data.extra,
        );
        break;

      case 'ERROR':
        kafkaMessages.error(lottoId, date, result);
        break;

      default:
        console.error(`Unknown status: ${result.status}`);
        break;
    }
  };
  schedule(picked, pickedHandler, 0, timezone);
};

module.exports = {
  scheduleScraper,
};

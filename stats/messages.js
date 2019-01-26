const kafka = require('./kafka');

const LOTTO_FEED_TOPIC = 'lotto-feed';
const LOTTO_ERROR_TOPIC = 'lotto-errors';

/**
 * Produce the scheduled message to kafka for given lotto.
 */
const schedule = (lottoId, date) => {
  const key = `${lottoId}:${date}`;
  const msg = {
    status: 'SCHEDULED',
    lottoId,
    date,
    // drawNo: drawNo,
  };
  kafka.produceMessage(LOTTO_FEED_TOPIC, key, msg);
  console.log(`SCHEDULED: ${lottoId} at ${date}`);
};

/**
 * Produce the bet blocked message to kafka for given lotto.
 * This is used to know at which point tickets wouldn't make any sense.
 */
const block = (lottoId, date, dateBlocked) => {
  const key = `${lottoId}:${date}`;
  const msg = {
    status: 'BLOCKED',
    lottoId,
    date,
    // drawNo: drawNo,
    dateBlocked,
  };
  kafka.produceMessage(LOTTO_FEED_TOPIC, key, msg);
  console.log(`BLOCKED: ${lottoId} at ${date}`);
};

/**
 * Produce the result message. It contains the result of given pick.
 */
const pick = (lottoId, date, picks, joker, extra) => {
  const key = `${lottoId}:${date}`;
  const msg = {
    status: 'PICKED',
    lottoId,
    date,
    // drawNo: drawNo,
    dateParsed: (new Date()).toISOString(),
    picks: picks || null,
    joker: joker || null,
    extra: extra || null,
  };
  kafka.produceMessage(LOTTO_FEED_TOPIC, key, msg);
  console.log(`PICKED: ${lottoId} at ${date}`, msg);
};

/**
 * Produce the error message. It contains why given event couldn't be scraped.
 */
const error = (lottoId, date, msg) => {
  const key = `${lottoId}:${date}`;
  kafka.produceMessage(LOTTO_ERROR_TOPIC, key, msg);
};

module.exports = {
  lotto: {
    schedule,
    block,
    pick,
  },
  error,
};

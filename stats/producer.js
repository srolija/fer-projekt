const Kafka = require('node-rdkafka');

const producer = new Kafka.Producer({
  'client.id': 'lotto-stats',
  'metadata.broker.list': 'localhost:9092',
});

/**
 * Initializes connection to kafka.
 */
const initialize = async () => {
  producer.connect();

  producer.on('event.error', (err) => {
    console.error('PRODUCER ERR:');
    console.error(err);
  });

  await new Promise((resolve) => {
    producer.on('ready', resolve);
  });
};

/**
 * Produces the given message to specified Kafka topic.
 * It will serialize the payload.
 */
const produceMessage = async (key, payload) => {
  producer.produce(
    'lotto-stats',
    null,
    Buffer.from(JSON.stringify(payload)),
    key,
    Date.now(),
  );
};

module.exports = {
  initialize,
  produceMessage,
};

const Kafka = require('node-rdkafka');

const LOTTO_FEED_TOPIC = 'lotto-feed';

const consumer = new Kafka.KafkaConsumer({
  'group.id': 'lotto-stats-1',
  'metadata.broker.list': 'localhost:9092',
}, {
  'enable.auto.commit': true,
  'auto.offset.reset': 'earliest',
});

const initialize = async () => new Promise((res) => {
  consumer.connect();
  consumer.on('ready', () => {
    consumer.subscribe([LOTTO_FEED_TOPIC]);
    setInterval(() => {
      consumer.consume(1);
    }, 100);
    res();
  });
  consumer.on('event', (err) => {
    console.error('EVENT:');
    console.error(err);
  });
  consumer.on('disconnected', (err) => {
    console.error('DISCONNECTED:');
    console.error(err);
  });
  consumer.on('event.error', (err) => {
    console.error('EVENT.ERROR:');
    console.error(err);
  });
  consumer.on('event.throttle', (err) => {
    console.error('EVENT.THROTTLE:');
    console.error(err);
  });
});

module.exports = {
  initialize,
  lottoFeed: consumer,
};

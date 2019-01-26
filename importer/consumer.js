

const lottoFeed = consumer.createReadStream({
  'client.id': 'lotto-stats',
  'metadata.broker.list': 'localhost:9092',
  'enable.auto.commit': true,
  'dr_cb': true,
}, {}, {
  topics: ['lotto-feed'],
});

const consumeFeed = async () => {
stream.on('data', function(message) {
  console.log('Got message');
  console.log(message.value.toString());
});

module.exports = {
  lottoFeed,
};

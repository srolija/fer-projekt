const mongo = require('./common/mongo');
const feedConsumer = require('./consumer');
const statsProducer = require('./producer');
const { Draw } = require('./common/models');
const { calculateStats } = require('./calculate');

(async () => {
  await mongo.initialize();
  console.log('Connected to MongoDB');

  await feedConsumer.initialize();
  await statsProducer.initialize();
  console.log('Connected to Kafka');

  // Read message from lotto feed
  feedConsumer.lottoFeed.on('data', async (msg) => {
    const key = msg.key.toString();
    const event = JSON.parse(msg.value.toString());

    console.log(`DATA: ${event.lottoId}`);

    if (event.status === 'PICKED') {
      const lottoId = event.lottoId;
      const date = event.date;

      // Insert into mongo
      const newStat = new Draw({
        lottoId,
        date: new Date(event.date),
        numbers: event.picks,
      });

      await newStat.save();
      const stats = await calculateStats(lottoId, date);
      console.log(stats);

      // Push updated stats
      statsProducer.produceMessage(key, {
        lottoId,
        date,
        numbers: stats,
      });
    }

    feedConsumer.lottoFeed.consume(1, (err, msg) => {
      console.error("Cg:", err, msg);
    });
    feedConsumer.lottoFeed.commit();

  });
})();

const Kafka = require('node-rdkafka');

const LOTTO_FEED_TOPIC = 'test';

const consumer = new Kafka.KafkaConsumer({
  'debug': 'all',
  'group.id': 'test-05',
  'metadata.broker.list': 'localhost:9092',
  'event_cb': true,
  'rebalance_cb': function(err, assignment) {
    console.log("ASSIGN:", assignment);
    if (err.code === Kafka.CODES.ERRORS.ERR__ASSIGN_PARTITIONS) {
      // Note: this can throw when you are disconnected. Take care and wrap it in
      // a try catch if that matters to you
      this.assign(assignment);
    } else if (err.code === Kafka.CODES.ERRORS.ERR__REVOKE_PARTITIONS) {
      // Same as above
      this.unassign();
    } else {
      // We had a real error
      console.error("REAL: ", err);
    }
  },
  'offset_commit_cb': (err, topicPartitions) => {
    if (err) {
      // There was an error committing
      console.error("COMMIT_ERR", err);
    } else {
      // Commit went through. Let's log the topic partitions
      console.log("PARTITIONS:", topicPartitions);
    }
  },
  'enable.auto.commit': true,
  'offset.store.method': 'broker',
}, {
  'auto.offset.reset': 'earliest',
});

const initialize = async () => new Promise((res) => {
  consumer.connect();
  consumer.on('ready', () => {
    consumer.subscribe([LOTTO_FEED_TOPIC]);
    // consumer.consume(1);
    setInterval(() => {
      consumer.consume(1, (err, msg) => {
        console.error("C1:", err, msg);
      });
    }, 1000);
    res();
  });
  consumer.on('event', (err) => {
    console.error('EVENT:');
    console.error(err);
  });
  consumer.on('disconnected', (err) => {
    console.error('disconnected:');
    console.error(err);
  });
  consumer.on('event.error', (err) => {
    console.error('event.error:');
    console.error(err);
  });
  consumer.on('event.throttle', (err) => {
    console.error('event.throttle:');
    console.error(err);
  });
});

(async () => {
  await initialize();

  consumer.on('data', async (msg) => {
    const key = msg.key.toString();
    const event = msg.value.toString();

    console.log(`DATA: ${event}`);

    consumer.consume(1, (err, msg) => {
      console.error("Cg:", err, msg);
    });
    consumer.commit(msg);
  });
})();

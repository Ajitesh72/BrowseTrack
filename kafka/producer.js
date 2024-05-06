const fs = require('fs');
const csv = require('csv-parser');

const kafka = require('kafka-node');
const Producer = kafka.Producer;
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const producer = new Producer(client);

function publishToKafka(topic, messages) {
  return new Promise((resolve, reject) => {
    producer.send([{ topic, messages }], (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

producer.on('ready', async () => {
  console.log('Producer is ready');

  const messages = [];
  fs.createReadStream('./data/CIDDS-001-external-week1.csv')
    .pipe(csv())
    .on('data', (row) => {
      const message = JSON.stringify(row);
      messages.push(message);
    })
    .on('end', async () => {
      console.log(`Read ${messages.length} messages from CSV file`);

      // Publishing messages to Kafka topic in batches
      const batchSize = 1000; // Adjust batch size as needed
      for (let i = 0; i < messages.length; i += batchSize) {
        const batchMessages = messages.slice(i, i + batchSize);
        try {
          await publishToKafka('server-trial', batchMessages);
          console.log(`Published batch ${i / batchSize + 1}/${Math.ceil(messages.length / batchSize)}`);
        } catch (err) {
          console.error('Error publishing batch:', err);
        }
      }

      console.log('CSV file successfully processed');
    });
});

producer.on('error', (err) => {
  console.error('Producer error:', err);
});

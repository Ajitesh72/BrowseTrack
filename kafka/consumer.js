const kafka = require('kafka-node');
const { Client } = require('@elastic/elasticsearch');

// Elasticsearch client configuration
const esClient = new Client({ node: 'http://localhost:9200' });

// Kafka consumer configuration
const Consumer = kafka.Consumer;
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const consumer = new Consumer(
  client,
  [{ topic: 'server-trial', partition: 0 }],
  { autoCommit: true }
);

// Function to index data into Elasticsearch
async function indexToElasticsearch(message) {
  try {
    // Assuming message.value contains the JSON data from Kafka
    const jsonData = JSON.parse(message.value);

    // Indexing the JSON data into Elasticsearch
    const { body: indexResponse } = await esClient.index({
      index: 'server-trial', // Specify your Elasticsearch index name
      body: jsonData
    });

    console.log('Indexed message:', indexResponse);
  } catch (error) {
    console.error('Error indexing message to Elasticsearch:', error);
  }
}

// Event listeners for Kafka consumer
consumer.on('message', async (message) => {
  // Process messages asynchronously and index them into Elasticsearch
  try {
    await indexToElasticsearch(message);
  } catch (err) {
    console.error('Error processing message:', err);
    // Implement error handling and retries if needed
  }
});

consumer.on('error', (err) => {
  console.error('Consumer error:', err);
});

process.on('SIGINT', () => {
  consumer.close(true, () => {
    process.exit();
  });
});

const { Client } = require('@elastic/elasticsearch');

// Elasticsearch client configuration
const client = new Client({ node: 'http://localhost:9200' });

// Function to perform a search query
async function performSearchQuery() {
    try {
        // Define your query here
        const query = {
            query: {
                match_all: {}  // Match all documents
            }
        };

        // Execute the search query
        const searchResponse= await client.search({
            index: 'server-trial',  // Specify the index to search
            body: query
        });


        // Output the search results
        console.log('Search results:');
        console.log(searchResponse.hits.hits);
    } catch (error) {
        console.error('Error performing search query:', error);
    }
}

// Invoke the function to perform the search query
performSearchQuery();
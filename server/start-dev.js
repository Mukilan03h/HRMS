// This script is for development use. It starts an in-memory MongoDB server
// and then launches the main application, so no external DB is required.

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

async function startDevServer() {
  console.log('Starting development server setup...');

  // This will create an new instance of "MongoMemoryServer" and automatically start it
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Set the MONGO_URI environment variable so our app can connect to the in-memory database
  process.env.MONGO_URI = mongoUri;

  console.log(`In-memory MongoDB started at: ${mongoUri}`);
  console.log('Starting the main application...');

  // Now that the environment variable is set, we can start the main app.
  // The main app (index.js) will read this environment variable.
  require('./index.js');
}

startDevServer().catch(error => {
  console.error('Failed to start development server:', error);
  process.exit(1);
});

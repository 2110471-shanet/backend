// server.js
import dotenv from 'dotenv';
import startServer from './src/app.js';

// Load environment variables
dotenv.config({
  path: [
    './.env',
    './.env.production',
    './.env.development',
  ]
});

// Start the server
startServer();
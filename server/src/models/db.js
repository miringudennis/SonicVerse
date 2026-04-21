const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

console.log('SonicVerse: Connecting to Database...');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('SonicVerse: Database connection error!', err.stack);
  }
  console.log('SonicVerse: Database connected successfully.');
  release();
});

module.exports = {
  query: (text, params) => {
    console.log('SonicVerse DB Query:', text, params || '');
    return pool.query(text, params);
  },
};

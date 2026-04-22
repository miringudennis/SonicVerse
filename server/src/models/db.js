const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

console.log('Zynk: Initializing Database Connections...');

// Local Database Pool
const localPool = new Pool({
  connectionString: process.env.LOCAL_DATABASE_URL,
});

// Supabase Database Pool
const supabasePool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Test connections
localPool.connect((err) => {
  if (err) console.error('Zynk: Local DB connection error!', err.stack);
  else console.log('Zynk: Local DB connected successfully.');
});

supabasePool.connect((err) => {
  if (err) console.error('Zynk: Supabase DB connection error!', err.stack);
  else console.log('Zynk: Supabase DB connected successfully.');
});

module.exports = {
  // Default query uses Supabase, but you can specify which pool to use
  query: (text, params, useLocal = false) => {
    const pool = useLocal ? localPool : supabasePool;
    console.log(`Zynk DB Query [${useLocal ? 'Local' : 'Supabase'}]:`, text, params || '');
    return pool.query(text, params);
  },
  localPool,
  supabasePool,
};

const { Pool } = require('pg');
require('dotenv').config();

console.log('SonicVerse: Initializing Database Connections...');

let localPool = null;
let supabasePool = null;

// Initialize Local Database Pool (Only if URL is provided)
if (process.env.LOCAL_DATABASE_URL) {
  localPool = new Pool({
    connectionString: process.env.LOCAL_DATABASE_URL,
  });
  localPool.on('error', (err) => console.error('Zynk: Local DB Pool Error', err));
  console.log('Zynk: Local DB pool initialized.');
}

// Initialize Supabase Database Pool
if (process.env.DATABASE_URL) {
  try {
    const hostInfo = process.env.DATABASE_URL.includes('@') 
      ? process.env.DATABASE_URL.split('@')[1] 
      : 'hidden_host';
    console.log('Zynk: Initializing Supabase Pool with URL:', hostInfo);
    
    supabasePool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      max: 20,
    });
    supabasePool.on('error', (err) => console.error('Zynk: Supabase DB Pool Error', err));
  } catch (err) {
    console.error('Zynk: Failed to initialize Supabase Pool:', err.message);
  }
} else {
  console.warn('Zynk: DATABASE_URL is missing. Supabase connection will not be available.');
}

module.exports = {
  query: async (text, params, useLocal = false) => {
    const pool = useLocal ? localPool : supabasePool;
    
    if (!pool) {
      throw new Error(`Database pool [${useLocal ? 'Local' : 'Supabase'}] is not initialized.`);
    }

    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error(`Zynk DB Query Error [${useLocal ? 'Local' : 'Supabase'}]:`, err.message);
      throw err;
    }
  },
  getClient: async (useLocal = false) => {
    const pool = useLocal ? localPool : supabasePool;
    if (!pool) throw new Error(`Database pool [${useLocal ? 'Local' : 'Supabase'}] is not initialized.`);
    return await pool.connect();
  },
  localPool,
  supabasePool,
};

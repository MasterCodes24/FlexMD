require('dotenv').config();
const { Pool } = require('pg');

const isCloud = process.env.DATABASE_URL && (
  process.env.DATABASE_URL.includes('neon.tech') ||
  process.env.DATABASE_URL.includes('supabase') ||
  process.env.DATABASE_URL.includes('render.com') ||
  process.env.DATABASE_URL.includes('railway') ||
  process.env.DATABASE_URL.includes('sslmode=require')
);

module.exports = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isCloud ? { ssl: { rejectUnauthorized: false } } : {})
});

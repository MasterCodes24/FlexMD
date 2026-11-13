require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function runSchema() {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('user:password')) {
    console.error('❌ Error: DATABASE_URL is not configured yet in backend/.env');
    console.error('Please put your actual PostgreSQL connection string in backend/.env first.');
    process.exit(1);
  }

  try {
    console.log('🔄 Connecting to database...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    console.log('⚡ Running schema.sql to create tables...');
    await pool.query(schemaSql);
    
    console.log('✅ Database tables created successfully!');
    console.log('Tables initialized: clinics, patients, visits, payments, inventory_items');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to run schema:', err.message);
    process.exit(1);
  }
}

runSchema();


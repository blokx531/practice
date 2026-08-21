const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const dbPassword = 'sb_secret_jdi0lfN7hSIWCW8Kc1Peow_Gh1ZVpY3';
const connectionString = `postgresql://postgres:${dbPassword}@db.odjctiaelhagzqyiphhw.supabase.co:5432/postgres`;

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    await client.connect();
    console.log("Connected to Supabase DB.");
    
    const sqlPath = path.resolve(__dirname, '../supabase/migrations/00001_initial_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await client.query(sql);
    console.log("Migration executed successfully.");
    
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.end();
  }
}

runMigration();

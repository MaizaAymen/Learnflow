/**
 * List all PostgreSQL databases and their tables
 */

const { Client } = require('pg');

const DB_USER = 'postgres';
const DB_PASSWORD = 'aymen';
const DB_HOST = 'localhost';
const DB_PORT = 5432;

async function checkDatabase(dbName) {
  const client = new Client({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: DB_PORT,
    database: dbName
  });

  try {
    await client.connect();
    
    // Get all tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const tables = [];
    for (const row of result.rows) {
      const countResult = await client.query(`SELECT COUNT(*) FROM ${row.table_name}`);
      tables.push({
        name: row.table_name,
        count: parseInt(countResult.rows[0].count)
      });
    }

    await client.end();
    return tables;
  } catch (error) {
    await client.end().catch(() => {});
    return null;
  }
}

async function main() {
  console.log('\n🔍 SCANNING LOCAL POSTGRESQL DATABASES\n');
  
  // Try to connect to postgres database to list all databases
  const client = new Client({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: DB_PORT,
    database: 'postgres'
  });

  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT datname 
      FROM pg_database 
      WHERE datistemplate = false 
      AND datname NOT IN ('postgres')
      ORDER BY datname;
    `);

    await client.end();

    console.log('📊 Found databases:\n');
    
    for (const row of result.rows) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📁 Database: ${row.datname}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
      
      const tables = await checkDatabase(row.datname);
      
      if (tables === null) {
        console.log('  ⚠️  Could not access this database\n');
        continue;
      }
      
      if (tables.length === 0) {
        console.log('  📭 No tables found\n');
        continue;
      }

      let totalRecords = 0;
      tables.forEach(table => {
        console.log(`  📋 ${table.name.padEnd(30)} ${table.count.toString().padStart(6)} records`);
        totalRecords += table.count;
      });
      
      console.log(`  ${'─'.repeat(40)}`);
      console.log(`  📦 Total records: ${totalRecords}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Scan completed!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nMake sure PostgreSQL is running and credentials are correct.\n');
    await client.end().catch(() => {});
    process.exit(1);
  }
}

main();

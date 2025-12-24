/**
 * Check Local Database Tables
 */

const { Client } = require('pg');

const LOCAL_DB = "postgresql://postgres:aymen@localhost:5432/auth_service";

async function main() {
  const client = new Client({ connectionString: LOCAL_DB });
  
  try {
    console.log('\n🔍 Connecting to local database...\n');
    await client.connect();
    console.log('✅ Connected!\n');

    // Get all tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('📊 Tables in your local database:\n');
    
    if (result.rows.length === 0) {
      console.log('  ⚠️  No tables found!\n');
    } else {
      result.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.table_name}`);
      });
      console.log('');
    }

    // Get row counts for each table
    console.log('📈 Data counts:\n');
    for (const row of result.rows) {
      const countResult = await client.query(`SELECT COUNT(*) FROM ${row.table_name}`);
      console.log(`  ${row.table_name}: ${countResult.rows[0].count} records`);
    }

    await client.end();
    console.log('\n✅ Check completed!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nPossible issues:');
    console.error('  - Database credentials incorrect');
    console.error('  - Database not running');
    console.error('  - Wrong database name\n');
    await client.end().catch(() => {});
    process.exit(1);
  }
}

main();

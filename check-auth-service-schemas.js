/**
 * Check all schemas and tables in auth_service database
 */

const { Client } = require('pg');

const DB_URL = "postgresql://postgres:aymen@localhost:5432/auth_service";

async function main() {
  const client = new Client({ connectionString: DB_URL });
  
  try {
    console.log('\n🔍 CHECKING AUTH_SERVICE DATABASE\n');
    await client.connect();
    console.log('✅ Connected!\n');

    // Get all schemas
    const schemasResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name;
    `);

    console.log('📁 Schemas found:\n');
    schemasResult.rows.forEach(row => {
      console.log(`  - ${row.schema_name}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // For each schema, get tables
    for (const schemaRow of schemasResult.rows) {
      const schema = schemaRow.schema_name;
      
      console.log(`\n📂 SCHEMA: ${schema}`);
      console.log(`${'═'.repeat(60)}\n`);

      // Get all tables in this schema
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `, [schema]);

      if (tablesResult.rows.length === 0) {
        console.log('  📭 No tables\n');
        continue;
      }

      let totalRecords = 0;

      for (const tableRow of tablesResult.rows) {
        const tableName = tableRow.table_name;
        const fullTableName = `"${schema}"."${tableName}"`;

        // Get count
        const countResult = await client.query(`SELECT COUNT(*) FROM ${fullTableName}`);
        const count = parseInt(countResult.rows[0].count);
        totalRecords += count;

        console.log(`  📋 ${tableName.padEnd(35)} ${count.toString().padStart(6)} records`);

        // If table has data, show sample
        if (count > 0 && count <= 5) {
          const sampleResult = await client.query(`SELECT * FROM ${fullTableName} LIMIT 3`);
          console.log(`      Sample data:`);
          sampleResult.rows.forEach((row, idx) => {
            console.log(`      ${idx + 1}.`, JSON.stringify(row, null, 2).substring(0, 200));
          });
        } else if (count > 0) {
          // Show columns
          const columnsResult = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = $1 AND table_name = $2
            ORDER BY ordinal_position;
          `, [schema, tableName]);
          
          const columns = columnsResult.rows.map(r => `${r.column_name}:${r.data_type}`).join(', ');
          console.log(`      Columns: ${columns}`);
        }
        console.log('');
      }

      console.log(`  ${'─'.repeat(44)}`);
      console.log(`  📦 Total records in schema: ${totalRecords}\n`);
    }

    await client.end();
    console.log('✅ Analysis completed!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

main();

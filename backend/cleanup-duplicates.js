const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'learnflow',
  user: 'postgres',
  password: 'root'
});

async function cleanup() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Delete duplicate absence records, keeping only the first one for each schedule_id + student_id combination
    const result = await client.query(`
      DELETE FROM referentiels.student_absence s1
      WHERE s1.id NOT IN (
        SELECT MIN(s2.id) FROM referentiels.student_absence s2
        GROUP BY s2.schedule_id, s2.student_id
      )
    `);

    console.log(`✅ Deleted ${result.rowCount} duplicate absence records`);

    // Show current state
    const countResult = await client.query(`
      SELECT schedule_id, student_id, COUNT(*) as count
      FROM referentiels.student_absence
      GROUP BY schedule_id, student_id
      HAVING COUNT(*) > 1
    `);

    if (countResult.rows.length > 0) {
      console.log('⚠️ Still have duplicates:');
      console.log(countResult.rows);
    } else {
      console.log('✅ No duplicates remaining');
    }

    await client.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

cleanup();
